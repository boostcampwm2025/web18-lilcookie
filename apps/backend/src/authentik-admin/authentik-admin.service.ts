import { Injectable, InternalServerErrorException, Inject, type LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import * as crypto from "crypto";
import { retryWithBackoff, throwOnAxiosError } from "../common/http.operators";
import type {
  CreateOAuthProviderParams,
  CreateOAuthProviderResult,
  CreateApplicationParams,
  CreateApplicationResult,
  CreateOAuthAppResult,
  AuthentikOAuth2ProviderResponse,
  AuthentikApplicationResponse,
  AuthentikFlowListResponse,
  AuthentikCertificateKeyPairResponse,
  AuthentikCertificateKeyPairListResponse,
  AuthentikPropertyMappingListResponse,
} from "./types/authentik-admin.types";
import { MAX_RETRIES, CERTIFICATE_VALIDITY_DAYS } from "./constants/authentik-admin.constants";

@Injectable()
export class AuthentikAdminService {
  private readonly adminUrl: string;
  private readonly adminToken: string;
  private readonly authorizationFlowSlug: string;
  private readonly invalidationFlowSlug: string;

  // 캐시된 Flow 및 Property Mapping IDs
  private authorizationFlowId: string | null = null;
  private invalidationFlowId: string | null = null;
  private signingKeyId: string | null = null;
  private propertyMappingIds: string[] | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {
    this.adminUrl = this.configService.getOrThrow<string>("AUTHENTIK_ADMIN_URL");
    this.adminToken = this.configService.getOrThrow<string>("AUTHENTIK_ADMIN_TOKEN");
    this.authorizationFlowSlug = this.configService.getOrThrow<string>("AUTHENTIK_AUTHORIZATION_FLOW_SLUG");
    this.invalidationFlowSlug = this.configService.getOrThrow<string>("AUTHENTIK_INVALIDATION_FLOW_SLUG");
  }

  /**
   * OAuth2 Provider와 Application을 함께 생성
   */
  async createOAuthApp(params: CreateOAuthProviderParams): Promise<CreateOAuthAppResult> {
    const providerResult = await this.createOAuth2Provider(params);

    const slug = providerResult.issuer.split("/o/")[1].replace("/", "");
    const appResult = await this.createApplication({
      name: params.name,
      slug,
      providerId: providerResult.providerId,
    });

    return {
      providerId: providerResult.providerId,
      applicationId: appResult.applicationId,
      clientId: providerResult.clientId,
      clientSecret: providerResult.clientSecret,
      issuer: providerResult.issuer,
      jwksUrl: providerResult.jwksUrl,
    };
  }

  /**
   * OAuth2 Provider 생성
   */
  private async createOAuth2Provider(params: CreateOAuthProviderParams): Promise<CreateOAuthProviderResult> {
    await this.ensureFlowsAndMappingsLoaded();

    const slug = this.generateSlug(params.name);
    const signingKeyId = await this.createCertificateKeyPair(params.name);

    const requestBody = {
      name: params.name,
      slug,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      client_type: "confidential",
      redirect_uris: params.redirectUris.map((uri) => ({
        matching_mode: "strict",
        url: uri,
      })),
      authorization_flow: this.authorizationFlowId,
      invalidation_flow: this.invalidationFlowId,
      signing_key: signingKeyId,
      property_mappings: this.propertyMappingIds,
      sub_mode: "user_uuid",
      access_token_validity: "hours=1",
      refresh_token_validity: "days=30",
    };

    this.logger.log(`Authentik OAuth2 Provider 생성 요청: ${params.name} (slug: ${slug})`);

    const { data } = await firstValueFrom(
      this.httpService
        .post<AuthentikOAuth2ProviderResponse>(`${this.adminUrl}/providers/oauth2/`, requestBody, {
          headers: this.getAuthHeaders(),
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Authentik OAuth2 Provider 생성 실패"),
        ),
    );

    this.logger.log(`Authentik OAuth2 Provider 생성 완료: pk=${data.pk}, slug=${slug}`);

    const issuer = `https://auth.localhost/application/o/${slug}/`;
    const jwksUrl = `https://auth.localhost/application/o/${slug}/jwks/`;

    return {
      providerId: data.pk,
      clientId: data.client_id,
      clientSecret: data.client_secret,
      issuer,
      jwksUrl,
    };
  }

  /**
   * Application 생성
   */
  private async createApplication(params: CreateApplicationParams): Promise<CreateApplicationResult> {
    const requestBody = {
      name: params.name,
      slug: params.slug,
      provider: params.providerId,
    };

    this.logger.log(`Authentik Application 생성 요청: ${params.name}`);

    const { data } = await firstValueFrom(
      this.httpService
        .post<AuthentikApplicationResponse>(`${this.adminUrl}/core/applications/`, requestBody, {
          headers: this.getAuthHeaders(),
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Authentik Application 생성 실패"),
        ),
    );

    this.logger.log(`Authentik Application 생성 완료: pk=${data.pk}`);

    return {
      applicationId: data.pk,
      slug: data.slug,
    };
  }

  /**
   * OAuth2 Provider 삭제
   */
  async deleteOAuth2Provider(providerId: number): Promise<void> {
    this.logger.log(`Authentik OAuth2 Provider 삭제 요청: pk=${providerId}`);

    await firstValueFrom(
      this.httpService
        .delete(`${this.adminUrl}/providers/oauth2/${providerId}/`, {
          headers: this.getAuthHeaders(),
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Authentik OAuth2 Provider 삭제 실패"),
        ),
    );

    this.logger.log(`Authentik OAuth2 Provider 삭제 완료: pk=${providerId}`);
  }

  /**
   * Application 삭제
   */
  async deleteApplication(applicationId: string): Promise<void> {
    this.logger.log(`Authentik Application 삭제 요청: pk=${applicationId}`);

    await firstValueFrom(
      this.httpService
        .delete(`${this.adminUrl}/core/applications/${applicationId}/`, {
          headers: this.getAuthHeaders(),
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Authentik Application 삭제 실패"),
        ),
    );

    this.logger.log(`Authentik Application 삭제 완료: pk=${applicationId}`);
  }

  /**
   * Flow와 Property Mapping ID를 로드 (캐싱)
   */
  private async ensureFlowsAndMappingsLoaded(): Promise<void> {
    if (this.authorizationFlowId && this.invalidationFlowId && this.signingKeyId && this.propertyMappingIds) {
      return;
    }

    if (!this.authorizationFlowId) {
      this.authorizationFlowId = await this.getFlowIdBySlug(this.authorizationFlowSlug);
    }

    if (!this.invalidationFlowId) {
      this.invalidationFlowId = await this.getFlowIdBySlug(this.invalidationFlowSlug);
    }

    if (!this.signingKeyId) {
      this.signingKeyId = await this.getDefaultSigningKey();
    }

    if (!this.propertyMappingIds) {
      this.propertyMappingIds = await this.getRequiredPropertyMappings();
    }
  }

  /**
   * Flow slug로 Flow ID 조회
   */
  private async getFlowIdBySlug(slug: string): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<AuthentikFlowListResponse>(`${this.adminUrl}/flows/instances/`, {
          headers: this.getAuthHeaders(),
          params: { slug },
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, `Flow 조회 실패: ${slug}`),
        ),
    );

    if (data.results.length === 0) {
      throw new InternalServerErrorException(`Flow를 찾을 수 없습니다: ${slug}`);
    }

    return data.results[0].pk;
  }

  /**
   * 기본 Signing Key 조회
   */
  private async getDefaultSigningKey(): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<AuthentikCertificateKeyPairListResponse>(`${this.adminUrl}/crypto/certificatekeypairs/`, {
          headers: this.getAuthHeaders(),
          params: { name: "authentik Self-signed Certificate" },
        })
        .pipe(retryWithBackoff(MAX_RETRIES), throwOnAxiosError(InternalServerErrorException, "Signing Key 조회 실패")),
    );

    if (data.results.length === 0) {
      throw new InternalServerErrorException("기본 Signing Key를 찾을 수 없습니다");
    }

    return data.results[0].pk;
  }

  /**
   * Provider별 Certificate Key Pair 생성
   */
  private async createCertificateKeyPair(providerName: string): Promise<string> {
    const certificateName = `${providerName}-signing-key-${Date.now()}`;

    this.logger.log(`Certificate Key Pair 생성 요청: ${certificateName}`);

    const { data } = await firstValueFrom(
      this.httpService
        .post<AuthentikCertificateKeyPairResponse>(
          `${this.adminUrl}/crypto/certificatekeypairs/generate/`,
          {
            common_name: certificateName,
            validity_days: CERTIFICATE_VALIDITY_DAYS,
          },
          {
            headers: this.getAuthHeaders(),
          },
        )
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Certificate Key Pair 생성 실패"),
        ),
    );

    this.logger.log(`Certificate Key Pair 생성 완료: pk=${data.pk}`);

    return data.pk;
  }

  /**
   * 필요한 Property Mappings 조회
   */
  private async getRequiredPropertyMappings(): Promise<string[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<AuthentikPropertyMappingListResponse>(`${this.adminUrl}/propertymappings/provider/scope/`, {
          headers: this.getAuthHeaders(),
          params: { page_size: 100 },
        })
        .pipe(
          retryWithBackoff(MAX_RETRIES),
          throwOnAxiosError(InternalServerErrorException, "Property Mappings 조회 실패"),
        ),
    );

    const requiredScopes = [
      "openid",
      "profile",
      "email",
      "offline_access",
      "links:read",
      "links:write",
      "folders:read",
      "folders:write",
      "ai:use",
    ];

    const mappingIds = data.results
      .filter((mapping) => requiredScopes.includes(mapping.scope_name))
      .map((mapping) => mapping.pk);

    this.logger.log(`Property Mappings 로드 완료: ${mappingIds.length}개`);

    return mappingIds;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.adminToken}`,
      "Content-Type": "application/json",
    };
  }

  private generateSlug(name: string): string {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30);

    const randomSuffix = crypto.randomBytes(4).toString("hex");
    return `${sanitized}-${randomSuffix}`;
  }

  generateClientId(): string {
    return crypto.randomUUID();
  }

  generateClientSecret(): string {
    return crypto.randomBytes(32).toString("base64url");
  }
}

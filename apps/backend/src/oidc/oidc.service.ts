import { Injectable, UnauthorizedException, Inject, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import * as jose from "jose";
import { retryWithBackoff, throwOnAxiosError } from "../common/http.operators";
import { OidcAccessTokenPayloadSchema, type OidcAccessTokenPayload, type JWKSResponse } from "./types/oidc.types";
import { JWKS_CACHE_DURATION_MS, JWKS_MAX_RETRIES, ISSUER_SLUG_PATTERN } from "./constants/oidc.constants";
import { OAuthAppRepository } from "../oauth-apps/repositories/oauth-app.repository";

@Injectable()
export class OidcService {
  private readonly jwksUrl: string;
  private readonly issuer: string;
  private readonly audience: string;
  private cachedJwks: JWKSResponse | null = null;
  private cacheExpiry = 0;
  private jwksFetchPromise: Promise<JWKSResponse> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => OAuthAppRepository))
    private readonly oauthAppRepository: OAuthAppRepository,
  ) {
    this.jwksUrl = this.configService.getOrThrow<string>("AUTHENTIK_JWKS_URL");
    this.issuer = this.configService.getOrThrow<string>("AUTHENTIK_ISSUER");
    this.audience = this.configService.getOrThrow<string>("AUTHENTIK_AUDIENCE");
  }

  /**
   * 토큰 검증 및 페이로드 반환 (issuer를 토큰에서 추출하여 동적 검증)
   */
  async validateTokenWithIssuer(token: string): Promise<OidcAccessTokenPayload> {
    const { iss: tokenIssuer } = jose.decodeJwt(token);

    if (!tokenIssuer) {
      return this.validateToken(token);
    }

    const slug = tokenIssuer.match(ISSUER_SLUG_PATTERN)?.[1];
    if (!slug) {
      return this.validateToken(token);
    }

    const oauthApp = await this.oauthAppRepository.findJwksUrlBySlug(slug);
    if (!oauthApp) {
      return this.validateToken(token);
    }

    // 토큰의 원본 issuer를 사용 (Docker/localhost 도메인 차이 문제 해결)
    // jwksUrl은 slug 기반으로 동적 생성하여 현재 환경에 맞게 접근
    // 동적 OAuth App 토큰은 audience가 client_id이므로 검증 건너뛰기
    const dynamicJwksUrl = this.buildJwksUrlFromTokenIssuer(tokenIssuer);
    return this.validateToken(token, tokenIssuer, dynamicJwksUrl, true);
  }

  /**
   * 토큰의 issuer에서 JWKS URL 생성
   */
  private buildJwksUrlFromTokenIssuer(issuer: string): string {
    // issuer가 /로 끝나면 그대로, 아니면 / 추가 후 jwks/ 붙임
    const base = issuer.endsWith("/") ? issuer : `${issuer}/`;
    return `${base}jwks/`;
  }

  /**
   * 토큰 검증 및 페이로드 반환
   * @param skipAudienceCheck 동적 OAuth App 토큰의 경우 audience 검증 건너뛰기
   */
  async validateToken(
    token: string,
    issuer?: string,
    jwksUrl?: string,
    skipAudienceCheck = false,
  ): Promise<OidcAccessTokenPayload> {
    try {
      const header = jose.decodeProtectedHeader(token);
      if (!header.kid) {
        throw new UnauthorizedException("유효하지 않은 토큰: kid가 없습니다.");
      }

      // 동적 issuer/jwksUrl 사용 (제공되지 않으면 기본값 사용)
      const targetIssuer = issuer || this.issuer;
      const targetJwksUrl = jwksUrl || this.jwksUrl;

      const publicKey = await this.getPublicKey(header.kid, targetJwksUrl);

      // 동적 OAuth App 토큰은 audience가 client_id이므로 검증 건너뛰기
      const verifyOptions: jose.JWTVerifyOptions = {
        issuer: targetIssuer,
      };
      if (!skipAudienceCheck) {
        verifyOptions.audience = this.audience;
      }

      const { payload } = await jose.jwtVerify(token, publicKey, verifyOptions);

      return this.validatePayload(payload);
    } catch (error) {
      if (error instanceof jose.errors.JOSEError) {
        throw new UnauthorizedException("유효하지 않은 토큰 서명입니다.");
      }
      // 기타 오류 처리
      throw new UnauthorizedException(`토큰 검증 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 캐시된 JWKS에서 공개 키를 가져오거나, 없으면 원격에서 가져옴
   */
  private async getPublicKey(kid: string, jwksUrl?: string): Promise<CryptoKey | Uint8Array> {
    const targetJwksUrl = jwksUrl || this.jwksUrl;
    const now = Date.now();

    // 기본 JWKS URL을 사용하는 경우 캐시 활용
    if (targetJwksUrl === this.jwksUrl && this.cachedJwks && now < this.cacheExpiry) {
      const key = this.cachedJwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }
      return jose.importJWK(key);
    }

    // 동적 JWKS URL인 경우 캐시 없이 직접 fetch
    if (targetJwksUrl !== this.jwksUrl) {
      const jwks = await this.fetchJwksWithRetry(targetJwksUrl);
      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }
      return jose.importJWK(key);
    }

    // 진행 중인 JWKS fetch가 있으면 대기
    if (this.jwksFetchPromise) {
      const jwks = await this.jwksFetchPromise;
      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }
      return jose.importJWK(key);
    }

    // 새로운 JWKS fetch 시작
    this.jwksFetchPromise = this.fetchJwksWithRetry(targetJwksUrl);

    try {
      const jwks = await this.jwksFetchPromise;
      this.cachedJwks = jwks;
      this.cacheExpiry = now + JWKS_CACHE_DURATION_MS;
      this.jwksFetchPromise = null;

      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }
      return jose.importJWK(key);
    } catch (error) {
      this.jwksFetchPromise = null;
      throw error;
    }
  }

  /**
   * 토큰 페이로드 유효성 검사
   */
  private validatePayload(payload: jose.JWTPayload): OidcAccessTokenPayload {
    const result = OidcAccessTokenPayloadSchema.safeParse(payload);
    if (!result.success) {
      const errorMessage = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new UnauthorizedException(`유효하지 않은 토큰 페이로드: ${errorMessage}`);
    }

    return result.data;
  }

  /**
   * JWKS를 지수 백오프로 가져오기
   */
  private async fetchJwksWithRetry(url: string): Promise<JWKSResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<JWKSResponse>(url)
        .pipe(retryWithBackoff(JWKS_MAX_RETRIES), throwOnAxiosError(UnauthorizedException, "JWKS 가져오기 실패")),
    );
    return data;
  }
}

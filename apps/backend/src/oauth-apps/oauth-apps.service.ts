import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { OAuthAppRepository } from "./repositories/oauth-app.repository";
import { AuthentikAdminService } from "../authentik-admin/authentik-admin.service";
import { OAuthAppResponseDto, OAuthAppCreatedResponseDto } from "./dto/oauth-app.response.dto";
import { MAX_OAUTH_APPS_PER_USER, DEFAULT_SCOPES } from "./constants/oauth-apps.constants";

@Injectable()
export class OAuthAppsService {
  constructor(
    private readonly oauthAppRepository: OAuthAppRepository,
    private readonly authentikAdminService: AuthentikAdminService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * OAuth App 생성
   * @param name 앱 이름
   * @param redirectUris Redirect URIs
   * @param userId 요청자 ID
   * @returns 생성된 OAuth App (Secret 포함)
   */
  async create(name: string, redirectUris: string[], userId: number): Promise<OAuthAppCreatedResponseDto> {
    // 사용자당 앱 개수 제한 확인
    const appCount = await this.oauthAppRepository.countByOwnerId(userId);
    if (appCount >= MAX_OAUTH_APPS_PER_USER) {
      throw new BadRequestException(`OAuth App은 최대 ${MAX_OAUTH_APPS_PER_USER}개까지 생성할 수 있습니다.`);
    }

    // Client ID와 Secret 생성
    const clientId = this.authentikAdminService.generateClientId();
    const clientSecret = this.authentikAdminService.generateClientSecret();

    this.logger.log(`OAuth App 생성 시작: name=${name}, userId=${userId}`);

    // Authentik에 OAuth2 Provider 및 Application 생성
    const authentikResult = await this.authentikAdminService.createOAuthApp({
      name,
      clientId,
      clientSecret,
      redirectUris,
    });

    // DB에 저장 (issuer와 jwksUrl 포함)
    const oauthApp = await this.oauthAppRepository.create({
      name,
      clientId,
      redirectUris,
      scopes: DEFAULT_SCOPES,
      authentikProviderId: authentikResult.providerId,
      authentikAppId: authentikResult.applicationId,
      issuer: authentikResult.issuer,
      jwksUrl: authentikResult.jwksUrl,
      ownerId: userId,
    });

    this.logger.log(`OAuth App 생성 완료: uuid=${oauthApp.oauthAppUuid}`);

    // Secret은 이 응답에서만 반환
    return OAuthAppCreatedResponseDto.fromWithSecret(oauthApp, clientSecret);
  }

  /**
   * 내 OAuth App 목록 조회
   * @param userId 요청자 ID
   * @returns OAuth App 목록
   */
  async findAll(userId: number): Promise<OAuthAppResponseDto[]> {
    const oauthApps = await this.oauthAppRepository.findByOwnerId(userId);
    return oauthApps.map((app) => OAuthAppResponseDto.from(app));
  }

  /**
   * OAuth App 삭제
   * @param oauthAppUuid OAuth App UUID
   * @param userId 요청자 ID
   */
  async delete(oauthAppUuid: string, userId: number): Promise<void> {
    const oauthApp = await this.oauthAppRepository.findByUuid(oauthAppUuid);
    if (!oauthApp) {
      throw new NotFoundException("해당 OAuth App을 찾을 수 없습니다.");
    }

    // 소유권 확인
    if (oauthApp.ownerId !== userId) {
      throw new ForbiddenException("해당 OAuth App에 대한 권한이 없습니다.");
    }

    this.logger.log(`OAuth App 삭제 시작: uuid=${oauthAppUuid}`);

    // Authentik에서 삭제 (Application 먼저, Provider 나중에)
    try {
      await this.authentikAdminService.deleteApplication(oauthApp.authentikAppId);
      await this.authentikAdminService.deleteOAuth2Provider(oauthApp.authentikProviderId);
    } catch (error) {
      this.logger.error(`Authentik 리소스 삭제 실패: ${error instanceof Error ? error.message : String(error)}`);
      // Authentik 삭제 실패해도 DB는 삭제 진행 (일관성 유지를 위해)
    }

    // DB에서 하드 삭제
    await this.oauthAppRepository.hardDelete(oauthApp.oauthAppId);

    this.logger.log(`OAuth App 삭제 완료: uuid=${oauthAppUuid}`);
  }
}

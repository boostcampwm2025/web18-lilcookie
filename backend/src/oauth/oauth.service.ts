import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Provider from "oidc-provider";
import { PrismaService } from "../database/prisma.service";
import { getOidcConfig } from "./oidc-provider.config";

@Injectable()
export class OAuthService {
  private oidcProvider: Provider;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // 생성자에서 초기화 (configure()에서 사용하기 위해)
    const issuer = this.configService.get<string>("OAUTH_ISSUER") || "http://localhost:3000/oauth";

    // oidc-provider 설정 가져오기 (adapter 포함)
    const config = getOidcConfig(this.prisma, this.configService);

    // oidc-provider 인스턴스 생성
    this.oidcProvider = new Provider(issuer, config);

    console.log(`[OAuth] oidc-provider initialized with issuer: ${issuer}`);
  }

  /**
   * oidc-provider 인스턴스를 반환
   * Controller에서 이 인스턴스를 사용하여 OAuth 요청을 처리합니다
   */
  getProvider(): Provider {
    return this.oidcProvider;
  }
}

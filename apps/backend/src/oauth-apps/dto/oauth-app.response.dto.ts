import { OAuthApp } from "../entities/oauth-app.entity";

/**
 * OAuth App 응답 DTO (목록 조회용)
 */
export class OAuthAppResponseDto {
  oauthAppUuid: string;
  name: string;
  clientId: string;
  redirectUris: string[];
  scopes: string;
  isActive: boolean;
  createdAt: string;

  constructor(data: {
    oauthAppUuid: string;
    name: string;
    clientId: string;
    redirectUris: string[];
    scopes: string;
    isActive: boolean;
    createdAt: string;
  }) {
    this.oauthAppUuid = data.oauthAppUuid;
    this.name = data.name;
    this.clientId = data.clientId;
    this.redirectUris = data.redirectUris;
    this.scopes = data.scopes;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
  }

  static from(oauthApp: OAuthApp): OAuthAppResponseDto {
    return new OAuthAppResponseDto({
      oauthAppUuid: oauthApp.oauthAppUuid,
      name: oauthApp.name,
      clientId: oauthApp.clientId,
      redirectUris: oauthApp.redirectUris,
      scopes: oauthApp.scopes,
      isActive: oauthApp.isActive,
      createdAt: oauthApp.createdAt.toISOString(),
    });
  }
}

/**
 * OAuth App 생성 응답 DTO (Secret 포함 - 최초 1회만 반환)
 */
export class OAuthAppCreatedResponseDto extends OAuthAppResponseDto {
  clientSecret: string;

  constructor(
    data: {
      oauthAppUuid: string;
      name: string;
      clientId: string;
      redirectUris: string[];
      scopes: string;
      isActive: boolean;
      createdAt: string;
    },
    clientSecret: string,
  ) {
    super(data);
    this.clientSecret = clientSecret;
  }

  static fromWithSecret(oauthApp: OAuthApp, clientSecret: string): OAuthAppCreatedResponseDto {
    return new OAuthAppCreatedResponseDto(
      {
        oauthAppUuid: oauthApp.oauthAppUuid,
        name: oauthApp.name,
        clientId: oauthApp.clientId,
        redirectUris: oauthApp.redirectUris,
        scopes: oauthApp.scopes,
        isActive: oauthApp.isActive,
        createdAt: oauthApp.createdAt.toISOString(),
      },
      clientSecret,
    );
  }
}

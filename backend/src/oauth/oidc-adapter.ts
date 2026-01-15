import {
  Prisma,
  PrismaClient,
  OAuthClient,
  OAuthAuthorizationCode,
  OAuthRefreshToken,
  OAuthGrant,
} from "@prisma/client";
import { Adapter, AdapterPayload, ResponseType } from "oidc-provider";

export class OidcPrismaAdapter implements Adapter {
  /**
   * @param name - oidc-provider 모델 타입 (Client, Session, Grant, AuthorizationCode, RefreshToken, Interaction 등)
   * @param prisma - Prisma Client 인스턴스
   */
  constructor(
    private readonly name: string,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * ID로 데이터 조회
   * @param id - 레코드의 고유 ID
   * @returns AdapterPayload 또는 undefined
   */
  async find(id: string): Promise<AdapterPayload | undefined> {
    try {
      const model = this.getModel();
      const data = await model.findUnique({ where: { id } });

      if (!data) return undefined;

      // payload 필드가 있는 경우 (Interaction, Session)
      if ("payload" in data) {
        const payload = (data as { payload?: string }).payload;
        if (typeof payload === "string") {
          return JSON.parse(payload) as AdapterPayload;
        }
      }

      if (this.name === "Client") {
        return this.mapClientToPayload(data);
      }

      if (this.name === "AuthorizationCode") {
        return this.mapAuthCodeToPayload(data);
      }

      if (this.name === "RefreshToken") {
        return this.mapRefreshTokenToPayload(data);
      }

      if (this.name === "Grant") {
        return this.mapGrantToPayload(data);
      }

      return undefined;
    } catch (error) {
      console.error(`[OidcAdapter] find error for ${this.name}:`, error);
      return undefined;
    }
  }

  /**
   * UID로 데이터 조회
   * 주로 AuthorizationCode를 조회할 때 사용
   * @param uid - 고유 식별자
   * @returns AdapterPayload 또는 undefined
   */
  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    // UID는 대부분 ID와 동일하므로 find를 재사용
    return this.find(uid);
  }

  /**
   * User Code로 데이터 조회 (Device Flow용)
   * Device Flow를 사용하지 않으므로 구현하지 않음
   */
  findByUserCode(_userCode: string): Promise<AdapterPayload | undefined> {
    return Promise.resolve(undefined);
  }

  /**
   * 데이터 생성 또는 업데이트
   * @param id - 레코드 ID
   * @param payload - 저장할 데이터
   * @param expiresIn - 만료 시간(초)
   */
  async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
    try {
      const model = this.getModel();
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Interaction, Session 모델: payload를 JSON 문자열로 저장
      if (this.name === "Interaction" || this.name === "Session") {
        await model.upsert({
          where: { id },
          create: {
            id,
            payload: JSON.stringify(payload),
            expiresAt,
            ...(this.name === "Session" && payload.accountId ? { userId: parseInt(payload.accountId) } : {}),
          },
          update: {
            payload: JSON.stringify(payload),
            expiresAt,
          },
        });
        return;
      }

      // Client 모델
      if (this.name === "Client") {
        const clientData = this.mapPayloadToClient(id, payload);
        await model.upsert({
          where: { id },
          create: clientData,
          update: clientData,
        });
        return;
      }

      // AuthorizationCode 모델
      if (this.name === "AuthorizationCode") {
        const codeData = this.mapPayloadToAuthCode(id, payload, expiresAt);
        await model.upsert({
          where: { id },
          create: codeData,
          update: codeData,
        });
        return;
      }

      // RefreshToken 모델
      if (this.name === "RefreshToken") {
        const tokenData = this.mapPayloadToRefreshToken(id, payload, expiresAt);
        await model.upsert({
          where: { id },
          create: tokenData,
          update: tokenData,
        });
        return;
      }

      // Grant 모델
      if (this.name === "Grant") {
        const grantData = this.mapPayloadToGrant(id, payload);
        await model.upsert({
          where: { id },
          create: grantData,
          update: grantData,
        });
        return;
      }
    } catch (error) {
      console.error(`[OidcAdapter] upsert error for ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * 데이터 소비 (일회용 데이터를 사용 처리)
   * 주로 AuthorizationCode가 한 번 사용되었음을 표시
   * @param id - 레코드 ID
   */
  async consume(id: string): Promise<void> {
    try {
      if (this.name === "AuthorizationCode") {
        await this.prisma.oAuthAuthorizationCode.update({
          where: { id },
          data: {
            consumed: true,
            consumedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`[OidcAdapter] consume error for ${this.name}:`, error);
    }
  }

  /**
   * 데이터 삭제
   * @param id - 레코드 ID
   */
  async destroy(id: string): Promise<void> {
    try {
      const model = this.getModel();
      await model.delete({ where: { id } });
    } catch (error) {
      // 이미 삭제된 경우 무시
      console.error(`[OidcAdapter] destroy error for ${this.name}:`, error);
    }
  }

  /**
   * Grant ID로 연관된 모든 토큰 취소
   * 사용자가 권한을 철회하면 해당 Grant로 발급된 모든 토큰을 삭제
   * @param grantId - Grant ID
   */
  async revokeByGrantId(grantId: string): Promise<void> {
    try {
      if (this.name === "RefreshToken") {
        await this.prisma.oAuthRefreshToken.updateMany({
          where: { grantId },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`[OidcAdapter] revokeByGrantId error for ${this.name}:`, error);
    }
  }

  /**
   * 모델 타입에 따라 적절한 Prisma 모델 delegate 반환
   *
   * @returns Prisma delegate 객체 (findUnique, upsert, delete 등의 메서드를 가진 객체)
   */
  private getModel() {
    switch (this.name) {
      case "Client":
        return this.prisma.oAuthClient;
      case "Session":
        return this.prisma.oAuthSession;
      case "Interaction":
        return this.prisma.oAuthInteraction;
      case "AuthorizationCode":
        return this.prisma.oAuthAuthorizationCode;
      case "RefreshToken":
        return this.prisma.oAuthRefreshToken;
      case "Grant":
        return this.prisma.oAuthGrant;
      default:
        throw new Error(`Unknown model type: ${this.name}`);
    }
  }

  // ========================================
  // 매핑 함수: DB 스키마 <-> oidc-provider payload
  // ========================================

  /**
   * DB의 OAuthClient -> oidc-provider Client payload
   */
  private mapClientToPayload(data: OAuthClient): AdapterPayload {
    return {
      client_id: data.id,
      client_secret: data.clientSecret ?? undefined,
      client_name: data.clientName,
      redirect_uris: JSON.parse(data.redirectUris) as string[],
      grant_types: JSON.parse(data.grantTypes) as string[],
      response_types: JSON.parse(data.responseTypes) as ResponseType[],
      scope: (JSON.parse(data.scopes) as string[]).join(" "),
      token_endpoint_auth_method: data.tokenEndpointAuthMethod as "none" | "client_secret_basic" | "client_secret_post",
      application_type: data.applicationType as "web" | "native",
    };
  }

  /**
   * oidc-provider Client payload -> DB의 OAuthClient
   */
  private mapPayloadToClient(id: string, payload: AdapterPayload): Prisma.OAuthClientCreateInput {
    return {
      id,
      clientSecret: (payload.client_secret as string) || null,
      clientName: payload.client_name as string,
      redirectUris: JSON.stringify(payload.redirect_uris),
      grantTypes: JSON.stringify(payload.grant_types),
      responseTypes: JSON.stringify(payload.response_types),
      scopes: JSON.stringify(typeof payload.scope === "string" ? payload.scope.split(" ") : payload.scope),
      tokenEndpointAuthMethod: (payload.token_endpoint_auth_method as string) || "none",
      applicationType: (payload.application_type as string) || "web",
    };
  }

  /**
   * DB의 OAuthAuthorizationCode -> oidc-provider AuthorizationCode payload
   */
  private mapAuthCodeToPayload(data: OAuthAuthorizationCode): AdapterPayload {
    return {
      clientId: data.clientId,
      accountId: data.userId.toString(),
      redirectUri: data.redirectUri,
      scope: data.scope,
      codeChallenge: data.codeChallenge ?? undefined,
      codeChallengeMethod: data.codeChallengeMethod ?? undefined,
      expiresAt: Math.floor(data.expiresAt.getTime() / 1000),
      consumed: data.consumed,
    };
  }

  /**
   * oidc-provider AuthorizationCode payload -> DB의 OAuthAuthorizationCode
   */
  private mapPayloadToAuthCode(
    id: string,
    payload: AdapterPayload,
    expiresAt: Date,
  ): Prisma.OAuthAuthorizationCodeUncheckedCreateInput {
    return {
      id,
      clientId: payload.clientId as string,
      userId: parseInt(payload.accountId as string),
      redirectUri: payload.redirectUri as string,
      scope: payload.scope as string,
      codeChallenge: (payload.codeChallenge as string) || null,
      codeChallengeMethod: (payload.codeChallengeMethod as string) || null,
      expiresAt,
      consumed: false,
    };
  }

  /**
   * DB의 OAuthRefreshToken -> oidc-provider RefreshToken payload
   */
  private mapRefreshTokenToPayload(data: OAuthRefreshToken): AdapterPayload {
    return {
      clientId: data.clientId,
      accountId: data.userId.toString(),
      scope: data.scope,
      grantId: data.grantId ?? undefined,
      expiresAt: Math.floor(data.expiresAt.getTime() / 1000),
    };
  }

  /**
   * oidc-provider RefreshToken payload -> DB의 OAuthRefreshToken
   */
  private mapPayloadToRefreshToken(
    id: string,
    payload: AdapterPayload,
    expiresAt: Date,
  ): Prisma.OAuthRefreshTokenUncheckedCreateInput {
    return {
      id,
      clientId: payload.clientId as string,
      userId: parseInt(payload.accountId as string),
      scope: payload.scope as string,
      grantId: (payload.grantId as string) || null,
      expiresAt,
    };
  }

  /**
   * DB의 OAuthGrant -> oidc-provider Grant payload
   */
  private mapGrantToPayload(data: OAuthGrant): AdapterPayload {
    return {
      accountId: data.userId.toString(),
      clientId: data.clientId,
      scope: data.scope,
    };
  }

  /**
   * oidc-provider Grant payload -> DB의 OAuthGrant
   */
  private mapPayloadToGrant(id: string, payload: AdapterPayload): Prisma.OAuthGrantUncheckedCreateInput {
    return {
      id,
      userId: parseInt(payload.accountId as string),
      clientId: payload.clientId as string,
      scope: payload.scope as string,
    };
  }
}

/**
 * Adapter Factory 함수
 * oidc-provider가 각 모델 타입마다 이 함수를 호출하여 Adapter를 생성합니다
 *
 * @param name - 모델 타입 이름
 * @param prisma - Prisma Client 인스턴스
 */
export function createAdapterFactory(prisma: PrismaClient) {
  return (name: string) => new OidcPrismaAdapter(name, prisma);
}

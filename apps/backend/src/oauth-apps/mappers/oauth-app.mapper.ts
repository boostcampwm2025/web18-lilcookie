import type { OAuthApp as PrismaOAuthApp } from "@prisma/client";
import { OAuthApp } from "../entities/oauth-app.entity";

export class OAuthAppMapper {
  /**
   * Prisma OAuthApp → OAuthApp 엔티티 변환
   */
  static fromPrisma(prismaOAuthApp: PrismaOAuthApp): OAuthApp {
    return new OAuthApp({
      oauthAppId: prismaOAuthApp.id,
      oauthAppUuid: prismaOAuthApp.uuid,
      name: prismaOAuthApp.name,
      clientId: prismaOAuthApp.clientId,
      redirectUris: JSON.parse(prismaOAuthApp.redirectUris) as string[],
      scopes: prismaOAuthApp.scopes,
      isActive: prismaOAuthApp.isActive,
      createdAt: prismaOAuthApp.createdAt,
      authentikProviderId: prismaOAuthApp.authentikProviderId,
      authentikAppId: prismaOAuthApp.authentikAppId,
      ownerId: prismaOAuthApp.ownerId,
    });
  }
}

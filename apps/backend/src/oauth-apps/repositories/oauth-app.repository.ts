import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { OAuthApp } from "../entities/oauth-app.entity";
import { OAuthAppMapper } from "../mappers/oauth-app.mapper";

interface CreateOAuthAppData {
  name: string;
  clientId: string;
  redirectUris: string[];
  scopes: string;
  authentikProviderId: number;
  authentikAppId: string;
  issuer: string;
  jwksUrl: string;
  ownerId: number;
}

@Injectable()
export class OAuthAppRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * OAuth App 생성
   * @param data 생성 데이터
   * @returns 생성된 OAuth App 엔티티
   */
  async create(data: CreateOAuthAppData): Promise<OAuthApp> {
    const created = await this.prisma.oAuthApp.create({
      data: {
        name: data.name,
        clientId: data.clientId,
        redirectUris: JSON.stringify(data.redirectUris),
        scopes: data.scopes,
        authentikProviderId: data.authentikProviderId,
        authentikAppId: data.authentikAppId,
        issuer: data.issuer,
        jwksUrl: data.jwksUrl,
        owner: {
          connect: { id: data.ownerId },
        },
      },
    });
    return OAuthAppMapper.fromPrisma(created);
  }

  /**
   * 사용자의 모든 OAuth App 조회
   * @param ownerId 소유자 PK
   * @returns OAuth App 엔티티 배열
   */
  async findByOwnerId(ownerId: number): Promise<OAuthApp[]> {
    const oauthApps = await this.prisma.oAuthApp.findMany({
      where: { ownerId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return oauthApps.map((app) => OAuthAppMapper.fromPrisma(app));
  }

  /**
   * UUID로 OAuth App 조회
   * @param oauthAppUuid OAuth App UUID
   * @returns OAuth App 엔티티 또는 null
   */
  async findByUuid(oauthAppUuid: string): Promise<OAuthApp | null> {
    const oauthApp = await this.prisma.oAuthApp.findUnique({
      where: { uuid: oauthAppUuid },
    });
    return oauthApp ? OAuthAppMapper.fromPrisma(oauthApp) : null;
  }

  /**
   * Client ID로 OAuth App 조회
   * @param clientId Client ID
   * @returns OAuth App 엔티티 또는 null
   */
  async findByClientId(clientId: string): Promise<OAuthApp | null> {
    const oauthApp = await this.prisma.oAuthApp.findUnique({
      where: { clientId },
    });
    return oauthApp ? OAuthAppMapper.fromPrisma(oauthApp) : null;
  }

  /**
   * OAuth App 삭제 (소프트 삭제)
   * @param oauthAppId OAuth App PK
   * @returns 삭제 성공 여부
   */
  async softDelete(oauthAppId: number): Promise<boolean> {
    try {
      await this.prisma.oAuthApp.update({
        where: { id: oauthAppId },
        data: { isActive: false },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * OAuth App 하드 삭제
   * @param oauthAppId OAuth App PK
   * @returns 삭제 성공 여부
   */
  async hardDelete(oauthAppId: number): Promise<boolean> {
    try {
      await this.prisma.oAuthApp.delete({
        where: { id: oauthAppId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 사용자의 OAuth App 개수 조회
   * @param ownerId 소유자 PK
   * @returns 앱 개수
   */
  async countByOwnerId(ownerId: number): Promise<number> {
    return this.prisma.oAuthApp.count({
      where: { ownerId, isActive: true },
    });
  }

  /**
   * issuer로 OAuth App 조회 (JWT 검증용)
   * @param issuer JWT issuer URL
   * @returns issuer와 jwksUrl 또는 null
   */
  async findJwksUrlByIssuer(issuer: string): Promise<{ issuer: string; jwksUrl: string } | null> {
    const oauthApp = await this.prisma.oAuthApp.findFirst({
      where: { issuer, isActive: true },
      select: { issuer: true, jwksUrl: true },
    });
    return oauthApp;
  }

  /**
   * slug로 OAuth App 조회 (JWT 검증용 - 환경별 issuer 도메인 차이 해결)
   * @param slug Provider slug (application/o/ 뒤의 부분)
   * @returns issuer와 jwksUrl 또는 null
   */
  async findJwksUrlBySlug(slug: string): Promise<{ issuer: string; jwksUrl: string } | null> {
    const oauthApp = await this.prisma.oAuthApp.findFirst({
      where: {
        isActive: true,
        OR: [{ issuer: { contains: `/application/o/${slug}/` } }, { jwksUrl: { contains: `/application/o/${slug}/` } }],
      },
      select: { issuer: true, jwksUrl: true },
    });
    return oauthApp;
  }
}

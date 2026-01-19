import { Adapter, AdapterPayload } from "oidc-provider";
import { Prisma, PrismaClient } from "@prisma/client";

export class OidcPrismaAdapter implements Adapter {
  constructor(
    private readonly name: string,
    private readonly prisma: PrismaClient,
  ) {}

  async find(id: string): Promise<AdapterPayload | undefined> {
    const entity = await this.prisma.oidcEntity.findUnique({
      where: { id },
    });
    return entity?.payload as AdapterPayload | undefined;
  }

  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    // payload.uid 필드로 검색해야 함 (SQLite는 JSON path 쿼리 미지원)
    const entities = await this.prisma.oidcEntity.findMany({
      where: { type: this.name },
    });

    const entity = entities.find((e) => (e.payload as Prisma.JsonObject)?.uid === uid);
    return entity?.payload as AdapterPayload | undefined;
  }

  findByUserCode(_userCode: string): Promise<AdapterPayload | undefined> {
    return Promise.resolve(undefined);
  }

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    const jsonPayload = payload as Prisma.InputJsonValue;
    await this.prisma.oidcEntity.upsert({
      where: { id },
      create: {
        id,
        type: this.name,
        payload: jsonPayload,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
      update: {
        payload: jsonPayload,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });
  }

  async consume(id: string) {
    const entity = await this.prisma.oidcEntity.findUnique({ where: { id } });
    if (!entity) return;

    const currentPayload = entity.payload as Prisma.JsonObject;
    await this.prisma.oidcEntity.update({
      where: { id },
      data: {
        payload: {
          ...currentPayload,
          consumed: true,
        },
      },
    });
  }

  async destroy(id: string) {
    await this.prisma.oidcEntity.delete({ where: { id } }).catch(() => {});
  }

  async revokeByGrantId(grantId: string) {
    // SQLite는 JSON path 쿼리를 지원하지 않으므로,
    // 해당 타입의 모든 엔티티를 가져와서 필터링 후 삭제
    const entities = await this.prisma.oidcEntity.findMany({
      where: { type: "RefreshToken" },
    });

    const idsToDelete = entities.filter((e) => (e.payload as Prisma.JsonObject)?.grantId === grantId).map((e) => e.id);

    if (idsToDelete.length > 0) {
      await this.prisma.oidcEntity.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }
}

export const createAdapterFactory = (prisma: PrismaClient) => (name: string) => new OidcPrismaAdapter(name, prisma);

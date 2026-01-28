import type { Folder as PrismaFolder } from "@prisma/client";
import { Folder } from "../entities/folder.entity";

export class FolderMapper {
  /**
   * Prisma Folder → Folder 엔티티 변환
   * @param prismaFolder Prisma Folder 객체
   * @return 애플리케이션에서 사용할 폴더 엔티티
   */
  static fromPrisma(prismaFolder: PrismaFolder): Folder {
    return new Folder({
      folderId: prismaFolder.id,
      folderUuid: prismaFolder.uuid,
      teamId: prismaFolder.teamId,
      folderName: prismaFolder.name,
      createdAt: prismaFolder.createdAt,
      createdBy: prismaFolder.createdBy,
    });
  }
}

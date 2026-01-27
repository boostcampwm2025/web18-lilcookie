import type { Folder as PrismaFolder } from "@prisma/client";
import { Folder } from "../entities/folder.entity";
import { User } from "../../user/entities/user.entity";
import { FolderResponseDto } from "../dto/folder.response.dto";

export class FolderMapper {
  /**
   * Prisma Folder → 도메인 Folder 엔티티 변환
   * @param prismaFolder Prisma Folder 객체
   * @return 도메인 Folder 엔티티
   */
  static toDomain(prismaFolder: PrismaFolder): Folder {
    return new Folder({
      folderId: prismaFolder.id,
      folderUuid: prismaFolder.uuid,
      teamId: prismaFolder.teamId,
      folderName: prismaFolder.name,
      createdAt: prismaFolder.createdAt,
      createdBy: prismaFolder.createdBy,
    });
  }

  /**
   * Folder 엔티티 + 생성자 User → 폴더 응답 DTO 변환
   * @param folder 폴더 엔티티
   * @param creator 생성자 사용자 엔티티
   * @return 폴더 응답 DTO
   */
  static toResponse(folder: Folder, creator: User): FolderResponseDto {
    return new FolderResponseDto({
      folderUuid: folder.folderUuid,
      folderName: folder.folderName,
      createdAt: folder.createdAt.toISOString(),
      createdBy: {
        userUuid: creator.userUuid,
        userName: creator.userNickname,
      },
    });
  }
}

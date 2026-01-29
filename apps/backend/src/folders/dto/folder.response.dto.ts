import { Folder } from "../entities/folder.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 생성한 사용자 정보
 */
export interface CreatorInfo {
  userUuid: string;
  userName: string;
}

/**
 * 폴더 응답 DTO
 */
export class FolderResponseDto {
  folderUuid: string;
  folderName: string;
  createdAt: string;
  createdBy: CreatorInfo;

  constructor(data: { folderUuid: string; folderName: string; createdAt: string; createdBy: CreatorInfo }) {
    this.folderUuid = data.folderUuid;
    this.folderName = data.folderName;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
  }

  /**
   * Folder 엔티티 + User 엔티티 → 폴더 응답 DTO 변환
   * @param folder 폴더 엔티티
   * @param creator 생성한 사용자 엔티티
   * @returns 클라이언트 응답용 폴더 DTO
   */
  static from(folder: Folder, creator: User): FolderResponseDto {
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

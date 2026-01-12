import { Folder } from "../entities/folder.entity";

export class FolderResponseDto {
  folderId: string;
  teamId: string;
  folderName: string;
  parentFolderId: string | null;
  createdAt: string;
  createdBy: string;

  // Entity에서 DTO로 변환하는 헬퍼 메서드
  static from(folder: Folder): FolderResponseDto {
    const dto = new FolderResponseDto();
    dto.folderId = folder.folderId;
    dto.teamId = folder.teamId;
    dto.folderName = folder.folderName;
    dto.parentFolderId = folder.parentFolderId;
    dto.createdAt = folder.createdAt;
    dto.createdBy = folder.createdBy;
    return dto;
  }
}

import { Folder } from "../entities/folder.entity";

export class FolderResponseDto {
  id: number;
  teamId: number;
  name: string;
  createdBy: number;

  // Entity에서 DTO로 변환하는 헬퍼 메서드
  static from(folder: Folder): FolderResponseDto {
    const dto = new FolderResponseDto();
    dto.id = folder.id;
    dto.teamId = folder.teamId;
    dto.name = folder.name;
    dto.createdBy = folder.createdBy;
    return dto;
  }
}

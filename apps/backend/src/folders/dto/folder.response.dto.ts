/**
 * 생성한 사용자 정보 인터페이스
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
}

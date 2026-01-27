/**
 * 생성한 사용자 정보 인터페이스
 */
export interface CreatorInfo {
  userUuid: string;
  userName: string;
}

/**
 * 링크 응답 DTO
 */
export class LinkResponseDto {
  linkUuid: string;
  teamUuid: string;
  folderUuid: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: CreatorInfo;

  constructor(data: {
    linkUuid: string;
    teamUuid: string;
    folderUuid: string;
    url: string;
    title: string;
    tags: string[];
    summary: string;
    createdAt: string;
    createdBy: CreatorInfo;
  }) {
    this.linkUuid = data.linkUuid;
    this.teamUuid = data.teamUuid;
    this.folderUuid = data.folderUuid;
    this.url = data.url;
    this.title = data.title;
    this.tags = data.tags;
    this.summary = data.summary;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
  }
}

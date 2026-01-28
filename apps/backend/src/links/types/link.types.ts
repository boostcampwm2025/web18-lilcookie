import { Link } from "../entities/link.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 링크와 생성한 사용자 정보 포함 타입
 */
export interface LinkWithCreator {
  link: Link;
  creator: User;
}

/**
 * 링크 생성시 필요한 입력 타입
 */
export interface CreateLinkInput {
  teamId: number;
  folderId: number;
  url: string;
  title: string;
  tags: string;
  summary: string;
  createdBy: number;
}

/**
 * 링크 수정시 필요한 입력 타입
 */
export interface UpdateLinkInput {
  teamId?: number;
  folderId?: number;
  url?: string;
  title?: string;
  tags?: string;
  summary?: string;
}

/**
 * 링크 검색 조건 타입
 * 팀, 폴더, 태그 등으로 필터링 가능
 */
export interface LinkSearchCriteria {
  teamId?: number;
  teamIds?: number[]; // 여러 팀 동시 조회
  folderId?: number;
  tags?: string[];
}

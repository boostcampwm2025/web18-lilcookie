// 링크 타입 - 백엔드 응답 구조
export interface Link {
  linkId: string; // UUID v4
  teamId: string; // 팀 ID (소문자)
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: string; // 사용자 ID (예: "J001")
  folderId: string | null; // 폴더 ID (null이면 폴더 없음)
}

// 폴더 타입 - 백엔드 응답 구조
export interface Folder {
  folderId: string; // 폴더 고유 ID
  teamId: string; // 팀 ID
  folderName: string; // 폴더 이름
  parentFolderId: string | null; // 부모 폴더 ID (null이면 최상위 폴더)
  createdAt: string; // 생성 시각
  createdBy: string; // 생성한 사용자 ID
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

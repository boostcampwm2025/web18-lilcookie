// 링크 타입 - 백엔드 응답 구조
export interface Link {
  id: number;
  uuid: string;
  teamId: number;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: Date;
  createdBy: number;
  folderId: number | null;
}

// 폴더 타입 - 백엔드 응답 구조
export interface Folder {
  id: number;
  uuid: string;
  teamId: number;
  name: string;
  createdBy: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// 사용자 타입
export interface User {
  uuid: string;
  email: string;
  nickname?: string;
}

// 링크 타입 - 백엔드 응답 구조
export interface Link {
  linkUuid: string;
  teamUuid: string;
  folderUuid: string | null;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: {
    userUuid: string;
    userName: string;
  };
}

// 폴더 타입 - 백엔드 응답 구조
export interface Folder {
  folderUuid: string;
  folderName: string;
  createdAt: string;
  createdBy: {
    userUuid: string;
    userName: string;
  };
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

// 팀 타입
export interface Team {
  teamUuid: string;
  teamName: string;
  createdAt: string;
  role: "owner" | "member";
}

// OAuth App 타입
export interface OAuthApp {
  oauthAppUuid: string;
  name: string;
  clientId: string;
  redirectUris: string[];
  scopes: string;
  isActive: boolean;
  createdAt: string;
}

// OAuth App 생성 응답 (Secret 포함)
export interface OAuthAppCreated extends OAuthApp {
  clientSecret: string;
}

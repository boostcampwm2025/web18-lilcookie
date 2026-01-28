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
  role: "admin" | "member";
}

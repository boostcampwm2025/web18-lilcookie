import axios from "axios";
import type {
  ApiResponse,
  Link,
  Folder,
  SignupRequest,
  LoginRequest,
  AuthResponse,
} from "../types";

// API 베이스 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// axios 인스턴스
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // HttpOnly 쿠키를 포함하기 위해 필요
});

// 대시보드용 API 함수들
export const linkApi = {
  // GET /api/links?teamId=web01 - 팀별 링크 목록 조회
  getLinks: async (
    teamId?: string,
    tags?: string[]
  ): Promise<ApiResponse<Link[]>> => {
    const params: Record<string, string> = {};

    if (teamId) {
      params.teamId = teamId;
    }

    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    const response = await api.get("/links", { params });
    return response.data;
  },

  // DELETE /api/links/:linkId - 링크 삭제 (204 No Content)
  deleteLink: async (linkId: string): Promise<void> => {
    await api.delete(`/links/${linkId}`);
  },

  // GET /api/links?teamId=web01&tags=리엑트,분석 - 태그로 검색
  searchByTags: async (
    teamId: string,
    tags: string[]
  ): Promise<ApiResponse<Link[]>> => {
    return linkApi.getLinks(teamId, tags);
  },
};

// 폴더 API 함수들
export const folderApi = {
  // GET /api/folders?teamId=web01 - 팀의 모든 폴더 조회
  getFolders: async (teamId: string): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get("/folders", { params: { teamId } });
    return response.data;
  },

  // GET /api/folders/:folderId - 특정 폴더 조회
  getFolder: async (folderId: string): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  // GET /api/folders/:folderId/subfolders - 하위 폴더 조회
  getSubfolders: async (folderId: string): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get(`/folders/${folderId}/subfolders`);
    return response.data;
  },

  // POST /api/folders - 새 폴더 생성
  createFolder: async (data: {
    teamId: string;
    folderName: string;
    parentFolderId?: string;
    userId: string;
  }): Promise<ApiResponse<Folder>> => {
    const response = await api.post("/folders", data);
    return response.data;
  },

  // PUT /api/folders/:folderId - 폴더 이름 수정
  updateFolder: async (
    folderId: string,
    data: { folderName: string }
  ): Promise<ApiResponse<Folder>> => {
    const response = await api.put(`/folders/${folderId}`, data);
    return response.data;
  },

  // DELETE /api/folders/:folderId - 폴더 삭제
  deleteFolder: async (folderId: string): Promise<void> => {
    await api.delete(`/folders/${folderId}`);
  },
};

// 인증 API 함수들
export const authApi = {
  // POST /api/auth/signup - 회원가입
  signup: async (data: SignupRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  // POST /api/auth/login - 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // POST /api/auth/logout - 로그아웃
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // GET /api/auth/me - 인증 상태 확인
  checkAuth: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default api;

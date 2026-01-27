import axios from "axios";
import type { ApiResponse, Link, Folder, Team } from "../types";
import {
  getStoredAccessToken,
  refreshAccessToken,
  clearTokens,
} from "./authentikAuth";

// API 베이스 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// axios 인스턴스
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // HttpOnly 쿠키를 포함하기 위해 필요
});

// 토큰 갱신 실패 시 호출될 콜백
let onAuthErrorCallback: (() => void) | null = null;

// 토큰 갱신 실패 콜백 등록 함수
export const setAuthErrorCallback = (callback: () => void) => {
  onAuthErrorCallback = callback;
};

// 재시도 방지를 위한 플래그
let isRefreshing = false;
// 대기 중인 요청들을 저장할 배열
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 에러 시 토큰 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않았으며, 공개 엔드포인트가 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url)
    ) {
      // 이미 갱신 중이면 큐에 추가하고 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 시도
        const newTokens = await refreshAccessToken();
        isRefreshing = false;

        // 대기 중인 모든 요청 성공 처리
        if (newTokens) {
          processQueue();
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return api(originalRequest);
        }

        throw new Error("Token refresh failed");
      } catch (refreshError) {
        isRefreshing = false;

        // 대기 중인 모든 요청 실패 처리
        processQueue(refreshError);

        // 갱신 실패 시 콜백 호출 (AuthContext에서 로그아웃 처리)
        clearTokens();
        if (onAuthErrorCallback) {
          onAuthErrorCallback();
        }

        // 이미 로그인 페이지에 있지 않은 경우에만 리다이렉트
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// 대시보드용 API 함수들
export const linkApi = {
  // GET /api/links?teamId=1 - 팀별 링크 목록 조회
  getLinks: async (
    teamId?: number,
    tags?: string[],
  ): Promise<ApiResponse<Link[]>> => {
    const params: Record<string, string | number> = {};

    if (teamId !== undefined) {
      params.teamId = teamId;
    }

    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    const response = await api.get("/links", { params });
    return response.data;
  },

  // DELETE /api/links/:linkId - 링크 삭제 (204 No Content)
  // linkId는 uuid string으로 유지 (외부 노출용)
  deleteLink: async (linkId: string): Promise<void> => {
    await api.delete(`/links/${linkId}`);
  },

  // GET /api/links?teamId=1&tags=리엑트,분석 - 태그로 검색
  searchByTags: async (
    teamId: number,
    tags: string[],
  ): Promise<ApiResponse<Link[]>> => {
    return linkApi.getLinks(teamId, tags);
  },
};

// 폴더 API 함수들
export const folderApi = {
  // GET /api/folders?teamId=1 - 팀의 모든 폴더 조회
  getFolders: async (teamId: number): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get("/folders", { params: { teamId } });
    return response.data;
  },

  // GET /api/folders/:folderId - 특정 폴더 조회
  // folderId는 uuid string으로 유지 (외부 노출용)
  getFolder: async (folderId: string): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  // 1단계 폴더 구조로 단순화

  // POST /folders - 새 폴더 생성
  createFolder: async (data: {
    teamId: number;
    folderName: string;
    userId: number;
  }): Promise<ApiResponse<Folder>> => {
    const response = await api.post("/folders", data);
    return response.data;
  },

  // PUT /api/folders/:folderId - 폴더 이름 수정
  updateFolder: async (
    folderId: string,
    data: { folderName: string },
  ): Promise<ApiResponse<Folder>> => {
    const response = await api.put(`/folders/${folderId}`, data);
    return response.data;
  },

  // DELETE /api/folders/:folderId - 폴더 삭제

  deleteFolder: async (folderId: string): Promise<void> => {
    await api.delete(`/folders/${folderId}`);
  },
};

// 팀 API 함수들
export const teamApi = {
  // GET /teams/me - 내 팀들 조회
  getMyTeams: async (): Promise<ApiResponse<Team[]>> => {
    const response = await api.get("/teams/me");
    return response.data;
  },
};

export default api;

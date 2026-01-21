import axios from "axios";
import type { ApiResponse, Link, Folder } from "../types";

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

// 인증이 필요 없는 엔드포인트 (토큰 갱신하지 않을 엔드포인트)
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/refresh"];

// 인증이 필요 없는 요청인지 확인
const isPublicEndpoint = (url: string) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
};

// Response Interceptor: 401 에러 시 토큰 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않았으며, 공개 엔드포인트가 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint(originalRequest.url)) {
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
        await api.post("/auth/refresh");
        isRefreshing = false;

        // 대기 중인 모든 요청 성공 처리
        processQueue();

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // 대기 중인 모든 요청 실패 처리
        processQueue(refreshError);

        // 갱신 실패 시 콜백 호출 (AuthContext에서 로그아웃 처리)
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
  }
);

// 대시보드용 API 함수들
export const linkApi = {
  getLinks: async (teamId: string, tags?: string[]): Promise<ApiResponse<Link[]>> => {
    const params: Record<string, string> = { teamId };

    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    const response = await api.get("/links", { params });
    return response.data;
  },

  deleteLink: async (teamId: string, linkId: string): Promise<void> => {
    await api.delete(`/links/${linkId}`, { params: { teamId } });
  },

  searchByTags: async (teamId: string, tags: string[]): Promise<ApiResponse<Link[]>> => {
    return linkApi.getLinks(teamId, tags);
  },
};

// 폴더 API 함수들
export const folderApi = {
  // GET /folders?teamId=web01 - 팀의 모든 폴더 조회
  getFolders: async (teamId: string): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get("/folders", { params: { teamId } });
    return response.data;
  },

  // GET /folders/:folderId - 특정 폴더 조회
  getFolder: async (folderId: string): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  // GET /folders/:folderId/subfolders - 하위 폴더 조회
  getSubfolders: async (folderId: string): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get(`/folders/${folderId}/subfolders`);
    return response.data;
  },

  // POST /folders - 새 폴더 생성
  createFolder: async (data: {
    teamId: string;
    folderName: string;
    parentFolderId?: string;
    userId: string;
  }): Promise<ApiResponse<Folder>> => {
    const response = await api.post("/folders", data);
    return response.data;
  },

  // PUT /folders/:folderId - 폴더 이름 수정
  updateFolder: async (folderId: string, data: { folderName: string }): Promise<ApiResponse<Folder>> => {
    const response = await api.put(`/folders/${folderId}`, data);
    return response.data;
  },

  // DELETE /folders/:folderId - 폴더 삭제
  deleteFolder: async (folderId: string): Promise<void> => {
    await api.delete(`/folders/${folderId}`);
  },
};

export default api;

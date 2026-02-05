import axios, { type InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import type { ApiResponse, Link, Folder, Team } from "../types";
import {
  getStoredAccessToken,
  refreshAccessToken,
  clearTokens,
} from "./authentikAuth";
import type {
  GetTeamMembersResponseData,
  GetTeamTokenUsageResponseData,
  GetTeamWebhooksResponseData,
  JoinTeamResponseData,
  CreateOAuthAppRequest,
  OAuthAppResponseData,
  OAuthAppCreatedResponseData,
} from "@repo/api";

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

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
});

// 인증 필요 없는 공개 엔드포인트 목록
const PUBLIC_ENDPOINTS = ["/health"];

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// 토큰 갱신 실패 시 호출될 콜백
let onAuthErrorCallback: (() => void) | null = null;

// 토큰 갱신 실패 콜백 등록 함수
export const setAuthErrorCallback = (callback: () => void) => {
  onAuthErrorCallback = callback;
};

// 토큰 갱신 중 플래그
let isRefreshing = false;
const tokenRefreshRetriedRequests = new WeakSet<InternalAxiosRequestConfig>();
// 대기 중인 요청들을 저장할 배열
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
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
    const originalRequest: InternalAxiosRequestConfig | undefined =
      error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !tokenRefreshRetriedRequests.has(originalRequest) &&
      !isPublicEndpoint(originalRequest.url)
    ) {
      // 이미 갱신 중이면 큐에 추가하고 대기
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      tokenRefreshRetriedRequests.add(originalRequest);
      isRefreshing = true;

      try {
        // 토큰 갱신 시도
        const newTokens = await refreshAccessToken();
        isRefreshing = false;

        if (newTokens) {
          const newToken = newTokens.access_token;

          // 대기 중인 모든 요청에 새 토큰 전달
          processQueue(null, newToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
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

// 링크 API 함수들
export const linkApi = {
  // GET /links?teamUuid={teamUuid}&folderUuid={folderUuid}&tags={tag1,tag2,...}
  getLinks: async (options?: {
    teamUuid?: string;
    folderUuid?: string;
    tags?: string[];
  }): Promise<ApiResponse<Link[]>> => {
    const params: Record<string, string> = {};

    if (options?.teamUuid) {
      params.teamUuid = options.teamUuid;
    }

    if (options?.folderUuid) {
      params.folderUuid = options.folderUuid;
    }

    if (options?.tags && options.tags.length > 0) {
      params.tags = options.tags.join(",");
    }

    const response = await api.get("/links", { params });
    return response.data;
  },

  // GET /links/:linkUuid - 단건 조회
  getLink: async (linkUuid: string): Promise<ApiResponse<Link>> => {
    const response = await api.get(`/links/${linkUuid}`);
    return response.data;
  },

  // DELETE /links/:linkUuid - 링크 삭제 (204 No Content)
  deleteLink: async (linkUuid: string): Promise<void> => {
    await api.delete(`/links/${linkUuid}`);
  },

  // 태그로 검색
  searchByTags: async (
    teamUuid: string,
    tags: string[],
  ): Promise<ApiResponse<Link[]>> => {
    return linkApi.getLinks({ teamUuid, tags });
  },
};

// 폴더 API 함수들
export const folderApi = {
  // GET /folders?teamUuid={teamUuid} - 팀의 모든 폴더 조회
  getFolders: async (teamUuid: string): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get("/folders", { params: { teamUuid } });
    return response.data;
  },

  // GET /api/folders/:folderId - 특정 폴더 조회
  // folderId는 uuid string으로 유지 (외부 노출용)
  getFolder: async (folderId: string): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
  },

  // POST /folders - 새 폴더 생성
  createFolder: async (data: {
    teamUuid: string;
    folderName: string;
  }): Promise<ApiResponse<Folder>> => {
    const response = await api.post("/folders", data);
    return response.data;
  },

  // PATCH /folders/:folderUuid - 폴더 이름 수정
  updateFolder: async (
    folderUuid: string,
    data: { folderName: string },
  ): Promise<ApiResponse<Folder>> => {
    const response = await api.patch(`/folders/${folderUuid}`, data);
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

  // POST /teams - 팀 생성
  createTeam: async (teamName: string): Promise<ApiResponse<Team>> => {
    const response = await api.post("/teams", { teamName });
    return response.data;
  },

  // GET /teams/:teamUuid/preview - 초대 링크용 팀 정보 조회
  getTeamPreview: async (
    teamUuid: string,
  ): Promise<ApiResponse<{ teamName: string }>> => {
    const response = await api.get(`/teams/${teamUuid}/preview`);
    return response.data;
  },

  // POST /teams/:teamUuid/join - 팀 가입
  joinTeam: async (
    teamUuid: string,
  ): Promise<ApiResponse<JoinTeamResponseData>> => {
    const response = await api.post(`teams/${teamUuid}/join`);
    return response.data;
  },

  // GET /teams/:teamUuid/members - 팀 멤버 조회
  getTeamMember: async (
    teamUuid: string,
  ): Promise<ApiResponse<GetTeamMembersResponseData>> => {
    const response = await api.get(`teams/${teamUuid}/members`);
    return response.data;
  },

  // DELETE /teams/:teamUuid - 팀 탈퇴
  leaveTeam: async (teamUuid: string): Promise<void> => {
    await api.delete(`teams/${teamUuid}`);
  },

  // ---------- webhook ---------
  // GET /teams/:teamUuid/webhooks - 팀에 등록된 웹훅 조회
  getTeamWebhooks: async (
    teamUuid: string,
  ): Promise<ApiResponse<GetTeamWebhooksResponseData[]>> => {
    const response = await api.get(`teams/${teamUuid}/webhooks`);
    return response.data;
  },

  // POST /teams/:teamUuid/webhooks - 웹훅 등록
  addTeamWebhooks: async (
    teamUuid: string,
    url: string,
  ): Promise<ApiResponse<GetTeamWebhooksResponseData>> => {
    const response = await api.post(`teams/${teamUuid}/webhooks`, { url });
    return response.data;
  },

  // DELETE /teams/:teamUuid/webhooks/:webhookdUuid - 웹훅 삭제
  deleteTeamWebhooks: async (
    teamUuid: string,
    webhookUuid: string,
  ): Promise<void> => {
    await api.delete(`teams/${teamUuid}/webhooks/${webhookUuid}`);
  },

  // PATCH /teams/:teamUuid/webhooks/:webhookUuid/activate - 특정 훅을 활성화
  activateTeamWebhooks: async (
    teamUuid: string,
    webhookUuid: string,
  ): Promise<ApiResponse<GetTeamWebhooksResponseData>> => {
    const response = await api.patch(
      `teams/${teamUuid}/webhooks/${webhookUuid}/activate`,
    );
    return response.data;
  },

  // PATCH /teams/:teamUuid/webhooks/:webhookUuid/deactivate - 특정 훅을 비활성화
  deactivateTeamWebhooks: async (
    teamUuid: string,
    webhookUuid: string,
  ): Promise<ApiResponse<GetTeamWebhooksResponseData>> => {
    const response = await api.patch(
      `teams/${teamUuid}/webhooks/${webhookUuid}/deactivate`,
    );
    return response.data;
  },

  // ---------- token usage ---------
  getTokenUsage: async (
    teamUuid: string,
  ): Promise<ApiResponse<GetTeamTokenUsageResponseData>> => {
    const response = await api.get(`teams/${teamUuid}/token-usage`);
    return response.data;
  },

  // PATCH /teams/:teamUuid/transfer-ownership - 오너 권한 위임
  transferOwnership: async (
    teamUuid: string,
    targetUserUuid: string,
  ): Promise<void> => {
    await api.patch(`teams/${teamUuid}/transfer-ownership`, {
      targetUserUuid,
    });
  },

  // DELETE /teams/:teamUuid/members - 팀원 강퇴
  kickMembers: async (
    teamUuid: string,
    targetUserUuids: string[],
  ): Promise<void> => {
    await api.delete(`teams/${teamUuid}/members`, {
      data: { targetUserUuids },
    });
  },

  // DELETE /teams/:teamUuid/delete - 팀 삭제
  deleteTeam: async (teamUuid: string): Promise<void> => {
    await api.delete(`teams/${teamUuid}/delete`);
  },
};

// OAuth Apps API 함수들
export const oauthAppsApi = {
  // GET /oauth-apps - 내 OAuth App 목록 조회
  getOAuthApps: async (): Promise<ApiResponse<OAuthAppResponseData[]>> => {
    const response = await api.get("/oauth-apps");
    return response.data;
  },

  // POST /oauth-apps - OAuth App 생성
  createOAuthApp: async (
    data: CreateOAuthAppRequest,
  ): Promise<ApiResponse<OAuthAppCreatedResponseData>> => {
    const response = await api.post("/oauth-apps", data);
    return response.data;
  },

  // DELETE /oauth-apps/:oauthAppUuid - OAuth App 삭제
  deleteOAuthApp: async (oauthAppUuid: string): Promise<void> => {
    await api.delete(`/oauth-apps/${oauthAppUuid}`);
  },
};

export default api;

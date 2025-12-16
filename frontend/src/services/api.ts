import axios from "axios";
import type { ApiResponse, Link } from "../types";

// API 베이스 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 인스턴스
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
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

  // GET /api/links/:linkId - 링크 단건 조회
  /*getLinkById: async (linkId: string): Promise<ApiResponse<Link>> => {
    const response = await api.get(`/links/${linkId}`);
    return response.data;
  },
*/
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

export default api;

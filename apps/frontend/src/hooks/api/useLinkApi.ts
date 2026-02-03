import { useCallback } from "react";
import { linkApi } from "../../services/api";
import type { ApiResponse, Link } from "../../types";

interface GetLinksOptions {
  teamUuid?: string;
  folderUuid?: string;
  tags?: string[];
}

// 링크 API 호출을 위한 훅
export const useLinkApi = () => {
  // 링크 목록 조회
  const getLinks = useCallback(
    async (options?: GetLinksOptions): Promise<ApiResponse<Link[]>> => {
      return linkApi.getLinks(options);
    },
    [],
  );

  // 단일 링크 조회
  const getLink = useCallback(
    async (linkUuid: string): Promise<ApiResponse<Link>> => {
      return linkApi.getLink(linkUuid);
    },
    [],
  );

  // 링크 삭제
  const deleteLink = useCallback(async (linkUuid: string): Promise<void> => {
    return linkApi.deleteLink(linkUuid);
  }, []);

  // 태그로 링크 검색
  const searchByTags = useCallback(
    async (teamUuid: string, tags: string[]): Promise<ApiResponse<Link[]>> => {
      return linkApi.searchByTags(teamUuid, tags);
    },
    [],
  );

  return { getLinks, getLink, deleteLink, searchByTags };
};

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { linkApi } from "../services/api";
import type { Link } from "../types";

interface UseLinksOptions {
  teamUuid?: string;
  folderUuid?: string;
}

// 링크 관리 훅
// 서버 상태(links, loading, error)는 TanStack Query로,
// 클라이언트 UI 상태(selectedTags, searchQuery)는 useState로 분리해 관리한다.
export const useLinks = ({ teamUuid, folderUuid }: UseLinksOptions) => {
  const queryClient = useQueryClient();

  // 클라이언트 UI 상태
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 서버 상태 — 같은 (team, folder, tags) 조합은 staleTime 동안 캐시 사용
  const queryKey = ["links", teamUuid, folderUuid, selectedTags] as const;

  const {
    data: links = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const options: {
        teamUuid: string;
        folderUuid?: string;
        tags?: string[];
      } = {
        teamUuid: teamUuid!,
        folderUuid: folderUuid!,
      };
      if (selectedTags.length > 0) {
        options.tags = selectedTags;
      }

      const response = await linkApi.getLinks(options);
      if (!response.success) {
        throw new Error("링크를 불러오는데 실패했습니다.");
      }
      return response.data;
    },
    enabled: !!teamUuid && !!folderUuid,
  });

  const error = queryError ? "링크를 불러오는데 실패했습니다." : null;

  // 링크 삭제 — 캐시에서 즉시 제거하여 UI에 반영
  const deleteMutation = useMutation({
    mutationFn: (linkUuid: string) => linkApi.deleteLink(linkUuid),
    onSuccess: (_, linkUuid) => {
      queryClient.setQueryData<Link[]>(queryKey, (prev) =>
        (prev ?? []).filter((link) => link.linkUuid !== linkUuid),
      );
    },
  });

  const deleteLink = useCallback(
    (linkUuid: string) => deleteMutation.mutateAsync(linkUuid),
    [deleteMutation],
  );

  // 태그 클릭 핸들러 - 태그 필터에 추가
  const handleTagClick = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  }, []);

  // 태그 필터에서 제거
  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // 모든 태그 필터 초기화
  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // 검색어로 필터링된 링크 목록
  // 제목, 요약, 태그에서 검색
  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return links;

    const query = searchQuery.toLowerCase();
    return links.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.summary.toLowerCase().includes(query) ||
        link.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [links, searchQuery]);

  return {
    links,
    filteredLinks,
    loading,
    error,
    selectedTags,
    searchQuery,
    fetchLinks: refetch,
    deleteLink,
    setSearchQuery,
    handleTagClick,
    removeTag,
    clearTags,
  };
};

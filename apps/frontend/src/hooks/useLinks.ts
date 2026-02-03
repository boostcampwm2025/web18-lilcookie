import { useState, useCallback, useMemo, useEffect } from "react";
import { linkApi } from "../services/api";
import type { Link } from "../types";

interface UseLinksOptions {
  teamUuid?: string;
  folderUuid?: string;
}

// 링크 관리 훅
export const useLinks = ({ teamUuid, folderUuid }: UseLinksOptions) => {

  const [links, setLinks] = useState<Link[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  // 링크 목록 조회
  const fetchLinks = useCallback(async () => {
    if (!teamUuid || !folderUuid) return;

    setLoading(true);
    setError(null);

    try {
      const options: {
        teamUuid: string;
        folderUuid?: string;
        tags?: string[];
      } = {
        teamUuid,
        folderUuid,
      };

      if (selectedTags.length > 0) {
        options.tags = selectedTags;
      }

      const response = await linkApi.getLinks(options);
      if (response.success) {
        setLinks(response.data);
      } else {
        setLinks([]);
      }
    } catch (err) {
      setError("링크를 불러오는데 실패했습니다.");
      console.error("링크 조회 실패:", err);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [teamUuid, folderUuid, selectedTags]);

  // teamUuid, folderUuid, selectedTags 변경 시 자동으로 링크 조회
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // 링크 삭제
  const deleteLink = useCallback(async (linkUuid: string) => {
    try {
      await linkApi.deleteLink(linkUuid);
      // 로컬 상태에서도 즉시 제거
      setLinks((prev) => prev.filter((link) => link.linkUuid !== linkUuid));
    } catch (err) {
      console.error("링크 삭제 실패:", err);
      throw err;
    }
  }, []);

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
    fetchLinks,
    deleteLink,
    setSearchQuery,
    handleTagClick,
    removeTag,
    clearTags,
  };
};

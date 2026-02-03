import { useState, useCallback, useEffect, useRef } from "react";
import { useFolderApi } from "./api";
import type { Folder } from "../types";

interface UseFoldersOptions {
  selectedTeamUuid?: string;
  folderRefreshKey?: number;
}

// 폴더 관리를 위한 비즈니스 로직 훅
export const useFolders = ({
  selectedTeamUuid,
  folderRefreshKey,
}: UseFoldersOptions) => {
  const { getFolders } = useFolderApi();

  // 팀별 폴더 데이터 캐시
  const [teamFolders, setTeamFolders] = useState<Record<string, Folder[]>>({});
  // 이미 폴더를 조회한 팀 추적 (중복 API 호출 방지)
  const fetchedFoldersRef = useRef<Set<string>>(new Set());

  // 폴더 조회 (필요한 경우에만)
  // 이미 조회한 팀은 캐시 사용
  const fetchFoldersIfNeeded = useCallback(
    async (teamUuid: string) => {
      if (fetchedFoldersRef.current.has(teamUuid)) return;

      fetchedFoldersRef.current.add(teamUuid);
      try {
        const response = await getFolders(teamUuid);
        if (response.success) {
          setTeamFolders((prev) => ({
            ...prev,
            [teamUuid]: response.data,
          }));
        }
      } catch (error) {
        console.error("폴더 조회 실패:", error);
        fetchedFoldersRef.current.delete(teamUuid);
      }
    },
    [getFolders],
  );

  // 폴더 강제 재조회
  // 캐시를 무효화하고 다시 조회
  const refetchFolders = useCallback(
    async (teamUuid: string) => {
      fetchedFoldersRef.current.delete(teamUuid);
      await fetchFoldersIfNeeded(teamUuid);
    },
    [fetchFoldersIfNeeded],
  );

  // 특정 팀의 폴더 목록 반환
  const getFoldersByTeam = useCallback(
    (teamUuid: string) => {
      return teamFolders[teamUuid] || [];
    },
    [teamFolders],
  );

  // 선택된 팀의 폴더 자동 조회 (URL 변경 시)
  useEffect(() => {
    if (!selectedTeamUuid) return;

    // 이미 폴더 데이터가 있으면 스킵
    if (teamFolders[selectedTeamUuid]) return;

    let cancelled = false;

    const fetchFolders = async () => {
      fetchedFoldersRef.current.add(selectedTeamUuid);
      try {
        const response = await getFolders(selectedTeamUuid);
        if (!cancelled && response.success) {
          setTeamFolders((prev) => ({
            ...prev,
            [selectedTeamUuid]: response.data,
          }));
        }
      } catch (error) {
        console.error("폴더 조회 실패:", error);
        if (!cancelled) {
          fetchedFoldersRef.current.delete(selectedTeamUuid);
        }
      }
    };

    fetchFolders();

    return () => {
      cancelled = true;
    };
  }, [selectedTeamUuid, teamFolders, getFolders]);

  // folderRefreshKey가 변경되면 선택된 팀의 폴더 캐시 무효화 및 재조회
  useEffect(() => {
    if (folderRefreshKey === undefined || folderRefreshKey === 0) return;
    if (!selectedTeamUuid) return;

    // 폴더 다시 조회 (캐시 무효화 포함)
    const refetch = async () => {
      fetchedFoldersRef.current.delete(selectedTeamUuid);

      try {
        fetchedFoldersRef.current.add(selectedTeamUuid);
        const response = await getFolders(selectedTeamUuid);
        if (response.success) {
          setTeamFolders((prev) => ({
            ...prev,
            [selectedTeamUuid]: response.data,
          }));
        }
      } catch (error) {
        console.error("폴더 조회 실패:", error);
        fetchedFoldersRef.current.delete(selectedTeamUuid);
      }
    };

    refetch();
    // selectedTeamUuid 변경 시에는 실행하지 않고, folderRefreshKey 변경 시에만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderRefreshKey]);

  return {
    teamFolders,
    fetchFoldersIfNeeded,
    refetchFolders,
    getFoldersByTeam,
  };
};

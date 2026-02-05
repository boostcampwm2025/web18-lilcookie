import { useState, useCallback, useEffect, useRef } from "react";
import { folderApi } from "../services/api";
import type { Folder } from "../types";

interface UseFoldersOptions {
  selectedTeamUuid?: string;
}

// 폴더 관리를 위한 비즈니스 로직 훅
export const useFolders = ({ selectedTeamUuid }: UseFoldersOptions) => {
  // 팀별 폴더 데이터 캐시
  const [teamFolders, setTeamFolders] = useState<Record<string, Folder[]>>({});
  // 이미 폴더를 조회한 팀 추적 (중복 API 호출 방지)
  const fetchedFoldersRef = useRef<Set<string>>(new Set());

  // 폴더 조회 (필요한 경우에만)
  // 이미 조회한 팀은 캐시 사용
  const fetchFoldersIfNeeded = useCallback(async (teamUuid: string) => {
    if (fetchedFoldersRef.current.has(teamUuid)) return;

    fetchedFoldersRef.current.add(teamUuid);
    try {
      const response = await folderApi.getFolders(teamUuid);
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
  }, []);

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

  // 폴더 생성
  // api 호출 후 성고하면 캐시(teamFolders)에 직접 추가
  // api를 다시 호출할 필요 없이 즉시 Ui에 반영
  const createFolder = useCallback(
    async (teamUuid: string, folderName: string): Promise<Folder> => {
      const response = await folderApi.createFolder({ teamUuid, folderName });

      if (response.success) {
        // 캐시에 새 폴더 추가 (API 재호출 없이 즉시 반영)
        setTeamFolders((prev) => ({
          ...prev,
          [teamUuid]: [...(prev[teamUuid] || []), response.data],
        }));
        return response.data;
      }

      throw new Error(response.message || "폴더 생성 실패");
    },
    [],
  );

  // 폴더 삭제
  // api 호출 후 성공하면 캐시(teamFolder)에서 직접 제거
  // api를 다시 호출할 필요 없이 즉시 ui에 반영
  const deleteFolder = useCallback(
    async (teamUuid: string, folderUuid: string): Promise<void> => {
      await folderApi.deleteFolder(folderUuid);

      // 캐시에서 해당 폴더 제거 (API 재호출 없이 즉시 반영)
      setTeamFolders((prev) => ({
        ...prev,
        [teamUuid]: (prev[teamUuid] || []).filter(
          (f) => f.folderUuid !== folderUuid,
        ),
      }));
    },
    [],
  );

  // 폴더 이름 수정
  const renameFolder = useCallback(
    async (
      teamUuid: string,
      folderUuid: string,
      newName: string,
    ): Promise<void> => {
      const response = await folderApi.updateFolder(folderUuid, {
        folderName: newName,
      });

      if (response.success) {
        // 캐시에서 해당 폴더 이름 업데이트
        setTeamFolders((prev) => ({
          ...prev,
          [teamUuid]: (prev[teamUuid] || []).map((f) =>
            f.folderUuid === folderUuid ? { ...f, folderName: newName } : f,
          ),
        }));
      }
    },
    [],
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
        const response = await folderApi.getFolders(selectedTeamUuid);
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
  }, [selectedTeamUuid, teamFolders]);

  return {
    teamFolders,
    fetchFoldersIfNeeded,
    refetchFolders,
    getFoldersByTeam,
    createFolder,
    deleteFolder,
    renameFolder,
  };
};

import { useCallback, useMemo } from "react";
import {
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { folderApi } from "../services/api";
import type { Folder, Team } from "../types";

interface UseFoldersOptions {
  teams: Team[];
  isTeamEnabled?: (teamUuid: string) => boolean;
  selectedTeamUuid?: string;
}

// 폴더 관리 훅
// 수동 캐싱(useState + useRef)을 TanStack Query에 위임.
// 활성화된 팀들에 대해 useQueries로 fetch하고, mutation은 setQueryData로 즉시 캐시 반영.
export const useFolders = ({
  teams,
  isTeamEnabled,
  selectedTeamUuid,
}: UseFoldersOptions) => {
  const queryClient = useQueryClient();

  // 활성화된 팀들의 폴더만 fetch (펼쳐진 팀 + 선택된 팀)
  const folderQueries = useQueries({
    queries: teams.map((team) => ({
      queryKey: ["folders", team.teamUuid] as const,
      queryFn: async (): Promise<Folder[]> => {
        const response = await folderApi.getFolders(team.teamUuid);
        return response.success ? response.data : [];
      },
      enabled:
        team.teamUuid === selectedTeamUuid ||
        (isTeamEnabled ? isTeamEnabled(team.teamUuid) : false),
      staleTime: 5 * 60 * 1000,
    })),
  });

  // teamFolders Record 만들기 (기존 인터페이스 호환)
  const teamFolders = useMemo(() => {
    const record: Record<string, Folder[]> = {};
    teams.forEach((team, index) => {
      const data = folderQueries[index]?.data;
      if (data) record[team.teamUuid] = data;
    });
    return record;
    // folderQueries 자체는 매 렌더마다 새 array — data만 의존하도록 풀어서 의존성에 넣음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, ...folderQueries.map((q) => q.data)]);

  // 명시적 fetch 트리거 (호환 유지 — toggle 시점에 호출되지만 enabled로 이미 자동 처리됨)
  const fetchFoldersIfNeeded = useCallback(
    async (teamUuid: string) => {
      await queryClient.fetchQuery({
        queryKey: ["folders", teamUuid],
        queryFn: async (): Promise<Folder[]> => {
          const response = await folderApi.getFolders(teamUuid);
          return response.success ? response.data : [];
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient],
  );

  // 폴더 생성 — 성공 시 캐시에 즉시 추가
  const createFolderMutation = useMutation({
    mutationFn: async ({
      teamUuid,
      folderName,
    }: {
      teamUuid: string;
      folderName: string;
    }) => {
      const response = await folderApi.createFolder({ teamUuid, folderName });
      if (!response.success) {
        throw new Error(response.message || "폴더 생성 실패");
      }
      return { teamUuid, folder: response.data };
    },
    onSuccess: ({ teamUuid, folder }) => {
      queryClient.setQueryData<Folder[]>(["folders", teamUuid], (prev) => [
        ...(prev ?? []),
        folder,
      ]);
    },
  });

  const createFolder = useCallback(
    async (teamUuid: string, folderName: string): Promise<Folder> => {
      const { folder } = await createFolderMutation.mutateAsync({
        teamUuid,
        folderName,
      });
      return folder;
    },
    [createFolderMutation],
  );

  // 폴더 삭제 — 성공 시 캐시에서 즉시 제거
  const deleteFolderMutation = useMutation({
    mutationFn: async ({
      teamUuid,
      folderUuid,
    }: {
      teamUuid: string;
      folderUuid: string;
    }) => {
      await folderApi.deleteFolder(folderUuid);
      return { teamUuid, folderUuid };
    },
    onSuccess: ({ teamUuid, folderUuid }) => {
      queryClient.setQueryData<Folder[]>(["folders", teamUuid], (prev) =>
        (prev ?? []).filter((f) => f.folderUuid !== folderUuid),
      );
    },
  });

  const deleteFolder = useCallback(
    async (teamUuid: string, folderUuid: string): Promise<void> => {
      await deleteFolderMutation.mutateAsync({ teamUuid, folderUuid });
    },
    [deleteFolderMutation],
  );

  // 폴더 이름 변경 — 성공 시 캐시에서 즉시 수정
  const renameFolderMutation = useMutation({
    mutationFn: async ({
      folderUuid,
      newName,
    }: {
      teamUuid: string;
      folderUuid: string;
      newName: string;
    }) => {
      const response = await folderApi.updateFolder(folderUuid, {
        folderName: newName,
      });
      if (!response.success) {
        throw new Error("폴더 이름 수정 실패");
      }
    },
    onSuccess: (_, { teamUuid, folderUuid, newName }) => {
      queryClient.setQueryData<Folder[]>(["folders", teamUuid], (prev) =>
        (prev ?? []).map((f) =>
          f.folderUuid === folderUuid ? { ...f, folderName: newName } : f,
        ),
      );
    },
  });

  const renameFolder = useCallback(
    async (
      teamUuid: string,
      folderUuid: string,
      newName: string,
    ): Promise<void> => {
      await renameFolderMutation.mutateAsync({ teamUuid, folderUuid, newName });
    },
    [renameFolderMutation],
  );

  return {
    teamFolders,
    fetchFoldersIfNeeded,
    createFolder,
    deleteFolder,
    renameFolder,
  };
};

import { useCallback } from "react";
import { folderApi } from "../../services/api";
import type { ApiResponse, Folder } from "../../types";

// 폴더 API 호출을 위한 훅
export const useFolderApi = () => {
  // 팀의 폴더 목록 조회
  const getFolders = useCallback(
    async (teamUuid: string): Promise<ApiResponse<Folder[]>> => {
      return folderApi.getFolders(teamUuid);
    },
    [],
  );

  // 단일 폴더 조회
  const getFolder = useCallback(
    async (folderUuid: string): Promise<ApiResponse<Folder>> => {
      return folderApi.getFolder(folderUuid);
    },
    [],
  );

  // 폴더 생성
  const createFolder = useCallback(
    async (data: {
      teamUuid: string;
      folderName: string;
    }): Promise<ApiResponse<Folder>> => {
      return folderApi.createFolder(data);
    },
    [],
  );

  // 폴더 이름 수정
  const updateFolder = useCallback(
    async (
      folderUuid: string,
      data: { folderName: string },
    ): Promise<ApiResponse<Folder>> => {
      return folderApi.updateFolder(folderUuid, data);
    },
    [],
  );

  // 폴더 삭제
  const deleteFolder = useCallback(
    async (folderUuid: string): Promise<void> => {
      return folderApi.deleteFolder(folderUuid);
    },
    [],
  );

  return { getFolders, getFolder, createFolder, updateFolder, deleteFolder };
};

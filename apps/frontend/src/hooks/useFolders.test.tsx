import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFolders } from "./useFolders";
import type { Team } from "../types";

vi.mock("../services/api", () => ({
  folderApi: {
    getFolders: vi.fn(),
    createFolder: vi.fn(),
    deleteFolder: vi.fn(),
    updateFolder: vi.fn(),
  },
}));

import { folderApi } from "../services/api";

const mockedGetFolders = folderApi.getFolders as ReturnType<typeof vi.fn>;
const mockedCreateFolder = folderApi.createFolder as ReturnType<typeof vi.fn>;
const mockedDeleteFolder = folderApi.deleteFolder as ReturnType<typeof vi.fn>;
const mockedUpdateFolder = folderApi.updateFolder as ReturnType<typeof vi.fn>;

const teamA: Team = {
  teamUuid: "team-A",
  teamName: "Team A",
} as Team;
const teamB: Team = {
  teamUuid: "team-B",
  teamName: "Team B",
} as Team;

const foldersA = [
  { folderUuid: "folder-A1", folderName: "A-1" },
  { folderUuid: "folder-A2", folderName: "A-2" },
];
const foldersB = [{ folderUuid: "folder-B1", folderName: "B-1" }];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 5 * 60 * 1000 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetFolders.mockImplementation((teamUuid: string) => {
    if (teamUuid === "team-A") {
      return Promise.resolve({ success: true, data: foldersA });
    }
    if (teamUuid === "team-B") {
      return Promise.resolve({ success: true, data: foldersB });
    }
    return Promise.resolve({ success: false, data: [] });
  });
});

describe("useFolders", () => {
  describe("enabled / useQueries fetch 동작", () => {
    it("isTeamEnabled가 false인 팀은 fetch하지 않는다", async () => {
      renderHook(
        () =>
          useFolders({
            teams: [teamA, teamB],
            isTeamEnabled: () => false,
          }),
        { wrapper: createWrapper() },
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockedGetFolders).not.toHaveBeenCalled();
    });

    it("isTeamEnabled가 true인 팀만 fetch한다", async () => {
      const { result } = renderHook(
        () =>
          useFolders({
            teams: [teamA, teamB],
            isTeamEnabled: (uuid) => uuid === "team-A",
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual(foldersA);
      });

      expect(mockedGetFolders).toHaveBeenCalledTimes(1);
      expect(mockedGetFolders).toHaveBeenCalledWith("team-A");
      expect(result.current.teamFolders["team-B"]).toBeUndefined();
    });

    it("selectedTeamUuid의 팀은 isTeamEnabled와 무관하게 fetch한다", async () => {
      const { result } = renderHook(
        () =>
          useFolders({
            teams: [teamA, teamB],
            isTeamEnabled: () => false,
            selectedTeamUuid: "team-B",
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.teamFolders["team-B"]).toEqual(foldersB);
      });

      expect(mockedGetFolders).toHaveBeenCalledWith("team-B");
      expect(result.current.teamFolders["team-A"]).toBeUndefined();
    });
  });

  describe("createFolder (useMutation + setQueryData)", () => {
    it("createFolder 호출 후 캐시에 새 폴더가 추가된다", async () => {
      const newFolder = { folderUuid: "folder-A3", folderName: "A-3" };
      mockedCreateFolder.mockResolvedValue({ success: true, data: newFolder });

      const { result } = renderHook(
        () =>
          useFolders({
            teams: [teamA],
            isTeamEnabled: () => true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual(foldersA);
      });

      await act(async () => {
        await result.current.createFolder("team-A", "A-3");
      });

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual([
          ...foldersA,
          newFolder,
        ]);
      });

      expect(mockedCreateFolder).toHaveBeenCalledWith({
        teamUuid: "team-A",
        folderName: "A-3",
      });
    });
  });

  describe("deleteFolder (useMutation + setQueryData)", () => {
    it("deleteFolder 호출 후 캐시에서 해당 폴더가 제거된다", async () => {
      mockedDeleteFolder.mockResolvedValue(undefined);

      const { result } = renderHook(
        () =>
          useFolders({
            teams: [teamA],
            isTeamEnabled: () => true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual(foldersA);
      });

      await act(async () => {
        await result.current.deleteFolder("team-A", "folder-A1");
      });

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual([
          { folderUuid: "folder-A2", folderName: "A-2" },
        ]);
      });

      expect(mockedDeleteFolder).toHaveBeenCalledWith("folder-A1");
    });
  });

  describe("renameFolder (useMutation + setQueryData)", () => {
    it("renameFolder 호출 후 캐시에서 해당 폴더 이름이 변경된다", async () => {
      mockedUpdateFolder.mockResolvedValue({
        success: true,
        data: { folderUuid: "folder-A1", folderName: "A-1-renamed" },
      });

      const { result } = renderHook(
        () =>
          useFolders({
            teams: [teamA],
            isTeamEnabled: () => true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual(foldersA);
      });

      await act(async () => {
        await result.current.renameFolder("team-A", "folder-A1", "A-1-renamed");
      });

      await waitFor(() => {
        expect(result.current.teamFolders["team-A"]).toEqual([
          { folderUuid: "folder-A1", folderName: "A-1-renamed" },
          { folderUuid: "folder-A2", folderName: "A-2" },
        ]);
      });

      expect(mockedUpdateFolder).toHaveBeenCalledWith("folder-A1", {
        folderName: "A-1-renamed",
      });
    });
  });
});

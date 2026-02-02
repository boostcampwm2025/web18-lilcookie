import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { fakeBrowser } from "wxt/testing";

import type { Team } from "../../schemas/auth.type";
import type { FolderResponseData } from "@repo/api";
import App from "./App";

const baseTeam: Team = {
  teamUuid: "11111111-1111-1111-1111-111111111111",
  teamName: "Team Alpha",
  createdAt: "2024-01-01T00:00:00.000Z",
  role: "owner",
};

const secondTeam: Team = {
  teamUuid: "22222222-2222-2222-2222-222222222222",
  teamName: "Team Beta",
  createdAt: "2024-01-02T00:00:00.000Z",
  role: "member",
};

const baseFolder: FolderResponseData = {
  folderUuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  folderName: "Folder One",
  createdAt: "2024-01-01T00:00:00.000Z",
  createdBy: {
    userUuid: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    userName: "Owner",
  },
};

const secondFolder: FolderResponseData = {
  folderUuid: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  folderName: "Folder Two",
  createdAt: "2024-01-02T00:00:00.000Z",
  createdBy: {
    userUuid: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    userName: "Member",
  },
};

let sendMessageMock: ReturnType<typeof vi.spyOn>;
let tabsQueryMock: ReturnType<typeof vi.spyOn>;
let tabsCreateMock: ReturnType<typeof vi.spyOn>;
let storageSessionGetMock: ReturnType<typeof vi.spyOn>;
let storageLocalGetMock: ReturnType<typeof vi.spyOn>;

const setupLoggedOut = () => {
  sendMessageMock.mockResolvedValueOnce({
    isLoggedIn: false,
  });
};

const setupLoggedIn = ({
  teams = [baseTeam],
  selectedTeamUuid = baseTeam.teamUuid,
  folders = [baseFolder],
  selectedFolderUuid = baseFolder.folderUuid,
  pageContentText = "Readable content",
} = {}) => {
  sendMessageMock.mockImplementation(async (message) => {
    if (message?.action === "getAuthState") {
      return {
        isLoggedIn: true,
        userInfo: {
          teams,
          selectedTeamUuid,
        },
      };
    }
    if (message?.action === "getFolders") {
      return { success: true, data: folders };
    }
    if (message?.action === "selectFolder") {
      return { success: true };
    }
    if (message?.action === "selectTeam") {
      return { success: true };
    }
    if (message?.action === "summarize") {
      return { success: true, data: { summary: "AI summary", tags: ["tag1"] } };
    }
    if (message?.action === "saveLink") {
      return { success: true };
    }
    if (message?.action === "login") {
      return { success: true };
    }
    if (message?.action === "logout") {
      return { success: true };
    }
    return { success: true };
  });

  tabsQueryMock.mockResolvedValue([
    {
      title: "Example Title",
      url: "https://example.com",
      favIconUrl: "https://example.com/favicon.ico",
    },
  ]);

  storageSessionGetMock.mockResolvedValue({
    pageContent: { textContent: pageContentText },
  });

  storageLocalGetMock.mockResolvedValue({
    selected_folder_uuid: selectedFolderUuid,
  });
};

describe("Popup App - Behavioral Snapshot Tests", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.clearAllMocks();
    sendMessageMock = vi.spyOn(chrome.runtime, "sendMessage");
    tabsQueryMock = vi.spyOn(chrome.tabs, "query");
    tabsCreateMock = vi.spyOn(chrome.tabs, "create");
    storageSessionGetMock = vi.spyOn(chrome.storage.session, "get");
    storageLocalGetMock = vi.spyOn(chrome.storage.local, "get");
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders loading state while auth is pending", () => {
    sendMessageMock.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<App />);

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("renders logged-out view when not authenticated", async () => {
    setupLoggedOut();

    render(<App />);

    expect(await screen.findByText("로그인이 필요합니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인하기" })).toBeInTheDocument();
  });

  it("renders logged-in view with page info and selectors", async () => {
    setupLoggedIn();

    render(<App />);

    expect(await screen.findByText("Example Title")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
    expect(screen.getByLabelText("폴더 선택")).toBeInTheDocument();
  });

  it("invokes all chrome APIs across initialization and actions", async () => {
    setupLoggedIn({
      teams: [baseTeam, secondTeam],
      folders: [baseFolder, secondFolder],
    });

    render(<App />);

    await screen.findByText("Example Title");

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "getAuthState",
      }),
    );

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "getFolders",
        teamUuid: baseTeam.teamUuid,
      }),
    );

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "selectFolder",
        folderUuid: baseFolder.folderUuid,
      }),
    );

    expect(tabsQueryMock).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(storageSessionGetMock).toHaveBeenCalledWith("pageContent");
    expect(storageLocalGetMock).toHaveBeenCalledWith(
      "selected_folder_uuid",
    );

    const comment = await screen.findByPlaceholderText(
      "URL에 대한 설명을 입력하세요.",
    );
    fireEvent.change(comment, { target: { value: "Test comment" } });

    const tags = screen.getByPlaceholderText(
      "태그를 입력하세요. 콤마(,)로 구분됩니다.",
    );
    fireEvent.change(tags, { target: { value: "tag1" } });

    const aiButton = screen.getByRole("button", { name: "AI 생성" });
    await waitFor(() => expect(aiButton).not.toBeDisabled());
    fireEvent.click(aiButton);

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "summarize",
        content: "Readable content",
      }),
    );

    const saveButton = screen.getByRole("button", { name: "스태시에 저장" });
    await waitFor(() => expect(saveButton).not.toBeDisabled());
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ action: "saveLink" }),
      ),
    );

    const dashboardLink = await screen.findByRole("link", {
      name: /대시보드 열기/,
    });
    fireEvent.click(dashboardLink);
    expect(tabsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining("team/") }),
    );

    fireEvent.change(screen.getByLabelText("팀 선택"), {
      target: { value: secondTeam.teamUuid },
    });

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "selectTeam",
        teamUuid: secondTeam.teamUuid,
      }),
    );

    fireEvent.change(screen.getByLabelText("폴더 선택"), {
      target: { value: secondFolder.folderUuid },
    });

    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "selectFolder",
        folderUuid: secondFolder.folderUuid,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
    await waitFor(() =>
      expect(sendMessageMock).toHaveBeenCalledWith({
        action: "logout",
      }),
    );
  });

  it("shows alert on login failure", async () => {
    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return { isLoggedIn: false };
      }
      if (message?.action === "login") {
        return { success: false, error: "로그인 에러" };
      }
      return { success: true };
    });

    render(<App />);

    const loginButton = await screen.findByRole("button", {
      name: "로그인하기",
    });
    fireEvent.click(loginButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        "로그인 실패: 로그인 에러",
      ),
    );
  });

  it("shows alert on AI error", async () => {
    setupLoggedIn();

    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
        };
      }
      if (message?.action === "getFolders") {
        return { success: true, data: [baseFolder] };
      }
      if (message?.action === "selectFolder") {
        return { success: true };
      }
      if (message?.action === "summarize") {
        throw new Error("AI error");
      }
      return { success: true };
    });

    render(<App />);

    const aiButton = await screen.findByRole("button", { name: "AI 생성" });
    await waitFor(() => expect(aiButton).not.toBeDisabled());
    fireEvent.click(aiButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("오류가 발생했습니다: AI error"),
    );
  });

  it("shows alert on save failure", async () => {
    setupLoggedIn();

    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
        };
      }
      if (message?.action === "getFolders") {
        return { success: true, data: [baseFolder] };
      }
      if (message?.action === "selectFolder") {
        return { success: true };
      }
      if (message?.action === "saveLink") {
        return { success: false, error: "저장 에러" };
      }
      return { success: true };
    });

    render(<App />);

    fireEvent.change(
      await screen.findByPlaceholderText("URL에 대한 설명을 입력하세요."),
      {
        target: { value: "테스트" },
      },
    );
    fireEvent.change(
      screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
      {
        target: { value: "태그" },
      },
    );

    const saveButton = screen.getByRole("button", { name: "스태시에 저장" });
    await waitFor(() => expect(saveButton).not.toBeDisabled());
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("저장 실패: 저장 에러"),
    );
  });

  it("shows alert on save error", async () => {
    setupLoggedIn();

    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
        };
      }
      if (message?.action === "getFolders") {
        return { success: true, data: [baseFolder] };
      }
      if (message?.action === "selectFolder") {
        return { success: true };
      }
      if (message?.action === "saveLink") {
        throw new Error("저장 실패");
      }
      return { success: true };
    });

    render(<App />);

    fireEvent.change(
      await screen.findByPlaceholderText("URL에 대한 설명을 입력하세요."),
      {
        target: { value: "테스트" },
      },
    );
    fireEvent.change(
      screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
      {
        target: { value: "태그" },
      },
    );

    const saveButton = screen.getByRole("button", { name: "스태시에 저장" });
    await waitFor(() => expect(saveButton).not.toBeDisabled());
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        "저장 중 오류가 발생했습니다: 저장 실패",
      ),
    );
  });

  it("shows alert on team change failure and rolls back", async () => {
    let resolveTeamChange: (value: { success: boolean; error?: string }) => void;
    const teamChangePromise = new Promise<{ success: boolean; error?: string }>(
      (resolve) => {
        resolveTeamChange = resolve;
      },
    );

    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: {
            teams: [baseTeam, secondTeam],
            selectedTeamUuid: baseTeam.teamUuid,
          },
        };
      }
      if (message?.action === "getFolders") {
        return { success: true, data: [baseFolder] };
      }
      if (message?.action === "selectFolder") {
        return { success: true };
      }
      if (message?.action === "selectTeam") {
        return teamChangePromise;
      }
      return { success: true };
    });

    render(<App />);

    const teamSelect = await screen.findByLabelText("팀 선택");
    fireEvent.change(teamSelect, { target: { value: secondTeam.teamUuid } });
    expect((teamSelect as HTMLSelectElement).value).toBe(secondTeam.teamUuid);

    resolveTeamChange({ success: false, error: "팀 변경 에러" });

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("팀 변경 실패: 팀 변경 에러"),
    );
    await waitFor(() =>
      expect((teamSelect as HTMLSelectElement).value).toBe(baseTeam.teamUuid),
    );
  });

  it("shows alert on folder load failure", async () => {
    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
        };
      }
      if (message?.action === "getFolders") {
        return { success: false, error: "폴더 에러" };
      }
      return { success: true };
    });

    render(<App />);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("폴더 조회 실패: 폴더 에러"),
    );
  });

  it("shows alert on folder change failure and rolls back", async () => {
    sendMessageMock.mockImplementation(async (message) => {
      if (message?.action === "getAuthState") {
        return {
          isLoggedIn: true,
          userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
        };
      }
      if (message?.action === "getFolders") {
        return { success: true, data: [baseFolder, secondFolder] };
      }
      if (message?.action === "selectFolder") {
        if (message?.folderUuid === secondFolder.folderUuid) {
          return { success: false, error: "폴더 변경 에러" };
        }
        return { success: true };
      }
      return { success: true };
    });

    render(<App />);

    const folderSelect = await screen.findByLabelText("폴더 선택");
    fireEvent.change(folderSelect, {
      target: { value: secondFolder.folderUuid },
    });

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        "폴더 변경 실패: 폴더 변경 에러",
      ),
    );
    await waitFor(() =>
      expect((folderSelect as HTMLSelectElement).value).toBe(
        baseFolder.folderUuid,
      ),
    );
  });

  it(
    "shows AI failure message for 2 seconds before reset",
    async () => {
      setupLoggedIn();
      sendMessageMock.mockImplementation(async (message) => {
        if (message?.action === "getAuthState") {
          return {
            isLoggedIn: true,
            userInfo: { teams: [baseTeam], selectedTeamUuid: baseTeam.teamUuid },
          };
        }
        if (message?.action === "getFolders") {
          return { success: true, data: [baseFolder] };
        }
        if (message?.action === "selectFolder") {
          return { success: true };
        }
        if (message?.action === "summarize") {
          return { success: false };
        }
        return { success: true };
      });

      render(<App />);

      const aiButton = await screen.findByRole("button", { name: "AI 생성" });
      await waitFor(() => expect(aiButton).not.toBeDisabled());
      fireEvent.click(aiButton);

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "AI 생성 실패" }),
        ).toBeInTheDocument(),
      );

      await new Promise((resolve) => setTimeout(resolve, 2100));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "AI 생성" })).toBeInTheDocument(),
      );
    },
    7000,
  );

  it("enforces comment length and paste limits", async () => {
    setupLoggedIn();

    render(<App />);

    const comment = await screen.findByPlaceholderText(
      "URL에 대한 설명을 입력하세요.",
    );
    const longText = "a".repeat(200);
    const tooLongText = "a".repeat(201);

    fireEvent.change(comment, { target: { value: longText } });
    expect((comment as HTMLTextAreaElement).value).toBe(longText);

    fireEvent.change(comment, { target: { value: tooLongText } });
    expect((comment as HTMLTextAreaElement).value).toBe(longText);

    fireEvent.paste(comment, {
      clipboardData: {
        getData: () => "b".repeat(50),
      },
    });

    await waitFor(() =>
      expect((comment as HTMLTextAreaElement).value.length).toBe(200),
    );
  });

  it("prevents invalid comma input when max tags reached", async () => {
    setupLoggedIn();

    render(<App />);

    const tags = await screen.findByPlaceholderText(
      "태그를 입력하세요. 콤마(,)로 구분됩니다.",
    );
    const tenTags = Array.from({ length: 10 })
      .map((_, index) => `t${index}`)
      .join(",");

    fireEvent.change(tags, { target: { value: tenTags } });

    const canceled = !fireEvent.keyDown(tags, { key: "," });
    expect(canceled).toBe(true);
  });
});

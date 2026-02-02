import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from "vitest";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeBrowser } from "wxt/testing";
import App from "./App";

const mockAuthStateLoggedIn = {
  isLoggedIn: true,
  userInfo: {
    teams: [
      { teamUuid: "team-uuid-1", teamName: "Team Alpha" },
      { teamUuid: "team-uuid-2", teamName: "Team Beta" },
    ],
    selectedTeamUuid: "team-uuid-1",
  },
};

const mockAuthStateLoggedOut = {
  isLoggedIn: false,
};

const mockFolders = [
  { folderUuid: "folder-uuid-1", folderName: "Folder One" },
  { folderUuid: "folder-uuid-2", folderName: "Folder Two" },
];

const mockTab = {
  id: 1,
  title: "Test Page Title",
  url: "https://example.com/test",
  favIconUrl: "https://example.com/favicon.ico",
};

const mockPageContent = {
  textContent: "This is the page content for testing AI summarization.",
};

function mockStorageGet(
  storage: typeof chrome.storage.session | typeof chrome.storage.local,
  result: Record<string, unknown>
) {
  vi.spyOn(storage, "get").mockImplementation((keys, callback) => {
    if (typeof callback === "function") {
      callback(result);
    }
    return result;
  });
}

function setupChromeApiMocks(options: {
  authState?: any;
  folders?: any[];
  pageContent?: any;
  tab?: any;
}) {
  const {
    authState = mockAuthStateLoggedIn,
    folders = mockFolders,
    pageContent = mockPageContent,
    tab = mockTab,
  } = options;

  vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
    async (message: any) => {
      switch (message.action) {
        case "getAuthState":
          return authState;
        case "login":
          return { success: true };
        case "logout":
          return { success: true };
        case "summarize":
          return {
            success: true,
            data: { summary: "AI generated summary", tags: ["tag1", "tag2"] },
          };
        case "saveLink":
          return { success: true };
        case "selectTeam":
          return { success: true };
        case "getFolders":
          return { success: true, data: folders };
        case "selectFolder":
          return { success: true };
        default:
          return { success: false, error: "Unknown action" };
      }
    }
  );

  vi.spyOn(chrome.tabs, "query").mockResolvedValue([tab] as any);
  vi.spyOn(chrome.tabs, "create").mockResolvedValue({ id: 2 } as any);

  mockStorageGet(chrome.storage.session, { pageContent });
  mockStorageGet(chrome.storage.local, { selected_folder_uuid: "folder-uuid-1" });
}

describe("App - Behavioral Snapshot Tests", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Render Branches", () => {
    it("shows loading state when auth is loading", async () => {
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        () => new Promise(() => {})
      );

      render(<App />);

      expect(screen.getByText("로딩 중...")).toBeInTheDocument();
    });

    it("shows login screen when not logged in", async () => {
      setupChromeApiMocks({ authState: mockAuthStateLoggedOut });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그인이 필요합니다")).toBeInTheDocument();
      });
      expect(screen.getByText("로그인하기")).toBeInTheDocument();
      expect(screen.getByText("TeamStash")).toBeInTheDocument();
      expect(
        screen.getByText("링크를 빠르게 저장하세요")
      ).toBeInTheDocument();
    });

    it("shows full form when logged in with teams and folders", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그아웃")).toBeInTheDocument();
      });

      expect(await screen.findByText("Test Page Title")).toBeInTheDocument();
      expect(
        await screen.findByText("https://example.com/test"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
      expect(screen.getByLabelText("폴더 선택")).toBeInTheDocument();
      expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      expect(screen.getByText("대시보드 열기 →")).toBeInTheDocument();
    });

    it("shows 'no teams' message when logged in but no teams", async () => {
      setupChromeApiMocks({
        authState: {
          isLoggedIn: true,
          userInfo: { teams: [], selectedTeamUuid: "" },
        },
      });

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText("참여 중인 팀이 없습니다")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Chrome API Interactions", () => {
    it("calls getAuthState on mount", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "getAuthState",
        });
      });
    });

    it("calls tabs.query to get active tab info", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(chrome.tabs.query).toHaveBeenCalledWith({
          active: true,
          currentWindow: true,
        });
      });
    });

    it("calls storage.session.get for pageContent on mount", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(chrome.storage.session.get).toHaveBeenCalledWith("pageContent");
      });
    });

    it("calls login action when login button is clicked", async () => {
      setupChromeApiMocks({ authState: mockAuthStateLoggedOut });
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그인하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("로그인하기"));

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: "login",
      });
    });

    it("calls logout action when logout button is clicked", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그아웃")).toBeInTheDocument();
      });

      await user.click(screen.getByText("로그아웃"));

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: "logout",
      });
    });

    it("calls summarize action when AI button is clicked", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      await user.click(aiButton);

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "summarize",
          content: mockPageContent.textContent,
        });
      });
    });

    it("calls saveLink action when save button is clicked", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText(
        "URL에 대한 설명을 입력하세요."
      );
      const tagsInput = screen.getByPlaceholderText(
        "태그를 입력하세요. 콤마(,)로 구분됩니다."
      );

      await user.type(commentInput, "Test comment");
      await user.type(tagsInput, "tag1, tag2");

      await user.click(screen.getByText("스태시에 저장"));

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "saveLink",
          data: {
            url: "https://example.com/test",
            title: "Test Page Title",
            tags: ["tag1", "tag2"],
            summary: "Test comment",
            folderUuid: "folder-uuid-1",
          },
        });
      });
    });

    it("calls tabs.create when dashboard link is clicked", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("대시보드 열기 →")).toBeInTheDocument();
      });

      await user.click(screen.getByText("대시보드 열기 →"));

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: "https://app.teamstash.test/team/team-uuid-1?folderUuid=folder-uuid-1",
      });
    });

    it("calls selectTeam action when team is changed", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Team Beta" }),
        ).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText("팀 선택"), "team-uuid-2");

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "selectTeam",
          teamUuid: "team-uuid-2",
        });
      });
    });

    it("calls getFolders action when team is changed", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Team Beta" }),
        ).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText("팀 선택"), "team-uuid-2");

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "getFolders",
          teamUuid: "team-uuid-2",
        });
      });
    });

    it("calls storage.local.get for selected_folder_uuid when loading folders", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(chrome.storage.local.get).toHaveBeenCalledWith(
          "selected_folder_uuid"
        );
      });
    });

    it("calls selectFolder action when folder is changed", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("폴더 선택")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Folder Two" }),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByLabelText("폴더 선택"),
        "folder-uuid-2"
      );

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "selectFolder",
          folderUuid: "folder-uuid-2",
        });
      });
    });

    it("calls selectFolder action on initial folder load", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
          action: "selectFolder",
          folderUuid: "folder-uuid-1",
        });
      });
    });
  });

  describe("Error Scenarios", () => {
    it("shows '로그인 실패: ' error on login failure", async () => {
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedOut;
          if (msg.action === "login")
            return { success: false, error: "Test error" };
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그인하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("로그인하기"));

      await waitFor(() => {
        expect(screen.getByText("로그인 실패: Test error")).toBeInTheDocument();
      });
    });

    it("shows '오류가 발생했습니다: ' error when AI throws exception", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "summarize")
            throw new Error("AI service unavailable");
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      await user.click(aiButton);

      await waitFor(() => {
        expect(
          screen.getByText("오류가 발생했습니다: AI service unavailable")
        ).toBeInTheDocument();
      });
    });

    it("shows '저장 실패: ' error on save failure response", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "saveLink")
            return { success: false, error: "Server error" };
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("URL에 대한 설명을 입력하세요."),
        "Test"
      );
      await user.type(
        screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
        "tag"
      );
      await user.click(screen.getByText("스태시에 저장"));

      await waitFor(() => {
        expect(screen.getByText("저장 실패: Server error")).toBeInTheDocument();
      });
    });

    it("shows '저장 중 오류가 발생했습니다: ' error when save throws exception", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "saveLink") throw new Error("Network error");
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("URL에 대한 설명을 입력하세요."),
        "Test"
      );
      await user.type(
        screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
        "tag"
      );
      await user.click(screen.getByText("스태시에 저장"));

      await waitFor(() => {
        expect(
          screen.getByText("저장 중 오류가 발생했습니다: Network error")
        ).toBeInTheDocument();
      });
    });

    it("shows '팀 변경 실패: ' error on team change failure", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "selectTeam")
            return { success: false, error: "Team not found" };
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Team Beta" }),
        ).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText("팀 선택"), "team-uuid-2");

      await waitFor(() => {
        expect(screen.getByText("팀 변경 실패: Team not found")).toBeInTheDocument();
      });
    });

    it("shows '폴더 조회 실패: ' error on folder load failure", async () => {
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: false, error: "Folders not found" };
          return {};
        }
      );
      vi.spyOn(chrome.tabs, "query").mockResolvedValue([mockTab] as any);
      mockStorageGet(chrome.storage.session, { pageContent: mockPageContent });
      mockStorageGet(chrome.storage.local, {});

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByText("폴더 조회 실패: Folders not found")
        ).toBeInTheDocument();
      });
    });

    it("shows '폴더 변경 실패: ' error on folder change failure", async () => {
      let folderChangeCount = 0;
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") {
            folderChangeCount++;
            if (folderChangeCount > 1) {
              return { success: false, error: "Folder not found" };
            }
            return { success: true };
          }
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("폴더 선택")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Folder Two" }),
        ).toBeInTheDocument();
      });

      await user.selectOptions(
        screen.getByLabelText("폴더 선택"),
        "folder-uuid-2"
      );

      await waitFor(() => {
        expect(
          screen.getByText("폴더 변경 실패: Folder not found")
        ).toBeInTheDocument();
      });
    });

    it("shows '알 수 없는 오류' when error message is empty", async () => {
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedOut;
          if (msg.action === "login") return { success: false };
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("로그인하기")).toBeInTheDocument();
      });

      await user.click(screen.getByText("로그인하기"));

      await waitFor(() => {
        expect(
          screen.getByText("로그인 실패: 알 수 없는 오류")
        ).toBeInTheDocument();
      });
    });
  });

  describe("AI Failure Recovery", () => {
    it("shows AI 생성 실패 on failure and recovers after 2 seconds", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "summarize") return { success: false };
          return {};
        }
      );
      vi.spyOn(chrome.tabs, "query").mockResolvedValue([mockTab] as any);
      mockStorageGet(chrome.storage.session, { pageContent: mockPageContent });
      mockStorageGet(chrome.storage.local, {
        selected_folder_uuid: "folder-uuid-1",
      });

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      await waitFor(() => {
        expect(aiButton).not.toBeDisabled();
      });

      await user.click(aiButton);

      await waitFor(() => {
        expect(aiButton.textContent).toContain("AI 생성 실패");
      });

      expect(aiButton).toBeDisabled();

      await waitFor(
        () => {
          expect(aiButton.textContent).toContain("AI 생성");
          expect(aiButton.textContent).not.toContain("AI 생성 실패");
        },
        { timeout: 3000 }
      );

      expect(aiButton).not.toBeDisabled();
    }, 10000);

    it("shows AI 생성 완료 on success", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText("AI 생성 완료")).toBeInTheDocument();
      });
    });
  });

  describe("Optimistic Updates", () => {
    it("updates team selection immediately then reverts on failure", async () => {
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") return { success: true };
          if (msg.action === "selectTeam")
            return { success: false, error: "Team error" };
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("팀 선택")).toBeInTheDocument();
      });

      const teamSelect = screen.getByLabelText("팀 선택") as HTMLSelectElement;
      await waitFor(() => {
        expect(teamSelect.value).toBe("team-uuid-1");
      });

      await user.selectOptions(teamSelect, "team-uuid-2");

      await waitFor(() => {
        expect(teamSelect.value).toBe("team-uuid-1");
      });
    });

    it("updates folder selection immediately then reverts on failure", async () => {
      let folderChangeCount = 0;
      setupChromeApiMocks({});
      vi.spyOn(chrome.runtime, "sendMessage").mockImplementation(
        async (msg: any) => {
          if (msg.action === "getAuthState") return mockAuthStateLoggedIn;
          if (msg.action === "getFolders")
            return { success: true, data: mockFolders };
          if (msg.action === "selectFolder") {
            folderChangeCount++;
            if (folderChangeCount > 1) {
              return { success: false, error: "Folder error" };
            }
            return { success: true };
          }
          return {};
        }
      );

      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText("폴더 선택")).toBeInTheDocument();
      });

      const folderSelect = screen.getByLabelText(
        "폴더 선택"
      ) as HTMLSelectElement;

      await waitFor(() => {
        expect(folderSelect.value).toBe("folder-uuid-1");
      });

      await user.selectOptions(folderSelect, "folder-uuid-2");

      await waitFor(() => {
        expect(folderSelect.value).toBe("folder-uuid-1");
      });
    });

    it("updates dashboard URL optimistically on team change", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("대시보드 열기 →")).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText("팀 선택"), "team-uuid-2");

      await user.click(screen.getByText("대시보드 열기 →"));

      await waitFor(() => {
        const calls = (chrome.tabs.create as Mock).mock.calls || [];
        const hasTeam2Url = calls.some((call: any) =>
          call[0]?.url?.includes("team-uuid-2")
        );
        expect(hasTeam2Url).toBe(true);
      });
    });
  });

  describe("Character Limits", () => {
    it("enforces 200 character limit for comment on change", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("URL에 대한 설명을 입력하세요.")
        ).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText(
        "URL에 대한 설명을 입력하세요."
      );

      const longText = "a".repeat(250);
      await user.type(commentInput, longText);

      expect(
        (commentInput as HTMLTextAreaElement).value.length
      ).toBeLessThanOrEqual(200);
    });

    it("shows correct character count", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("(0/200)")).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText(
        "URL에 대한 설명을 입력하세요."
      );
      await user.type(commentInput, "Hello");

      expect(screen.getByText("(5/200)")).toBeInTheDocument();
    });

    it("handles paste at character limit correctly", async () => {
      setupChromeApiMocks({});

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("URL에 대한 설명을 입력하세요.")
        ).toBeInTheDocument();
      });

      const commentInput = screen.getByPlaceholderText(
        "URL에 대한 설명을 입력하세요."
      ) as HTMLTextAreaElement;

      fireEvent.change(commentInput, { target: { value: "a".repeat(190) } });

      const pasteData = "b".repeat(20);
      fireEvent.paste(commentInput, {
        clipboardData: { getData: () => pasteData },
      });

      expect(commentInput.value.length).toBeLessThanOrEqual(200);
    });

    it("enforces 10 tag maximum", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(
            "태그를 입력하세요. 콤마(,)로 구분됩니다."
          )
        ).toBeInTheDocument();
      });

      const tagsInput = screen.getByPlaceholderText(
        "태그를 입력하세요. 콤마(,)로 구분됩니다."
      );

      await user.type(
        tagsInput,
        "tag1,tag2,tag3,tag4,tag5,tag6,tag7,tag8,tag9"
      );

      fireEvent.keyDown(tagsInput, { key: "," });

      expect((tagsInput as HTMLInputElement).value.split(",").length).toBe(9);
    });

    it("shows correct tag count", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("(0/10)")).toBeInTheDocument();
      });

      const tagsInput = screen.getByPlaceholderText(
        "태그를 입력하세요. 콤마(,)로 구분됩니다."
      );
      await user.type(tagsInput, "tag1, tag2, tag3");

      expect(screen.getByText("(3/10)")).toBeInTheDocument();
    });
  });

  describe("Form Behavior", () => {
    it("disables save button when comment is empty", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      const saveButton = screen.getByText("스태시에 저장").closest("button")!;
      expect(saveButton).toBeDisabled();

      await user.type(
        screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
        "tag"
      );

      expect(saveButton).toBeDisabled();
    });

    it("disables save button when tags are empty", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("URL에 대한 설명을 입력하세요."),
        "comment"
      );

      const saveButton = screen.getByText("스태시에 저장").closest("button")!;
      expect(saveButton).toBeDisabled();
    });

    it("enables save button when both comment and tags are filled", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("URL에 대한 설명을 입력하세요."),
        "comment"
      );
      await user.type(
        screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
        "tag"
      );

      const saveButton = screen.getByText("스태시에 저장").closest("button")!;
      expect(saveButton).not.toBeDisabled();
    });

    it("shows '저장 성공!' after successful save", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("스태시에 저장")).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("URL에 대한 설명을 입력하세요."),
        "comment"
      );
      await user.type(
        screen.getByPlaceholderText("태그를 입력하세요. 콤마(,)로 구분됩니다."),
        "tag"
      );
      await user.click(screen.getByText("스태시에 저장"));

      await waitFor(() => {
        expect(screen.getByText("저장 성공!")).toBeInTheDocument();
      });
    });

    it("disables AI button when no readable page content", async () => {
      setupChromeApiMocks({ pageContent: null });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      expect(aiButton).toBeDisabled();
    });

    it("disables AI button when no teams available", async () => {
      setupChromeApiMocks({
        authState: {
          isLoggedIn: true,
          userInfo: { teams: [], selectedTeamUuid: "" },
        },
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      expect(aiButton).toBeDisabled();
    });

    it("populates comment and tags from AI response", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("AI 생성")).toBeInTheDocument();
      });

      const aiButton = screen.getByText("AI 생성").closest("button")!;
      await user.click(aiButton);

      await waitFor(() => {
        const commentInput = screen.getByPlaceholderText(
          "URL에 대한 설명을 입력하세요."
        ) as HTMLTextAreaElement;
        expect(commentInput.value).toBe("AI generated summary");
      });

      const tagsInput = screen.getByPlaceholderText(
        "태그를 입력하세요. 콤마(,)로 구분됩니다."
      ) as HTMLInputElement;
      expect(tagsInput.value).toBe("tag1, tag2");
    });
  });

  describe("Dashboard URL", () => {
    it("builds correct dashboard URL with team and folder", async () => {
      setupChromeApiMocks({});
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("대시보드 열기 →")).toBeInTheDocument();
      });

      await user.click(screen.getByText("대시보드 열기 →"));

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: "https://app.teamstash.test/team/team-uuid-1?folderUuid=folder-uuid-1",
      });
    });

    it("does not open dashboard when URL is empty", async () => {
      setupChromeApiMocks({
        authState: {
          isLoggedIn: true,
          userInfo: { teams: [], selectedTeamUuid: "" },
        },
        folders: [],
      });
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("대시보드 열기 →")).toBeInTheDocument();
      });

      await user.click(screen.getByText("대시보드 열기 →"));

      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });
  });
});

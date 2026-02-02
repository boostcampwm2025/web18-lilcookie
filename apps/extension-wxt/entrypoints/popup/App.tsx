import { useState, useEffect, useRef } from "react";
import type { Team } from "../../schemas/auth.type";
import type { FolderResponseData } from "@repo/api";
import CommentField from "./components/CommentField";
import FooterLink from "./components/FooterLink";
import Header from "./components/Header";
import FolderSelect from "./components/FolderSelect";
import PageInfoCard from "./components/PageInfoCard";
import SaveButton from "./components/SaveButton";
import TagField from "./components/TagField";
import TeamSelect from "./components/TeamSelect";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "./constants";
import useAuthState from "./hooks/useAuthState";
import type { TabInfo } from "./types";
import { buildDashboardUrl } from "./utils";
import "./App.css";

function App() {
  // State 관리
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiDisabled, setIsAiDisabled] = useState(true);
  const [isAiCompleted, setIsAiCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const [dashboardUrl, setDashboardUrl] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamUuid, setSelectedTeamUuid] = useState("");
  const [folders, setFolders] = useState<FolderResponseData[]>([]);
  const [selectedFolderUuid, setSelectedFolderUuid] = useState("");

  const { authState, isLoggedIn, isAuthLoading, login, logout } = useAuthState();

  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 현재 탭 정보 가져오기
  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (isAuthLoading || !isLoggedIn) return;

      if (!isMounted) return;

      if (authState?.userInfo) {
        const { teams: userTeams, selectedTeamUuid: storedTeamUuid } =
          authState.userInfo;
        setTeams(userTeams ?? []);
        const nextTeamUuid = storedTeamUuid || userTeams?.[0]?.teamUuid || "";
        setSelectedTeamUuid(nextTeamUuid);
        setDashboardUrl(buildDashboardUrl(nextTeamUuid));
        if (!isMounted) return;
        await loadFolders(nextTeamUuid);
        if (!isMounted) return;
      }

      if (!isMounted) return;
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!isMounted) return;

      if (activeTab) {
        setTab({
          title: activeTab.title || "Loading...",
          url: activeTab.url || "Loading...",
          favIconUrl: activeTab.favIconUrl,
        });

        if (!isMounted) return;

        const { pageContent } = await chrome.storage.session.get("pageContent");
        const isReaderable = (pageContent as any)?.textContent;
        const hasNoTeams = (authState?.userInfo?.teams ?? []).length === 0;
        setIsAiDisabled(!isReaderable || hasNoTeams);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [authState, isAuthLoading, isLoggedIn]);

  // 댓글 글자 수 계산
  const commentLength = Math.min(comment.length, MAX_CHARACTER_COUNT);

  // 태그 개수 계산
  const tagCount = tags
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "").length;

  // 저장 버튼 활성화 여부
  const isSaveDisabled =
    !comment.trim() || !tags.trim() || isSaving || isSaveSuccess;

  // 로그인 처리

  // AI 요약 생성
  const handleAiClick = async () => {
    if (!aiButtonRef.current) return;

    const originalHTML = aiButtonRef.current.innerHTML;

    try {
      setIsAiLoading(true);
      setIsAiDisabled(true);

      const { pageContent } = await chrome.storage.session.get("pageContent");

      if (!pageContent || !(pageContent as any)?.textContent) {
        setIsAiLoading(false);
        setIsAiDisabled(false);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: "summarize",
        content: (pageContent as any).textContent,
      });

      if (response && response.success) {
        const { summary, tags: aiTags } = response.data;
        if (summary) {
          setComment(String(summary).slice(0, MAX_CHARACTER_COUNT));
        }
        if (aiTags && Array.isArray(aiTags)) {
          setTags(aiTags.slice(0, MAX_TAG_COUNT).join(", "));
        }
        setIsAiCompleted(true);
        setIsAiLoading(false);
      } else {
        // 실패 시 2초 후 원래 버튼으로 복구
        if (aiButtonRef.current) {
          const svg = aiButtonRef.current.querySelector("svg");
          aiButtonRef.current.innerHTML =
            (svg?.outerHTML || "") + "AI 생성 실패";
        }
        setTimeout(() => {
          if (aiButtonRef.current) {
            aiButtonRef.current.innerHTML = originalHTML;
          }
          setIsAiDisabled(false);
          setIsAiLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("오류가 발생했습니다: " + (error as Error).message);
      setIsAiLoading(false);
      setIsAiDisabled(false);
      if (aiButtonRef.current) {
        aiButtonRef.current.innerHTML = originalHTML;
      }
    }
  };

  // 댓글 입력 처리
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_COUNT) {
      setComment(value);
    }
  };

  // 댓글 키 입력 처리 (200자 제한)
  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const key = e.key;
    const allowedControls = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];
    if (allowedControls.includes(key)) return;

    const target = e.target as HTMLTextAreaElement;
    const selStart = target.selectionStart;
    const selEnd = target.selectionEnd;
    const selectionLength = Math.max(0, selEnd - selStart);
    const currentLength = target.value.length;

    const charLength = key === "Enter" ? 1 : key.length === 1 ? 1 : 0;
    if (charLength === 0) return;

    const newLength = currentLength - selectionLength + charLength;
    if (newLength > MAX_CHARACTER_COUNT) {
      e.preventDefault();
    }
  };

  // 댓글 붙여넣기 처리
  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text") || "";
    const target = e.target as HTMLTextAreaElement;
    const selStart = target.selectionStart;
    const selEnd = target.selectionEnd;
    const selectionLength = Math.abs(selEnd - selStart);
    const currentLength = target.value.length;
    const allowed = MAX_CHARACTER_COUNT - (currentLength - selectionLength);

    if (allowed <= 0) return;

    const toInsert = paste.slice(0, allowed);
    const before = target.value.slice(0, selStart);
    const after = target.value.slice(selEnd);
    const newValue = before + toInsert + after;

    setComment(newValue);

    // 커서 위치 조정
    setTimeout(() => {
      const newCursor = before.length + toInsert.length;
      target.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // 태그 입력 처리
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  // 태그 키 입력 처리 (콤마 제한)
  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ",") {
      const target = e.target as HTMLInputElement;
      const commaCount = (target.value.match(/,/g) || []).length;

      // 1. 최대 태그 수 체크
      if (commaCount >= MAX_TAG_COUNT - 1) {
        e.preventDefault();
        return;
      }

      // 2. 빈 태그 방지
      const cursor = target.selectionStart || 0;
      const val = target.value;
      const before = val.slice(0, cursor);
      const after = val.slice(cursor);

      const trimmedBefore = before.trim();

      // 왼쪽에 유효한 태그가 없으면 콤마 입력 방지
      if (trimmedBefore.length === 0) {
        e.preventDefault();
        return;
      }

      // 이미 콤마로 끝나면 콤마 입력 방지
      if (trimmedBefore.endsWith(",")) {
        e.preventDefault();
        return;
      }

      // 오른쪽이 콤마로 시작하면 콤마 입력 방지
      if (after.trim().startsWith(",")) {
        e.preventDefault();
        return;
      }
    }
  };

  // 저장 처리
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tab) return;

    try {
      const formData = {
        url: tab.url,
        title: tab.title,
        tags: tags
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "")
          .slice(0, MAX_TAG_COUNT),
        summary: comment.slice(0, MAX_CHARACTER_COUNT),
        folderUuid: selectedFolderUuid || undefined,
      };

      setIsSaving(true);

      const response = await chrome.runtime.sendMessage({
        action: "saveLink",
        data: formData,
      });

      if (response && response.success) {
        setIsSaveSuccess(true);
      } else {
        alert("저장 실패: " + (response?.error || "알 수 없는 오류"));
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("저장 중 오류가 발생했습니다: " + (error as Error).message);
      setIsSaving(false);
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dashboardUrl) {
      chrome.tabs.create({ url: dashboardUrl });
    }
  };

  const handleTeamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTeamUuid = e.target.value;
    const previousTeamUuid = selectedTeamUuid;
    const previousFolderUuid = selectedFolderUuid;

    setSelectedTeamUuid(nextTeamUuid);
    setDashboardUrl(buildDashboardUrl(nextTeamUuid));

    const response = await chrome.runtime.sendMessage({
      action: "selectTeam",
      teamUuid: nextTeamUuid,
    });

    if (!response?.success) {
      setSelectedTeamUuid(previousTeamUuid);
      setSelectedFolderUuid(previousFolderUuid);
      setDashboardUrl(buildDashboardUrl(previousTeamUuid, previousFolderUuid));
      alert("팀 변경 실패: " + (response?.error || "알 수 없는 오류"));
      await loadFolders(previousTeamUuid);
      return;
    }

    await loadFolders(nextTeamUuid);
  };

  const loadFolders = async (teamUuid: string) => {
    if (!isMountedRef.current) return;
    if (!teamUuid) {
      setFolders([]);
      setSelectedFolderUuid("");
      setDashboardUrl("");
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: "getFolders",
      teamUuid,
    });

    if (!isMountedRef.current) return;

    if (!response?.success) {
      setFolders([]);
      setSelectedFolderUuid("");
      alert("폴더 조회 실패: " + (response?.error || "알 수 없는 오류"));
      return;
    }

    const folderList = (response.data ?? []) as FolderResponseData[];
    setFolders(folderList);

    const storage = await chrome.storage.local.get("selected_folder_uuid");
    if (!isMountedRef.current) return;
    const storedFolderUuid = storage?.selected_folder_uuid as
      | string
      | undefined;

    const nextFolderUuid =
      (storedFolderUuid &&
        folderList.some((folder) => folder.folderUuid === storedFolderUuid) &&
        storedFolderUuid) ||
      folderList[0]?.folderUuid ||
      "";

    setSelectedFolderUuid(nextFolderUuid);
    setDashboardUrl(buildDashboardUrl(teamUuid, nextFolderUuid));

    if (nextFolderUuid) {
      if (!isMountedRef.current) return;
      await chrome.runtime.sendMessage({
        action: "selectFolder",
        folderUuid: nextFolderUuid,
      });
    }
  };

  const handleFolderChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextFolderUuid = e.target.value;
    const previousFolderUuid = selectedFolderUuid;

    setSelectedFolderUuid(nextFolderUuid);
    setDashboardUrl(buildDashboardUrl(selectedTeamUuid, nextFolderUuid));

    const response = await chrome.runtime.sendMessage({
      action: "selectFolder",
      folderUuid: nextFolderUuid,
    });

    if (!response?.success) {
      setSelectedFolderUuid(previousFolderUuid);
      setDashboardUrl(buildDashboardUrl(selectedTeamUuid, previousFolderUuid));
      alert("폴더 변경 실패: " + (response?.error || "알 수 없는 오류"));
    }
  };

  // 로딩 중
  if (isAuthLoading) {
    return (
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <p>로딩 중...</p>
      </div>
    );
  }

  // 미로그인 상태
  if (!isLoggedIn) {
    return (
      <div className="container">
        <Header showLogout={false} />
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ marginBottom: "20px" }}>로그인이 필요합니다</p>
          <button className="save-btn" onClick={login}>
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  // 로그인 된 상태
  return (
    <div className="container">
      {/* Header */}
      <Header showLogout onLogout={logout} />

      {/* Page Info Card */}
      <PageInfoCard
        title={tab?.title}
        url={tab?.url}
        favIconUrl={tab?.favIconUrl}
      />

      {/* Team Selection */}
      <TeamSelect
        teams={teams}
        value={selectedTeamUuid}
        onChange={handleTeamChange}
      />

      {/* Folder Selection */}
      <FolderSelect
        folders={folders}
        value={selectedFolderUuid}
        onChange={handleFolderChange}
      />

      {/* Form Section */}
      <form className="form-section" onSubmit={handleSave}>
        {/* Comment Field */}
        <CommentField
          comment={comment}
          commentLength={commentLength}
          maxCharacterCount={MAX_CHARACTER_COUNT}
          isAiLoading={isAiLoading}
          isAiDisabled={isAiDisabled}
          isAiCompleted={isAiCompleted}
          isSaveSuccess={isSaveSuccess}
          aiButtonRef={aiButtonRef}
          onAiClick={handleAiClick}
          onCommentChange={handleCommentChange}
          onCommentKeyDown={handleCommentKeyDown}
          onCommentPaste={handleCommentPaste}
        />

        {/* Tag Field */}
        <TagField
          tags={tags}
          tagCount={tagCount}
          maxTagCount={MAX_TAG_COUNT}
          isSaveSuccess={isSaveSuccess}
          isAiLoading={isAiLoading}
          onTagsChange={handleTagsChange}
          onTagsKeyDown={handleTagsKeyDown}
        />

        {/* Save Button */}
        <SaveButton
          isSaveSuccess={isSaveSuccess}
          isSaving={isSaving}
          isDisabled={isSaveDisabled}
        />
      </form>

      <FooterLink
        disabled={!dashboardUrl}
        onClick={handleDashboardClick}
      />
    </div>
  );
}

export default App;

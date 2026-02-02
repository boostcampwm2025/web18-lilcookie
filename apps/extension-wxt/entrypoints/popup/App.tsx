import { useState, useEffect, useRef } from "react";
import CommentField from "./components/CommentField";
import FooterLink from "./components/FooterLink";
import Header from "./components/Header";
import FolderSelect from "./components/FolderSelect";
import PageInfoCard from "./components/PageInfoCard";
import SaveButton from "./components/SaveButton";
import TagField from "./components/TagField";
import TeamSelect from "./components/TeamSelect";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "./constants";
import useAiSummary from "./hooks/useAiSummary";
import useAuthState from "./hooks/useAuthState";
import useTeamFolder from "./hooks/useTeamFolder";
import useTabInfo from "./hooks/useTabInfo";
import "./App.css";

function App() {
  // State 관리
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const { authState, isLoggedIn, isAuthLoading, login, logout } =
    useAuthState();
  const hasNoTeams = (authState?.userInfo?.teams ?? []).length === 0;
  const { tab, isAiDisabled, setIsAiDisabled } = useTabInfo({
    isLoggedIn,
    hasNoTeams,
  });

  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    teams,
    selectedTeamUuid,
    folders,
    selectedFolderUuid,
    dashboardUrl,
    handleTeamChange,
    handleFolderChange,
  } = useTeamFolder({
    authState,
    isAuthLoading,
    isLoggedIn,
    isMountedRef,
  });

  const { isAiLoading, isAiCompleted, handleAiClick } = useAiSummary({
    aiButtonRef,
    setComment,
    setTags,
    setIsAiDisabled,
  });

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

      <FooterLink disabled={!dashboardUrl} onClick={handleDashboardClick} />
    </div>
  );
}

export default App;

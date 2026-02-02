import { useState, useEffect, useRef } from "react";
import CommentField from "./components/CommentField";
import FooterLink from "./components/FooterLink";
import Header from "./components/Header";
import FolderSelect from "./components/FolderSelect";
import PageInfoCard from "./components/PageInfoCard";
import SaveButton from "./components/SaveButton";
import TagField from "./components/TagField";
import TeamSelect from "./components/TeamSelect";
import Toast from "./components/Toast";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "./constants";
import useAiSummary from "./hooks/useAiSummary";
import useAuthState from "./hooks/useAuthState";
import useLinkSave from "./hooks/useLinkSave";
import useTeamFolder from "./hooks/useTeamFolder";
import useTabInfo from "./hooks/useTabInfo";
import "./App.css";

function App() {
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
  };

  const { authState, isLoggedIn, isAuthLoading, login, logout } = useAuthState({
    onError: showToast,
  });
  const hasNoTeams = (authState?.userInfo?.teams ?? []).length === 0;
  const { tab, isAiDisabled, setIsAiDisabled } = useTabInfo({
    isLoggedIn,
    hasNoTeams,
  });
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
    onError: showToast,
  });

  const {
    comment,
    tags,
    commentLength,
    tagCount,
    isSaving,
    isSaveSuccess,
    isSaveDisabled,
    setComment,
    setTags,
    handleCommentChange,
    handleCommentKeyDown,
    handleCommentPaste,
    handleTagsChange,
    handleTagsKeyDown,
    handleSave,
  } = useLinkSave({
    tab,
    selectedFolderUuid,
    onError: showToast,
  });

  const { isAiLoading, isAiCompleted, isAiFailed, handleAiClick } =
    useAiSummary({
      setComment,
      setTags,
      setIsAiDisabled,
      onError: showToast,
    });

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dashboardUrl) {
      chrome.tabs.create({ url: dashboardUrl });
    }
  };

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

  if (!isLoggedIn) {
    return (
      <div className="container">
        <Header showLogout={false} />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ marginBottom: "20px" }}>로그인이 필요합니다</p>
          <button className="save-btn" onClick={login}>
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header showLogout onLogout={logout} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <PageInfoCard
        title={tab?.title}
        url={tab?.url}
        favIconUrl={tab?.favIconUrl}
      />
      <TeamSelect
        teams={teams}
        value={selectedTeamUuid}
        onChange={handleTeamChange}
      />
      <FolderSelect
        folders={folders}
        value={selectedFolderUuid}
        onChange={handleFolderChange}
      />
      <form className="form-section" onSubmit={handleSave}>
        <CommentField
          comment={comment}
          commentLength={commentLength}
          maxCharacterCount={MAX_CHARACTER_COUNT}
          isAiLoading={isAiLoading}
          isAiDisabled={isAiDisabled}
          isAiCompleted={isAiCompleted}
          isAiFailed={isAiFailed}
          isSaveSuccess={isSaveSuccess}
          onAiClick={handleAiClick}
          onCommentChange={handleCommentChange}
          onCommentKeyDown={handleCommentKeyDown}
          onCommentPaste={handleCommentPaste}
        />
        <TagField
          tags={tags}
          tagCount={tagCount}
          maxTagCount={MAX_TAG_COUNT}
          isSaveSuccess={isSaveSuccess}
          isAiLoading={isAiLoading}
          onTagsChange={handleTagsChange}
          onTagsKeyDown={handleTagsKeyDown}
        />
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

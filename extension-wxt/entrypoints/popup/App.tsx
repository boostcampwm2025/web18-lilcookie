import { useState, useEffect, useRef } from "react";
import "./App.css";

// 상수 정의
const isDev = false;
const BASE_URL = isDev
  ? "http://localhost:5173"
  : "https://link-repository.eupthere.uk";
const MAX_TAG_COUNT = 10;
const MAX_CHARACTER_COUNT = 200;

interface TabInfo {
  title: string;
  url: string;
  favIconUrl?: string;
}

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
  const [isDashboardDisabled, setIsDashboardDisabled] = useState(true);
  const [showDashboardNotice, setShowDashboardNotice] = useState(false);

  const aiButtonRef = useRef<HTMLButtonElement>(null);

  // 현재 탭 정보 가져오기
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab) {
        setTab({
          title: activeTab.title || "Loading...",
          url: activeTab.url || "Loading...",
          favIconUrl: activeTab.favIconUrl,
        });

        // 페이지 내용이 있는지 확인하여 AI 버튼 활성화 여부 결정
        chrome.storage.local.get("pageContent", ({ pageContent }) => {
          const isReaderable = pageContent?.textContent;
          setIsAiDisabled(!isReaderable);
        });
      }
    });

    // 대시보드 링크 설정
    chrome.storage.sync.get("teamId", ({ teamId }) => {
      if (teamId) {
        setDashboardUrl(`${BASE_URL}/${teamId.toLowerCase()}`);
        setIsDashboardDisabled(false);
        setShowDashboardNotice(false);
      } else {
        setDashboardUrl("");
        setIsDashboardDisabled(true);
        setShowDashboardNotice(true);
      }
    });
  }, []);

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

  // 설정 페이지 열기
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  // AI 요약 생성
  const handleAiClick = () => {
    if (!aiButtonRef.current) return;

    const originalHTML = aiButtonRef.current.innerHTML;

    setIsAiLoading(true);
    setIsAiDisabled(true);

    chrome.storage.local.get("pageContent", (result) => {
      const pageContent = result?.pageContent as any;

      if (!pageContent || !pageContent.textContent) {
        setIsAiLoading(false);
        setIsAiDisabled(false);
        return;
      }

      chrome.storage.sync.get("aiPassword", (aiResult) => {
        const aiPassword = aiResult?.aiPassword;

        if (!aiPassword) {
          if (
            confirm(
              "AI 기능을 사용하려면 설정에서 비밀번호를 입력해야 합니다. 설정 페이지로 이동하시겠습니까?"
            )
          ) {
            if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            } else {
              window.open(chrome.runtime.getURL("options.html"));
            }
          }
          setIsAiLoading(false);
          setIsAiDisabled(false);
          return;
        }

        // Firefox MV2: sendMessage also needs callback pattern
        chrome.runtime.sendMessage(
          {
            action: "summarize",
            content: pageContent.textContent,
            aiPassword,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              alert("오류가 발생했습니다: " + chrome.runtime.lastError.message);
              setIsAiLoading(false);
              setIsAiDisabled(false);
              if (aiButtonRef.current) {
                aiButtonRef.current.innerHTML = originalHTML;
              }
              return;
            }

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
          }
        );
      });
    });
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
    e: React.KeyboardEvent<HTMLTextAreaElement>
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
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Firefox MV2: storage.sync.get also needs callback pattern
    chrome.storage.sync.get(["camperId", "teamId"], (storageData) => {
      if (chrome.runtime.lastError) {
        alert("설정을 불러오는데 실패했습니다.");
        return;
      }

      const camperId = storageData?.camperId;
      const teamId = storageData?.teamId;

      if (!camperId || !teamId) {
        alert("사용자 설정에서 캠퍼 ID와 팀 ID를 입력해주세요.");
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        }
        return;
      }

      if (!tab) return;

      const formData = {
        userId: camperId,
        teamId: teamId,
        url: tab.url,
        title: tab.title,
        tags: tags
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "")
          .slice(0, MAX_TAG_COUNT),
        summary: comment.slice(0, MAX_CHARACTER_COUNT),
      };

      setIsSaving(true);

      chrome.runtime.sendMessage(
        { action: "saveLink", data: formData },
        (response) => {
          if (chrome.runtime.lastError) {
            alert(
              "저장 중 오류가 발생했습니다: " + chrome.runtime.lastError.message
            );
            setIsSaving(false);
            return;
          }

          if (response && response.success) {
            setIsSaveSuccess(true);
            // 필드 초기화는 하지 않고 버튼만 "저장 성공!" 표시
          } else {
            alert("저장 실패: " + (response?.error || "알 수 없는 오류"));
            setIsSaving(false);
          }
        }
      );
    });
  };

  // 대시보드 열기
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dashboardUrl && !isDashboardDisabled) {
      chrome.tabs.create({ url: dashboardUrl });
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 11.0341C0 4.94016 4.94015 0 11.0341 0H24.2751C30.3691 0 35.3092 4.94015 35.3092 11.0341V24.2751C35.3092 30.3691 30.3691 35.3092 24.2751 35.3092H11.0341C4.94016 35.3092 0 30.3691 0 24.2751V11.0341Z"
                fill="#E0E7FF"
              />
              <path
                d="M22.8032 24.275L17.6539 21.3326L12.5046 24.275V12.5053C12.5046 12.1151 12.6596 11.7409 12.9355 11.465C13.2115 11.1891 13.5857 11.0341 13.9759 11.0341H21.3319C21.7221 11.0341 22.0963 11.1891 22.3723 11.465C22.6482 11.7409 22.8032 12.1151 22.8032 12.5053V24.275Z"
                stroke="#4F39F6"
                strokeWidth="1.47122"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="header-text">
            <h1 className="app-name">TeamStash</h1>
            <p className="tagline">링크를 빠르게 저장하세요</p>
          </div>
        </div>
        <a href="#" onClick={handleSettingsClick} className="settings-link">
          사용자 설정
        </a>
      </header>

      {/* Page Info Card */}
      <div className="page-info-card">
        <div className="page-icon">
          {tab?.favIconUrl && (
            <img src={tab.favIconUrl} alt="favicon" className="favicon" />
          )}
        </div>
        <div className="page-details">
          <h2 className="page-title">{tab?.title || "Loading..."}</h2>
          <p className="page-url">{tab?.url || "Loading..."}</p>
        </div>
      </div>

      {/* Form Section */}
      <form className="form-section" onSubmit={handleSave}>
        {/* Comment Field */}
        <div className="input-group">
          <div className="label-row">
            <label>
              코멘트{" "}
              <span className="char-count">
                ({commentLength}/{MAX_CHARACTER_COUNT})
              </span>
            </label>
            <button
              ref={aiButtonRef}
              type="button"
              className={`ai-badge-btn ${isAiLoading ? "loading" : ""}`}
              onClick={handleAiClick}
              disabled={isAiDisabled || isAiCompleted}
              title={
                isAiDisabled
                  ? "이 페이지는 요약할 수 없습니다"
                  : "AI로 요약 생성"
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_81_172)">
                  <path
                    d="M6.08104 1.55246C6.10468 1.4259 6.17184 1.31159 6.27088 1.22934C6.36992 1.14708 6.49462 1.10205 6.62337 1.10205C6.75212 1.10205 6.87681 1.14708 6.97585 1.22934C7.0749 1.31159 7.14206 1.4259 7.16569 1.55246L7.74554 4.61885C7.78672 4.83685 7.89267 5.03738 8.04954 5.19426C8.20642 5.35114 8.40695 5.45708 8.62496 5.49827L11.6913 6.07811C11.8179 6.10175 11.9322 6.16891 12.0145 6.26795C12.0967 6.367 12.1418 6.49169 12.1418 6.62044C12.1418 6.74919 12.0967 6.87388 12.0145 6.97292C11.9322 7.07197 11.8179 7.13913 11.6913 7.16276L8.62496 7.74261C8.40695 7.78379 8.20642 7.88974 8.04954 8.04662C7.89267 8.20349 7.78672 8.40402 7.74554 8.62203L7.16569 11.6884C7.14206 11.815 7.0749 11.9293 6.97585 12.0115C6.87681 12.0938 6.75212 12.1388 6.62337 12.1388C6.49462 12.1388 6.36992 12.0938 6.27088 12.0115C6.17184 11.9293 6.10468 11.815 6.08104 11.6884L5.5012 8.62203C5.46001 8.40402 5.35407 8.20349 5.19719 8.04662C5.04031 7.88974 4.83978 7.78379 4.62178 7.74261L1.55539 7.16276C1.42883 7.13913 1.31452 7.07197 1.23227 6.97292C1.15001 6.87388 1.10498 6.74919 1.10498 6.62044C1.10498 6.49169 1.15001 6.367 1.23227 6.26795C1.31452 6.16891 1.42883 6.10175 1.55539 6.07811L4.62178 5.49827C4.83978 5.45708 5.04031 5.35114 5.19719 5.19426C5.35407 5.03738 5.46001 4.83685 5.5012 4.61885L6.08104 1.55246Z"
                    stroke="#9810FA"
                    strokeWidth="1.10341"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.0388 1.10327V3.3101"
                    stroke="#9810FA"
                    strokeWidth="1.10341"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.1414 2.20679H9.93457"
                    stroke="#9810FA"
                    strokeWidth="1.10341"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.21206 12.1375C2.82145 12.1375 3.31547 11.6435 3.31547 11.0341C3.31547 10.4247 2.82145 9.93066 2.21206 9.93066C1.60266 9.93066 1.10864 10.4247 1.10864 11.0341C1.10864 11.6435 1.60266 12.1375 2.21206 12.1375Z"
                    stroke="#9810FA"
                    strokeWidth="1.10341"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_81_172">
                    <rect width="13.241" height="13.241" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              {isAiCompleted ? "AI 생성 완료" : "AI 생성"}
            </button>
          </div>
          <textarea
            id="comment"
            name="comment"
            placeholder={isSaveSuccess ? "" : "URL에 대한 설명을 입력하세요."}
            value={comment}
            onChange={handleCommentChange}
            onKeyDown={handleCommentKeyDown}
            onPaste={handleCommentPaste}
            disabled={isSaveSuccess}
            className={isAiLoading ? "loading" : ""}
          />
        </div>

        {/* Tag Field */}
        <div className="input-group">
          <div className="label-row">
            <label>
              태그{" "}
              <span className="tag-count">
                ({Math.min(tagCount, MAX_TAG_COUNT)}/{MAX_TAG_COUNT})
              </span>
            </label>
          </div>
          <div className="tag-input-container">
            <input
              id="tags"
              type="text"
              name="tags"
              placeholder={
                isSaveSuccess ? "" : "태그를 입력하세요. 콤마(,)로 구분됩니다."
              }
              value={tags}
              onChange={handleTagsChange}
              onKeyDown={handleTagsKeyDown}
              disabled={isSaveSuccess}
              className={isAiLoading ? "loading" : ""}
            />
          </div>
        </div>

        {/* Save Button */}
        <button type="submit" className="save-btn" disabled={isSaveDisabled}>
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.4711 19.3097L11.0345 15.6317L4.5979 19.3097V4.59757C4.5979 4.10983 4.79165 3.64207 5.13654 3.29718C5.48142 2.9523 5.94918 2.75854 6.43692 2.75854H15.632C16.1198 2.75854 16.5875 2.9523 16.9324 3.29718C17.2773 3.64207 17.4711 4.10983 17.4711 4.59757V19.3097Z"
              stroke="#A1A1A1"
              strokeWidth="1.83902"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isSaveSuccess
            ? "저장 성공!"
            : isSaving
              ? "저장 중..."
              : "스태시에 저장"}
        </button>
      </form>

      {/* Footer */}
      <footer className="footer">
        <a
          href="#"
          onClick={handleDashboardClick}
          className={`dashboard-link ${isDashboardDisabled ? "disabled" : ""}`}
        >
          대시보드 열기 →
        </a>
        {showDashboardNotice && (
          <p className="dashboard-notice">사용자 설정을 먼저 해주세요</p>
        )}
      </footer>
    </div>
  );
}

export default App;

import { AiSparkleIcon } from "./icons";

type CommentFieldProps = {
  comment: string;
  commentLength: number;
  maxCharacterCount: number;
  isAiLoading: boolean;
  isAiDisabled: boolean;
  isAiCompleted: boolean;
  isAiFailed: boolean;
  isSaveSuccess: boolean;
  onAiClick: () => void;
  onCommentChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCommentKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCommentPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
};

function CommentField({
  comment,
  commentLength,
  maxCharacterCount,
  isAiLoading,
  isAiDisabled,
  isAiCompleted,
  isAiFailed,
  isSaveSuccess,
  onAiClick,
  onCommentChange,
  onCommentKeyDown,
  onCommentPaste,
}: CommentFieldProps) {
  return (
    <div className="input-group">
      <div className="label-row">
        <label>
          코멘트{" "}
          <span className="char-count">
            ({commentLength}/{maxCharacterCount})
          </span>
        </label>
        <div className="ai-controls">
          <button
            type="button"
            className={`ai-badge-btn ${isAiLoading ? "loading" : ""}`}
            onClick={onAiClick}
            disabled={isAiDisabled || isAiCompleted}
            title={
              isAiDisabled ? "이 페이지는 요약할 수 없습니다" : "AI로 요약 생성"
            }
          >
            <AiSparkleIcon />
            {isAiFailed
              ? "AI 생성 실패"
              : isAiCompleted
                ? "AI 생성 완료"
                : "AI 생성"}
          </button>
          {isAiDisabled && (
            <div className="ai-info">
              <button
                type="button"
                className="ai-info-button"
                aria-label="AI 요약 안내"
                aria-describedby="ai-info-popup"
              >
                i
              </button>
              <span className="ai-info-popup" id="ai-info-popup" role="tooltip">
                <b>이 페이지는 요약할 수 없어요.</b>
                <br /> 본문 형태의 글을 찾지 못해 AI 요약이 지원되지 않을 수
                있습니다. (예: 이미지 위주 페이지, 앱 형태의 웹사이트 등)
              </span>
            </div>
          )}
        </div>
      </div>
      <textarea
        id="comment"
        name="comment"
        placeholder={isSaveSuccess ? "" : "URL에 대한 설명을 입력하세요."}
        value={comment}
        onChange={onCommentChange}
        onKeyDown={onCommentKeyDown}
        onPaste={onCommentPaste}
        disabled={isSaveSuccess}
        className={isAiLoading ? "loading" : ""}
      />
    </div>
  );
}

export default CommentField;

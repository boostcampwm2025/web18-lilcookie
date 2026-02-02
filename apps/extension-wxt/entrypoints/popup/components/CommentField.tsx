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
          {isAiFailed ? "AI 생성 실패" : isAiCompleted ? "AI 생성 완료" : "AI 생성"}
        </button>
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

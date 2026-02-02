type TagFieldProps = {
  tags: string;
  tagCount: number;
  maxTagCount: number;
  isSaveSuccess: boolean;
  isAiLoading: boolean;
  onTagsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTagsKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

function TagField({
  tags,
  tagCount,
  maxTagCount,
  isSaveSuccess,
  isAiLoading,
  onTagsChange,
  onTagsKeyDown,
}: TagFieldProps) {
  return (
    <div className="input-group">
      <div className="label-row">
        <label>
          태그{" "}
          <span className="tag-count">
            ({Math.min(tagCount, maxTagCount)}/{maxTagCount})
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
          onChange={onTagsChange}
          onKeyDown={onTagsKeyDown}
          disabled={isSaveSuccess}
          className={isAiLoading ? "loading" : ""}
        />
      </div>
    </div>
  );
}

export default TagField;

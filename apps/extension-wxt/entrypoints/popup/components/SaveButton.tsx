import { SaveIcon } from "./icons";

type SaveButtonProps = {
  isSaveSuccess: boolean;
  isSaving: boolean;
  isDisabled: boolean;
};

function SaveButton({ isSaveSuccess, isSaving, isDisabled }: SaveButtonProps) {
  return (
    <button type="submit" className="save-btn" disabled={isDisabled}>
      <SaveIcon />
      {isSaveSuccess ? "저장 성공!" : isSaving ? "저장 중..." : "스태시에 저장"}
    </button>
  );
}

export default SaveButton;

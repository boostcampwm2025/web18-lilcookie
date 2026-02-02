import { SaveIcon } from "./icons";

type SaveButtonProps = {
  isSaveSuccess: boolean;
  isSaving: boolean;
  isDisabled: boolean;
  isTeamFolderSelected?: boolean;
};

function SaveButton({
  isSaveSuccess,
  isSaving,
  isDisabled,
  isTeamFolderSelected,
}: SaveButtonProps) {
  return (
    <>
      <button
        type="submit"
        className="save-btn"
        disabled={isDisabled || !isTeamFolderSelected}
      >
        <SaveIcon />
        {isSaveSuccess
          ? "저장 성공!"
          : isSaving
            ? "저장 중..."
            : "스태시에 저장"}
      </button>
      {!isTeamFolderSelected && (
        <div className="warning-message">
          <span>팀 폴더를 선택해야 저장 가능합니다.</span>
          <br />
          <span>대시보드에 방문해 팀을 만들거나 참여할 수 있습니다.</span>
        </div>
      )}
    </>
  );
}

export default SaveButton;

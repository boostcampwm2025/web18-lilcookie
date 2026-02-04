import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2 } from "lucide-react";
import { teamApi } from "../../services/api";
import { useTeams } from "../../contexts/TeamContext";
import SectionContainer from "../common/SectionContainer";
import { DeleteTeamModal } from "./DeleteTeamModal";

interface TeamLeaveSectionProps {
  teamUuid: string;
  teamName: string;
  isAdmin: boolean;
  isAlone: boolean;
  onDeleteSuccess: () => void;
  onError?: (message: string) => void;
}

export const TeamLeaveSection = ({
  teamUuid,
  teamName,
  isAdmin,
  isAlone,
  onDeleteSuccess,
  onError,
}: TeamLeaveSectionProps) => {
  const navigate = useNavigate();
  const { refreshTeams } = useTeams();
  const [leaving, setLeaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleLeaveTeam = async () => {
    if (!confirm("정말 이 팀에서 탈퇴하시겠습니까?")) return;

    try {
      setLeaving(true);
      await teamApi.leaveTeam(teamUuid!);
      await refreshTeams();
      navigate("/my-teams");
    } catch {
      onError?.("팀 탈퇴에 실패했습니다.");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <>
      <SectionContainer
        title={isAdmin && isAlone ? "팀 삭제" : "팀 탈퇴"}
        subtitle={
          isAdmin && isAlone
            ? "팀을 삭제하면 모든 데이터가 영구적으로 삭제됩니다."
            : isAdmin
              ? "관리자는 팀에서 탈퇴할 수 없습니다. 다른 멤버에게 관리자 권한을 넘긴 후 탈퇴해주세요."
              : "팀에서 탈퇴하면 더 이상 이 팀의 콘텐츠에 접근할 수 없습니다."
        }
      >
        {isAdmin && isAlone ? (
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />팀 삭제
          </button>
        ) : (
          <button
            onClick={handleLeaveTeam}
            disabled={isAdmin || leaving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {leaving ? "탈퇴 중..." : "팀 탈퇴"}
          </button>
        )}
      </SectionContainer>

      <DeleteTeamModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        teamName={teamName}
        teamUuid={teamUuid}
        onSuccess={onDeleteSuccess}
      />
    </>
  );
};

import { useState } from "react";
import { UserMinus, X } from "lucide-react";
import type { GetTeamMembersResponseData } from "@repo/api";
import { MemberSelectItem } from "./MemberSelectItem";
import { teamApi } from "../../services/api";

interface KickMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GetTeamMembersResponseData[]; // 전체 멤버 (owner 제외하고 넘겨주기)
  teamUuid: string;
  onSuccess: () => void;
}

export const KickMembersModal = ({
  isOpen,
  onClose,
  members,
  teamUuid,
  onSuccess,
}: KickMembersModalProps) => {
  const [selectedMembers, setSelectedMembers] = useState<
    GetTeamMembersResponseData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleMember = (member: GetTeamMembersResponseData) => {
    setSelectedMembers((prev) => {
      const isAlreadySelected = prev.some(
        (m) => m.userUuid === member.userUuid,
      );
      if (isAlreadySelected) {
        return prev.filter((m) => m.userUuid !== member.userUuid);
      }
      return [...prev, member];
    });
  };

  const isSelected = (member: GetTeamMembersResponseData) => {
    return selectedMembers.some((m) => m.userUuid === member.userUuid);
  };

  const handleKick = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const targetUserUuids = selectedMembers.map((m) => m.userUuid);
      await teamApi.kickMembers(teamUuid, targetUserUuids);

      onSuccess();
      onClose();
    } catch {
      setError("팀원 강퇴에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setError(null);
    onClose();
  };

  const getConfirmMessage = () => {
    if (selectedMembers.length === 0) {
      return <span className="text-gray-400">강퇴할 팀원을 선택해주세요</span>;
    }
    if (selectedMembers.length === 1) {
      return (
        <>
          <span className="font-semibold text-gray-900">
            {selectedMembers[0].userName}
          </span>
          님을 강퇴하시겠습니까?
        </>
      );
    }
    return (
      <>
        <span className="font-semibold text-gray-900">
          {selectedMembers[0].userName}
        </span>
        님 외 {selectedMembers.length - 1}명을 강퇴하시겠습니까?
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 m-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">팀원 강퇴</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* 주의사항 */}
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[13px] text-red-800">
              강퇴된 팀원은 팀에 다시 가입할 수 있습니다.
            </p>
          </div>

          {/* 팀원 선택 안내 */}
          <p className="text-sm text-gray-600 mb-3">
            강퇴할 팀원을 선택하세요 (복수 선택 가능)
          </p>

          {/* 팀원 목록 (스크롤) */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mb-4">
            {members.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">
                강퇴할 수 있는 팀원이 없습니다.
              </p>
            ) : (
              members.map((member) => (
                <MemberSelectItem
                  key={member.userUuid}
                  member={member}
                  isSelected={isSelected(member)}
                  onSelect={handleToggleMember}
                  colorTheme="red"
                />
              ))
            )}
          </div>

          {/* 선택된 멤버 확인 */}
          <p className="text-sm text-gray-700 mb-4 h-5">
            {getConfirmMessage()}
          </p>

          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleKick}
              disabled={selectedMembers.length === 0 || loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "강퇴 중..." : `강퇴 (${selectedMembers.length}명)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

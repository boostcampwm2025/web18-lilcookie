import { useState } from "react";
import { Crown, X, Check } from "lucide-react";
import { teamApi } from "../../services/api";
import type { GetTeamMembersResponseData } from "@repo/api";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GetTeamMembersResponseData[]; // 전체 멤버 (owner 제외하고 넘겨주기)
  teamUuid: string;
  onSuccess: () => void;
}

export const TransferOwnershipModal = ({
  isOpen,
  onClose,
  members,
  teamUuid,
  onSuccess,
}: TransferOwnershipModalProps) => {
  const [selectedMember, setSelectedMember] =
    useState<GetTeamMembersResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      setError(null);
      await teamApi.transferOwnership(teamUuid, selectedMember.userUuid);
      onSuccess();
      onClose();
    } catch {
      setError("권한 위임에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setError(null);
    onClose();
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
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">권한 위임</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* 주의사항 */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[13px] text-amber-800">
              권한을 위임하면 본인은 일반 멤버가 되며, 팀 설정 권한을 잃게
              됩니다.
            </p>
          </div>

          {/* 팀원 선택 안내 */}
          <p className="text-sm text-gray-600 mb-3">
            권한을 위임할 팀원을 선택하세요
          </p>

          {/* 팀원 목록 (스크롤) */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mb-4">
            {members.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">
                위임할 수 있는 팀원이 없습니다.
              </p>
            ) : (
              members.map((member) => (
                <button
                  key={member.userUuid}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedMember?.userUuid === member.userUuid
                      ? "bg-amber-50"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900">
                      {member.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {member.userEmail}
                    </span>
                  </div>
                  {selectedMember?.userUuid === member.userUuid && (
                    <Check className="w-5 h-5 text-amber-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* 선택된 멤버 확인 */}
          <p className="text-sm text-gray-700 mb-4 h-5">
            {selectedMember ? (
              <>
                <span className="font-semibold text-gray-900">
                  {selectedMember.userName}
                </span>
                님에게 권한을 위임하시겠습니까?
              </>
            ) : (
              <span className="text-gray-400">팀원을 선택해주세요</span>
            )}
          </p>

          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleTransfer}
              disabled={!selectedMember || loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "위임 중..." : "권한 위임"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

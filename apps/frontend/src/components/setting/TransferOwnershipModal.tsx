import { useState } from "react";
import { Crown, X } from "lucide-react";
import { teamApi } from "../../services/api";
import type { GetTeamMembersResponseData } from "@repo/api";

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: GetTeamMembersResponseData | null;
  teamUuid: string;
  onSuccess: () => void;
}

export const TransferOwnershipModal = ({
  isOpen,
  onClose,
  targetMember,
  teamUuid,
  onSuccess,
}: TransferOwnershipModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetMember) return null;

  const handleTransfer = async () => {
    try {
      setLoading(true);
      setError(null);
      await teamApi.transferOwnership(teamUuid, targetMember.userUuid);
      onSuccess();
      onClose();
    } catch {
      setError("권한 위임에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">권한 위임</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-600 mb-4">
            <span className="font-semibold text-gray-900">
              {targetMember.userName}
            </span>
            님에게 팀 관리자 권한을 위임하시겠습니까?
          </p>
          <p className="text-sm text-gray-500 mb-5">
            권한을 위임하면 본인은 일반 멤버가 되며, 팀 설정 권한을 잃게 됩니다.
          </p>

          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {loading ? "위임 중..." : "권한 위임"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

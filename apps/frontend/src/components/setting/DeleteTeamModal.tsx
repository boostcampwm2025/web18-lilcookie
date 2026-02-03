import { useState, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { teamApi } from "../../services/api";

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  teamUuid: string;
  onSuccess: () => void;
}

export const DeleteTeamModal = ({
  isOpen,
  onClose,
  teamName,
  teamUuid,
  onSuccess,
}: DeleteTeamModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isConfirmed = inputValue === teamName;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      setLoading(true);
      setError(null);
      await teamApi.deleteTeam(teamUuid);
      onSuccess();
    } catch {
      setError("팀 삭제에 실패했습니다.");
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
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">팀 삭제</h2>
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
          <p className="text-gray-600 mb-2">
            정말 이 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            팀의 모든 폴더, 링크, 웹훅이 영구적으로 삭제됩니다.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              확인을 위해 팀 이름{" "}
              <span className="font-semibold text-red-600">"{teamName}"</span>을
              입력해주세요
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={teamName}
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

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
              onClick={handleDelete}
              disabled={!isConfirmed || loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "삭제 중..." : "팀 삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

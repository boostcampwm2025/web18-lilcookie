import { useState, useMemo } from "react";
import { Users, Copy, Check, Crown, UserMinus } from "lucide-react";
import type { GetTeamMembersResponseData } from "@repo/api";
import SectionContainer from "../common/SectionContainer";
import { TransferOwnershipModal } from "./TransferOwnershipModal";
import { KickMembersModal } from "./KickMembersModal";

interface MemberSectionProps {
  members: GetTeamMembersResponseData[];
  currentUserUuid: string | undefined;
  teamUuid: string;
  isAdmin: boolean;
  onTransferSuccess: () => void;
  onError?: (message: string) => void;
}

export const MemberSection = ({
  members,
  currentUserUuid,
  teamUuid,
  isAdmin,
  onTransferSuccess,
  onError,
}: MemberSectionProps) => {
  const [copied, setCopied] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [kickModalOpen, setKickModalOpen] = useState(false);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.userUuid === currentUserUuid) return -1;
      if (b.userUuid === currentUserUuid) return 1;
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return 0;
    });
  }, [members, currentUserUuid]);

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/team/${teamUuid}/invite`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onError?.("링크 복사에 실패했습니다.");
    }
  };

  return (
    <>
      <SectionContainer
        title={`팀원 (${members.length}명)`}
        headerAction={
          <div className="flex gap-2">
            {isAdmin && members.length > 1 && (
              <>
                <button
                  onClick={() => setKickModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" />
                  강퇴
                </button>
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  권한 위임
                </button>
              </>
            )}
            <button
              onClick={handleCopyInviteLink}
              className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm min-w-[120px] rounded-lg transition-colors cursor-pointer ${
                copied
                  ? "text-blue-600 border border-blue-300 bg-blue-50"
                  : "text-blue-600 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>초대 링크 복사</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {/* 멤버 목록 렌더링 */}
        <div className="space-y-1 max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {sortedMembers.map((member) => (
            <div
              key={member.userUuid}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {member.userName}
                    </span>
                    {member.role === "owner" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        owner
                      </span>
                    )}
                    {member.userUuid === currentUserUuid && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        me
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {member.userEmail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      <TransferOwnershipModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        members={sortedMembers.filter((m) => m.role !== "owner")}
        teamUuid={teamUuid}
        onSuccess={onTransferSuccess}
      />

      <KickMembersModal
        isOpen={kickModalOpen}
        onClose={() => setKickModalOpen(false)}
        members={sortedMembers.filter((m) => m.role !== "owner")}
        teamUuid={teamUuid}
        onSuccess={onTransferSuccess}
      />
    </>
  );
};

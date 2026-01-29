import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Team } from "../types";
import type { GetTeamMembersResponseData } from "@repo/api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { teamApi } from "../services/api";
import { Users, Copy, LogOut, Check, Crown } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import CreateTeamModal from "../components/teams/CreateTeamModal";

const SettingPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addTeam } = useTeams();

  const teamFromState = location.state?.team as Team | undefined;

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<GetTeamMembersResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 팀 정보 및 멤버 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 팀 정보 가져오기
        if (teamFromState) {
          setCurrentTeam(teamFromState);
        } else {
          const teamsResponse = await teamApi.getMyTeams();
          if (teamsResponse.success) {
            const team = teamsResponse.data.find(
              (t) => t.teamUuid === teamUuid,
            );
            if (team) {
              setCurrentTeam(team);
            } else {
              setError("팀을 찾을 수 없습니다.");
              return;
            }
          } else {
            setError(
              teamsResponse.message || "팀 정보를 불러오는데 실패했습니다.",
            );
            return;
          }
        }

        // 멤버 목록 가져오기
        if (teamUuid) {
          const membersResponse = await teamApi.getTeamMember(teamUuid);
          if (membersResponse.success) {
            const memberData = Array.isArray(membersResponse.data)
              ? membersResponse.data
              : [membersResponse.data];
            setMembers(memberData);
          } else {
            setError(
              membersResponse.message || "멤버 목록을 불러오는데 실패했습니다.",
            );
          }
        }
      } catch {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamUuid, teamFromState]);

  // 초대 링크 복사
  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/team/${teamUuid}/invite`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("링크 복사에 실패했습니다.");
    }
  };

  // 팀 탈퇴
  const handleLeaveTeam = async () => {
    if (!confirm("정말 이 팀에서 탈퇴하시겠습니까?")) return;

    try {
      setLeaving(true);
      await teamApi.leaveTeam(teamUuid!);
      navigate("/my-teams");
    } catch {
      setError("팀 탈퇴에 실패했습니다.");
    } finally {
      setLeaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isAdmin = currentTeam?.role === "owner";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar onCreateTeam={() => setIsModalOpen(true)} />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {user?.nickname || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </header>

        {/* 컨텐츠 */}
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">팀 설정</h1>

          <div className="max-w-4xl space-y-8">
            {/* 팀 정보 섹션 */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                팀 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">팀 이름</span>
                  <span className="font-medium text-gray-900">
                    {currentTeam?.teamName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">생성일</span>
                  <span className="text-gray-900">
                    {currentTeam?.createdAt &&
                      formatDate(currentTeam.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* 멤버 목록 섹션 */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  팀원 ({members.length}명)
                </h2>
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
              <div className="space-y-1">
                {members.map((member) => (
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
                          {member.userUuid === user?.uuid && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                              me
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {/* TODO: API에서 email 반환 시 변경 */}
                          {member.userName}@example.com
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 팀 탈퇴 섹션 */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                팀 탈퇴
              </h2>
              {isAdmin ? (
                <p className="text-sm text-gray-500 mb-4">
                  관리자는 팀에서 탈퇴할 수 없습니다. 다른 멤버에게 관리자
                  권한을 넘긴 후 탈퇴해주세요.
                </p>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  팀에서 탈퇴하면 더 이상 이 팀의 콘텐츠에 접근할 수 없습니다.
                </p>
              )}
              <button
                onClick={handleLeaveTeam}
                disabled={isAdmin || leaving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {leaving ? "탈퇴 중..." : "팀 탈퇴"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 팀 만들기 모달 */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={(newTeam) => {
          addTeam(newTeam);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default SettingPage;

import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Team } from "../types";
import type {
  GetTeamMembersResponseData,
  GetTeamWebhooksResponseData,
} from "@repo/api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { teamApi } from "../services/api";
import { Users, Copy, LogOut, Check, Crown, Plus, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import SectionContainer from "../components/common/SectionContainer";

const SettingPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addTeam } = useTeams();

  const teamFromState = location.state?.team as Team | undefined;

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<GetTeamMembersResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 웹훅 관련 state 추가
  const [webhooks, setWebhooks] = useState<GetTeamWebhooksResponseData[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [showWebhookInput, setShowWebhookInput] = useState(false);

  // 토큰 관련 state
  const [tokenUsage, setTokenUsage] = useState<{
    usedTokens: number;
    maxTokens: number;
    percentage: number;
  } | null>(null);

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

        // 웹훅 목록 가져오기
        if (teamUuid) {
          const webhooksResponse = await teamApi.getTeamWebhooks(teamUuid);
          if (webhooksResponse.success) {
            setWebhooks(webhooksResponse.data);
          }
        }

        // 토큰 사용량 가져오기
        if (teamUuid) {
          try {
            const response = await teamApi.getTokenUsage(teamUuid);
            if (response.success) {
              setTokenUsage(response.data);
            }
          } catch (error) {
            console.error("토큰 사용량 조회 실패:", error);
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

  // 웹훅 추가
  const handleAddWebhook = async () => {
    if (!webhookUrl.trim() || !teamUuid) return;

    try {
      setIsAddingWebhook(true);
      const response = await teamApi.addTeamWebhooks(
        teamUuid,
        webhookUrl.trim(),
      );
      if (response.success) {
        setWebhooks((prev) => [...prev, response.data]);
        setWebhookUrl("");
        setShowWebhookInput(false);
      }
    } catch {
      setError("웹훅 추가에 실패했습니다.");
    } finally {
      setIsAddingWebhook(false);
    }
  };

  // 웹훅 삭제
  const handleDeleteWebhook = async (webhookUuid: string) => {
    if (!teamUuid) return;

    try {
      await teamApi.deleteTeamWebhooks(teamUuid, webhookUuid);
      setWebhooks((prev) => prev.filter((w) => w.webhookUuid !== webhookUuid));
    } catch {
      setError("웹훅 삭제에 실패했습니다.");
    }
  };

  // 웹훅 활성화/비활성화 토글
  const handleToggleWebhook = async (webhook: GetTeamWebhooksResponseData) => {
    if (!teamUuid) return;

    try {
      const response = webhook.isActive
        ? await teamApi.deactivateTeamWebhooks(teamUuid, webhook.webhookUuid)
        : await teamApi.activateTeamWebhooks(teamUuid, webhook.webhookUuid);

      if (response.success) {
        setWebhooks((prev) =>
          prev.map((w) =>
            w.webhookUuid === webhook.webhookUuid ? response.data : w,
          ),
        );
      }
    } catch {
      setError("웹훅 상태 변경에 실패했습니다.");
    }
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
    <Layout
      sidebarProps={{
        onCreateTeam: () => setIsModalOpen(true),
      }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-8">팀 설정</h1>

      <div className="max-w-4xl space-y-8">
        {/* 팀 정보 섹션 */}
        <SectionContainer title="팀 정보">
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
                {currentTeam?.createdAt && formatDate(currentTeam.createdAt)}
              </span>
            </div>
          </div>
        </SectionContainer>

        {/* 멤버 목록 섹션 */}
        <SectionContainer
          title={`팀원 (${members.length}명)`}
          headerAction={
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
          }
        >
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
                      {member.userEmail}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>

        {/* 토큰 사용량 섹션 */}
        {tokenUsage && (
          <SectionContainer title="AI 사용량">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">오늘 사용량</span>
              </div>
              {/* 프로그레스 바 */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${tokenUsage.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  매일 자정(KST)에 초기화됩니다
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {tokenUsage.percentage}% 사용
                </span>
              </div>
            </div>
          </SectionContainer>
        )}

        {/* 웹훅 관리 섹션 */}
        <SectionContainer
          title="웹훅 관리"
          badge={isAdmin ? "Owner" : undefined}
          subtitle="팀 내 이벤트 발생 시 데이터를 전송할 URL을 관리합니다."
        >
          {/* 웹훅 목록 */}
          <div className="space-y-3 mb-4">
            {webhooks.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                등록된 웹훅이 없습니다.
              </p>
            ) : (
              webhooks.map((webhook) => (
                <div
                  key={webhook.webhookUuid}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* 토글 스위치 - owner만 클릭 가능 */}
                  {isAdmin ? (
                    <button
                      onClick={() => handleToggleWebhook(webhook)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        webhook.isActive ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          webhook.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  ) : (
                    <div
                      className={`relative w-11 h-6 rounded-full ${
                        webhook.isActive ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full ${
                          webhook.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  )}

                  {/* URL */}
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {webhook.url}
                  </span>

                  {/* 삭제 버튼 - owner만 표시 */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteWebhook(webhook.webhookUuid)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 웹훅 추가 - owner만 표시 */}
          {isAdmin &&
            (showWebhookInput ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://전송받을-주소를-입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAddingWebhook}
                />
                <button
                  onClick={handleAddWebhook}
                  disabled={!webhookUrl.trim() || isAddingWebhook}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingWebhook ? "추가 중..." : "추가"}
                </button>
                <button
                  onClick={() => {
                    setShowWebhookInput(false);
                    setWebhookUrl("");
                  }}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWebhookInput(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                웹훅 추가
              </button>
            ))}
        </SectionContainer>

        {/* 팀 탈퇴 섹션 */}
        <SectionContainer
          title="팀 탈퇴"
          subtitle={
            isAdmin
              ? "관리자는 팀에서 탈퇴할 수 없습니다. 다른 멤버에게 관리자 권한을 넘긴 후 탈퇴해주세요."
              : "팀에서 탈퇴하면 더 이상 이 팀의 콘텐츠에 접근할 수 없습니다."
          }
        >
          <button
            onClick={handleLeaveTeam}
            disabled={isAdmin || leaving}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {leaving ? "탈퇴 중..." : "팀 탈퇴"}
          </button>
        </SectionContainer>
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
    </Layout>
  );
};

export default SettingPage;

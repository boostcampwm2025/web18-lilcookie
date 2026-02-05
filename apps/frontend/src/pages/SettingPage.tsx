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
import Layout from "../components/layout/Layout";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import { TeamInfoSection } from "../components/setting/TeamInfoSection";
import { MemberSection } from "../components/setting/MemberSection";
import { TokenUsageSection } from "../components/setting/TokenUsageSection";
import { WebhookSection } from "../components/setting/WebhookSection";
import { TeamLeaveSection } from "../components/setting/TeamLeaveSection";

const SettingPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addTeam, refreshTeams } = useTeams();

  const teamFromState = location.state?.team as Team | undefined;
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<GetTeamMembersResponseData[]>([]);
  const isAlone = members.length === 1;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [webhooks, setWebhooks] = useState<GetTeamWebhooksResponseData[]>([]);
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

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000); // 3초 후 자동 사라짐
  };

  const isAdmin = currentTeam?.role === "owner";

  return (
    <Layout sidebarProps={{ onCreateTeam: () => setIsModalOpen(true) }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">팀 설정</h1>

      {/* 에러 보여주기 */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm shadow-lg">
          {error}
        </div>
      )}

      <div className="max-w-4xl space-y-8">
        <TeamInfoSection team={currentTeam} />

        <MemberSection
          members={members}
          currentUserUuid={user?.uuid}
          teamUuid={teamUuid!}
          isAdmin={isAdmin}
          onTransferSuccess={() => window.location.reload()}
          onError={handleError}
        />

        <TokenUsageSection tokenUsage={tokenUsage} />

        <WebhookSection
          teamUuid={teamUuid!}
          webhooks={webhooks}
          setWebhooks={setWebhooks}
          isAdmin={isAdmin}
          onError={handleError}
        />

        <TeamLeaveSection
          teamUuid={teamUuid!}
          teamName={currentTeam?.teamName || ""}
          isAdmin={isAdmin}
          isAlone={isAlone}
          onDeleteSuccess={async () => {
            await refreshTeams();
            navigate("/my-teams");
          }}
          onError={handleError}
        />
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

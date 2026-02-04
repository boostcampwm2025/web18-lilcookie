import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { Crown, Users, UserX } from "lucide-react";
import Layout from "../components/layout/Layout";
import SectionContainer from "../components/common/SectionContainer";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import { useState } from "react";

const MyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, loading, addTeam } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWithdraw = () => {
    if (!confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."))
      return;
    // TODO: 유저 탈퇴 API 연결
    alert("탈퇴 기능은 아직 준비 중입니다.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Layout
      sidebarProps={{
        onCreateTeam: () => setIsModalOpen(true),
      }}
      headerProps={{ showMyPageLink: false }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      <div className="max-w-4xl space-y-8">
        {/* 유저 정보 섹션 */}
        <SectionContainer title="내 정보">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">닉네임</span>
              <span className="font-medium text-gray-900">
                {user?.nickname || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">이메일</span>
              <span className="text-gray-900">{user?.email || "-"}</span>
            </div>
          </div>
        </SectionContainer>

        {/* 가입된 팀 목록 섹션 */}
        <SectionContainer title={`가입된 팀 (${teams.length}개)`}>
          {teams.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">가입된 팀이 없습니다.</p>
          ) : (
            <div className="space-y-1">
              {teams.map((team) => (
                <div
                  key={team.teamUuid}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                  onClick={() => navigate(`/team/${team.teamUuid}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {team.teamName}
                        </span>
                        {team.role === "owner" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            owner
                          </span>
                        )}
                        {team.role === "member" && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        {/* 회원 탈퇴 섹션 */}
        <SectionContainer
          title="회원 탈퇴"
          subtitle="계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다."
        >
          <button
            onClick={handleWithdraw}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            <UserX className="w-4 h-4" />
            회원 탈퇴
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

export default MyPage;

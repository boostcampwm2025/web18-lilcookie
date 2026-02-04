import { useState } from "react";
import { Users, Crown, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import type { Team } from "../types";
import { useTeams } from "../contexts/TeamContext";

const MyTeams = () => {
  const navigate = useNavigate();
  const { teams, loading, addTeam } = useTeams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTeamCreated = (newTeam: Team) => {
    // 팀 목록에 새 팀 추가
    addTeam(newTeam);
  };

  const handleTeamClick = (team: Team) => {
    // 팀 정보를 state로 전달
    navigate(`/team/${team.teamUuid}`, { state: { team } });
  };

  return (
    <Layout
      sidebarProps={{
        onCreateTeam: () => setIsModalOpen(true),
      }}
      headerProps={{
        extraButtons: (
          <button
            onClick={() => navigate("/oauth-apps")}
            className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span className="text-sm">OAuth 연결</span>
          </button>
        ),
      }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 팀</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : teams.length === 0 ? (
        // 팀이 없을 때
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              가입한 팀이 없습니다
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              새로운 팀을 만들거나 기존 팀에 가입하여 시작하세요
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
            >
              팀 만들기
            </button>
          </div>
        </div>
      ) : (
        // 팀 목록
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <button
              key={team.teamUuid}
              onClick={() => handleTeamClick(team)}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative"
            >
              {team.role === "owner" && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                  <Crown className="w-3 h-3" />
                  <span className="text-xs font-medium">Owner</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3 pr-16">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 wrap-break-word min-w-0">
                  {team.teamName}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 팀 만들기 모달 */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />
    </Layout>
  );
};

export default MyTeams;

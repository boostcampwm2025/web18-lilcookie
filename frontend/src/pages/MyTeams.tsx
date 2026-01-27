import { useEffect, useState } from "react";
import { LogOut, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import { teamApi } from "../services/api";
import type { Team } from "../types";

// TODO: 백엔드 연동 후 제거

// [팀 없을 때 테스트용]
const MOCK_TEAMS: Team[] = [];

/* [팀 있을 때 테스트용] - 테스트 시 위 빈 배열 주석 처리하고 아래 블록 주석 해제
const MOCK_TEAMS: Team[] = [
  {
    uuid: "team-uuid-1",
    name: "web18",
    createdAt: new Date("2024-01-15"),
    role: "owner",
  },
  {
    uuid: "team-uuid-2",
    name: "프론트엔드 스터디",
    createdAt: new Date("2024-01-20"),
    role: "member",
  },
  {
    uuid: "team-uuid-3",
    name: "사이드 프로젝트",
    createdAt: new Date("2024-02-01"),
    role: "member",
  },
];
*/

const MyTeams = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 팀 목록 조회
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await teamApi.getMyTeams();
        if (response.success) {
          setTeams(response.data);
        }
      } catch {
        // TODO: 백엔드 연동 후 아래 mock 데이터 제거하고 에러 처리 복원
        setTeams(MOCK_TEAMS);
        // setError("팀 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCreateTeam = () => {
    // TODO: 팀 생성 모달 또는 페이지로 이동
  };

  const handleTeamClick = (teamUuid: string) => {
    navigate(`/team/${teamUuid}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar teams={teams} onCreateTeam={handleCreateTeam} />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-end">
          <div className="flex items-center gap-3">
            {/* 사용자 이름 */}
            <span className="text-sm font-medium text-gray-700">
              {user?.nickname || user?.email?.split("@")[0]}
            </span>

            {/* 로그아웃 */}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">내 팀</h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
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
                  onClick={handleCreateTeam}
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
                  key={team.uuid}
                  onClick={() => handleTeamClick(team.uuid)}
                  className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative"
                >
                  {team.role === "owner" && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                      <Crown className="w-3 h-3" />
                      <span className="text-xs font-medium">Owner</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyTeams;

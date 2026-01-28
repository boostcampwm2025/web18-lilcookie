import { Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Team } from "../../types";

interface SidebarProps {
  teams: Team[];
  onCreateTeam?: () => void;
}

const Sidebar = ({ teams, onCreateTeam }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMyTeamsActive = location.pathname === "/my-teams";

  const handleTeamClick = (teamUuid: string) => {
    navigate(`/team/${teamUuid}`);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 로고 */}
      <div className="h-14 px-4 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <span className="font-bold text-lg text-gray-900">TeamStash</span>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-3">
        {/* 내 팀 */}
        <button
          onClick={() => navigate("/my-teams")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
            isMyTeamsActive
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm">내 팀</span>
        </button>

        {/* 팀 목록 */}
        {teams.length > 0 && (
          <div className="mt-2 ml-4 space-y-1">
            {teams.map((team) => (
              <button
                key={team.teamUuid}
                onClick={() => handleTeamClick(team.teamUuid)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer wrap-break-word"
              >
                {team.teamName}
              </button>
            ))}
          </div>
        )}

        {teams.length === 0 && (
          <p className="mt-2 ml-6 text-xs text-gray-400">
            가입한 팀이 없습니다
          </p>
        )}
      </nav>

      {/* 팀 만들기 버튼 */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onCreateTeam}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium text-sm"
        >
          <span>+ 팀 만들기</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

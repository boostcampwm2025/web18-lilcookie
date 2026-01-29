import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Users,
  ChevronRight,
  Folder,
  FolderPlus,
  Settings,
} from "lucide-react";
import type { Team, Folder as FolderType } from "../../types";
import { folderApi } from "../../services/api";
import { useTeams } from "../../contexts/TeamContext";

interface SidebarProps {
  onCreateTeam?: () => void;
  onCreateFolder?: (teamUuid: string) => void;
}

const Sidebar = ({ onCreateTeam, onCreateFolder }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teams, loading } = useTeams();
  const { teamUuid: selectedTeamUuid } = useParams<{ teamUuid: string }>();

  // URL에서 선택된 폴더 UUID 가져오기
  const selectedFolderUuid = location.state?.selectedFolderUuid as
    | string
    | undefined;

  const isMyTeamsActive = location.pathname === "/my-teams";
  const isSettingPage = location.pathname.endsWith("/setting");

  // 폴더 데이터 캐시
  const [teamFolders, setTeamFolders] = useState<Record<string, FolderType[]>>(
    {},
  );
  // 수동으로 펼침/접힘 토글한 팀 상태
  const [manualExpandedTeams, setManualExpandedTeams] = useState<
    Record<string, boolean>
  >({});
  // 호버 중인 팀
  const [hoveredTeamUuid, setHoveredTeamUuid] = useState<string | null>(null);

  // 이미 폴더를 조회한 팀 추적 (중복 API 호출 방지)
  const fetchedFoldersRef = useRef<Set<string>>(new Set());

  // 폴더 조회 함수 (이벤트 핸들러에서 호출)
  const fetchFoldersIfNeeded = useCallback(async (teamUuid: string) => {
    if (fetchedFoldersRef.current.has(teamUuid)) return;

    fetchedFoldersRef.current.add(teamUuid);
    try {
      const response = await folderApi.getFolders(teamUuid);
      if (response.success) {
        setTeamFolders((prev) => ({
          ...prev,
          [teamUuid]: response.data,
        }));
      }
    } catch (error) {
      console.error("폴더 조회 실패:", error);
      fetchedFoldersRef.current.delete(teamUuid);
    }
  }, []);

  // 선택된 팀의 폴더 조회 (URL 변경 시)
  useEffect(() => {
    if (!selectedTeamUuid) return;
    if (fetchedFoldersRef.current.has(selectedTeamUuid)) return;

    let cancelled = false;

    const fetchFolders = async () => {
      fetchedFoldersRef.current.add(selectedTeamUuid);
      try {
        const response = await folderApi.getFolders(selectedTeamUuid);
        if (!cancelled && response.success) {
          setTeamFolders((prev) => ({
            ...prev,
            [selectedTeamUuid]: response.data,
          }));
        }
      } catch (error) {
        console.error("폴더 조회 실패:", error);
        if (!cancelled) {
          fetchedFoldersRef.current.delete(selectedTeamUuid);
        }
      }
    };

    fetchFolders();

    return () => {
      cancelled = true;
    };
  }, [selectedTeamUuid]);

  // 팀이 펼쳐져 있는지 계산 (선택된 팀 또는 수동 펼침)
  const isTeamExpanded = (teamUuid: string): boolean => {
    // 수동으로 토글한 상태가 있으면 그 값 사용
    if (manualExpandedTeams[teamUuid] !== undefined) {
      return manualExpandedTeams[teamUuid];
    }
    // 기본: 선택된 팀은 펼침
    return selectedTeamUuid === teamUuid;
  };

  const toggleTeamExpand = async (teamUuid: string) => {
    const currentlyExpanded = isTeamExpanded(teamUuid);
    const willExpand = !currentlyExpanded;

    setManualExpandedTeams((prev) => ({
      ...prev,
      [teamUuid]: willExpand,
    }));

    if (willExpand) {
      await fetchFoldersIfNeeded(teamUuid);
    }
  };

  const handleTeamClick = (team: Team) => {
    navigate(`/team/${team.teamUuid}`, { state: { team } });
  };

  const handleFolderClick = (team: Team, folder: FolderType) => {
    navigate(`/team/${team.teamUuid}`, {
      state: { team, selectedFolderUuid: folder.folderUuid },
    });
  };

  const handleSettingClick = (e: React.MouseEvent, teamUuid: string) => {
    e.stopPropagation();
    navigate(`/team/${teamUuid}/setting`);
  };

  const handleCreateFolderClick = (e: React.MouseEvent, teamUuid: string) => {
    e.stopPropagation();
    onCreateFolder?.(teamUuid);
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
      <nav className="flex-1 p-3 overflow-y-auto">
        {/* 내 팀 헤더 */}
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
        {loading ? (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          </div>
        ) : teams.length > 0 ? (
          <div className="mt-2 space-y-1">
            {teams.map((team) => {
              const isExpanded = isTeamExpanded(team.teamUuid);
              const isSelected = selectedTeamUuid === team.teamUuid;
              const isHovered = hoveredTeamUuid === team.teamUuid;
              const folders = teamFolders[team.teamUuid] || [];

              return (
                <div key={team.teamUuid} className="ml-2">
                  {/* 팀 헤더 */}
                  <div
                    className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected && !isSettingPage
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onMouseEnter={() => setHoveredTeamUuid(team.teamUuid)}
                    onMouseLeave={() => setHoveredTeamUuid(null)}
                    onClick={() => handleTeamClick(team)}
                  >
                    {/* 펼침/접힘 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTeamExpand(team.teamUuid);
                      }}
                      className="p-0.5 hover:bg-gray-200 rounded cursor-pointer transition-transform duration-200"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {/* 팀 아이콘 */}
                    <Users className="w-4 h-4 shrink-0" />

                    {/* 팀 이름 */}
                    <span className="text-sm font-medium flex-1 truncate">
                      {team.teamName}
                    </span>

                    {/* 호버 시 액션 버튼들 - opacity로 표시/숨김 */}
                    <div
                      className={`flex items-center gap-0.5 transition-opacity duration-150 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={(e) =>
                          handleCreateFolderClick(e, team.teamUuid)
                        }
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                        title="폴더 생성"
                      >
                        <FolderPlus className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => handleSettingClick(e, team.teamUuid)}
                        className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                        title="팀 설정"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* 폴더 목록 - 애니메이션 적용 */}
                  <div
                    className={`ml-6 space-y-0.5 overflow-hidden transition-all duration-200 ease-in-out ${
                      isExpanded && folders.length > 0
                        ? "max-h-96 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {folders.map((folder) => {
                      const isFolderSelected =
                        isSelected &&
                        selectedFolderUuid === folder.folderUuid &&
                        !isSettingPage;

                      return (
                        <button
                          key={folder.folderUuid}
                          onClick={() => handleFolderClick(team, folder)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                            isFolderSelected
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Folder className="w-4 h-4 shrink-0" />
                          <span className="truncate">{folder.folderName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
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

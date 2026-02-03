import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Users,
  ChevronRight,
  Folder,
  FolderPlus,
  Trash2,
  Settings,
} from "lucide-react";
import type { Team, Folder as FolderType } from "../../types";
import { useTeams } from "../../contexts/TeamContext";
import { useFolders } from "../../hooks";

interface SidebarProps {
  onCreateTeam?: () => void;
  onCreateFolder?: (teamUuid: string) => void;
  onDeleteFolder?: (
    teamUuid: string,
    folderUuid: string,
    folderName: string,
  ) => void;
  selectedFolderUuid?: string | null;
  onFolderSelect?: (folder: FolderType) => void;
  folderRefreshKey?: number; // 이 값이 변경되면 선택된 팀의 폴더 캐시를 무효화하고 다시 조회
}

const Sidebar = ({
  onCreateTeam,
  onCreateFolder,
  onDeleteFolder,
  selectedFolderUuid,
  onFolderSelect,
  folderRefreshKey,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teams, loading } = useTeams();
  const { teamUuid: selectedTeamUuid } = useParams<{ teamUuid: string }>();

  const isMyTeamsActive = location.pathname === "/my-teams";
  const isSettingPage = location.pathname.endsWith("/setting");

  // useFolders 훅 사용
  const { teamFolders, fetchFoldersIfNeeded } = useFolders({
    selectedTeamUuid,
    folderRefreshKey,
  });

  // 수동으로 펼침/접힘 토글한 팀 상태
  const [manualExpandedTeams, setManualExpandedTeams] = useState<
    Record<string, boolean>
  >({});
  // 호버 중인 팀
  const [hoveredTeamUuid, setHoveredTeamUuid] = useState<string | null>(null);
  // 호버 중인 폴더
  const [hoveredFolderUuid, setHoveredFolderUuid] = useState<string | null>(
    null,
  );

  // 팀이 펼쳐져 있는지 계산 (수동 상태 우선, 없으면 선택된 팀만 펼침)
  const isTeamExpanded = (teamUuid: string): boolean => {
    // 수동 상태가 있으면 그것을 따름 (선택된 팀도 접기 가능)
    if (manualExpandedTeams[teamUuid] !== undefined) {
      return manualExpandedTeams[teamUuid];
    }
    // 선택된 팀은 기본적으로 펼침
    if (selectedTeamUuid === teamUuid) {
      return true;
    }
    return false;
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

  const handleFolderClick = (folder: FolderType, team: Team) => {
    // 이미 선택된 폴더면 아무것도 하지 않음
    if (selectedFolderUuid === folder.folderUuid) return;

    // 현재 선택된 팀의 폴더면 콜백으로 처리 (페이지 이동 없이)
    if (selectedTeamUuid === team.teamUuid) {
      onFolderSelect?.(folder);
    } else {
      // 다른 팀의 폴더면 해당 팀 페이지로 이동 + 폴더 선택
      navigate(`/team/${team.teamUuid}`, {
        state: { team, selectedFolderUuid: folder.folderUuid },
      });
    }
  };

  const handleSettingClick = (e: React.MouseEvent, teamUuid: string) => {
    e.stopPropagation();
    navigate(`/team/${teamUuid}/setting`);
  };

  const handleCreateFolderClick = (e: React.MouseEvent, teamUuid: string) => {
    e.stopPropagation();

    // 선택된 팀이 아닌 경우 alert 표시
    if (teamUuid !== selectedTeamUuid) {
      const targetTeam = teams.find((t) => t.teamUuid === teamUuid);
      const teamName = targetTeam?.teamName || "해당";
      alert(`${teamName} 팀 페이지에서 폴더를 생성할 수 있습니다.`);
      return;
    }

    onCreateFolder?.(teamUuid);
  };

  const handleDeleteFolderClick = (
    e: React.MouseEvent,
    team: Team,
    folderUuid: string,
    folderName: string,
  ) => {
    e.stopPropagation();

    // 선택된 팀이 아닌 경우 alert 표시
    if (team.teamUuid !== selectedTeamUuid) {
      alert(`${team.teamName} 팀 페이지에서 폴더를 삭제할 수 있습니다.`);
      return;
    }

    onDeleteFolder?.(team.teamUuid, folderUuid, folderName);
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
      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
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
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
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
                  {(() => {
                    // 선택된 폴더가 현재 폴더 목록에 있는지 확인
                    const selectedFolderInList =
                      selectedFolderUuid &&
                      folders.some((f) => f.folderUuid === selectedFolderUuid);

                    return (
                      <div
                        className={`ml-6 space-y-0.5 transition-all duration-200 ease-in-out custom-scrollbar ${
                          isExpanded && folders.length > 0
                            ? "max-h-64 opacity-100 mt-1 overflow-y-auto"
                            : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                      >
                        {folders.map((folder, index) => {
                          // 선택된 폴더가 없거나 폴더 목록에 없으면 첫번째 폴더(기본 폴더)를 자동 선택
                          const isFolderSelected =
                            isSelected &&
                            !isSettingPage &&
                            (selectedFolderUuid === folder.folderUuid ||
                              (!selectedFolderInList && index === 0));

                          const isFolderHovered =
                            hoveredFolderUuid === folder.folderUuid;
                          const isDefaultFolder = index === 0; // 첫번째 폴더는 기본 폴더

                          return (
                            <div
                              key={folder.folderUuid}
                              role="button"
                              tabIndex={0}
                              className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                isFolderSelected
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              onMouseEnter={() =>
                                setHoveredFolderUuid(folder.folderUuid)
                              }
                              onMouseLeave={() => setHoveredFolderUuid(null)}
                              onClick={() => handleFolderClick(folder, team)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleFolderClick(folder, team);
                                }
                              }}
                            >
                              <Folder className="w-4 h-4 shrink-0" />
                              <span
                                className={`text-sm flex-1 truncate ${isFolderSelected ? "font-medium" : ""}`}
                              >
                                {folder.folderName}
                              </span>

                              {/* 호버 시 삭제 버튼 (기본 폴더 제외) */}
                              {!isDefaultFolder && (
                                <button
                                  onClick={(e) =>
                                    handleDeleteFolderClick(
                                      e,
                                      team,
                                      folder.folderUuid,
                                      folder.folderName,
                                    )
                                  }
                                  className={`p-1 hover:bg-gray-200 rounded cursor-pointer transition-opacity duration-150 ${
                                    isFolderHovered
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                  title="폴더 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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

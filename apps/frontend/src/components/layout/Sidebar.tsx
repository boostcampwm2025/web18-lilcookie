import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import type { Team, Folder as FolderType } from "../../types";
import { useTeams } from "../../contexts/TeamContext";
import { useFolders } from "../../hooks";
import TeamItem from "./sidebar/TeamItem";
import CreateFolderModal from "../folders/CreateFolderModal";

interface SidebarProps {
  onCreateTeam?: () => void;
  selectedFolderUuid?: string | null;
  onFolderSelect?: (folder: FolderType) => void;
}

const Sidebar = ({
  onCreateTeam,
  selectedFolderUuid,
  onFolderSelect,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teams, loading } = useTeams();
  const { teamUuid: selectedTeamUuid } = useParams<{ teamUuid: string }>();

  const isMyTeamsActive = location.pathname === "/my-teams";
  const isSettingPage = location.pathname.endsWith("/setting");

  // 모달 상태
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalTeamUuid, setFolderModalTeamUuid] = useState<string | null>(
    null,
  );

  // useFolders 훅 사용
  const {
    teamFolders,
    fetchFoldersIfNeeded,
    createFolder,
    deleteFolder,
    renameFolder,
  } = useFolders({
    selectedTeamUuid,
  });

  // 수동으로 펼침/접힘 토글한 팀 상태
  const [manualExpandedTeams, setManualExpandedTeams] = useState<
    Record<string, boolean>
  >({});

  // 팀이 펼쳐져 있는지 계산 (수동 상태 우선, 없으면 선택된 팀만 펼침)
  const isTeamExpanded = (teamUuid: string): boolean => {
    if (manualExpandedTeams[teamUuid] !== undefined) {
      return manualExpandedTeams[teamUuid];
    }
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
    if (selectedFolderUuid === folder.folderUuid && !isSettingPage) return;

    // URL에 폴더 UUID를 쿼리 파라미터로 추가하여 새로고침해도 유지되도록 함
    navigate(`/team/${team.teamUuid}?folderUuid=${folder.folderUuid}`, {
      state: { team, selectedFolderUuid: folder.folderUuid },
    });

    // 같은 팀의 폴더를 클릭한 경우에만 즉시 반영
    // 다른 팀의 폴더를 클릭한 경우 네비게이션 후 TeamPage에서 처리
    if (team.teamUuid === selectedTeamUuid) {
      onFolderSelect?.(folder);
    }
  };

  const handleSettingClick = (teamUuid: string) => {
    navigate(`/team/${teamUuid}/setting`);
  };

  const handleCreateFolderClick = (teamUuid: string) => {
    setFolderModalTeamUuid(teamUuid);
    setFolderModalOpen(true);
  };

  const handleDeleteFolderClick = async (
    team: Team,
    folderUuid: string,
    folderName: string,
  ) => {
    if (
      !confirm(
        `"${folderName}" 폴더를 삭제하시겠습니까?\n폴더 내 모든 링크도 함께 삭제됩니다.`,
      )
    )
      return;
    await deleteFolder(team.teamUuid, folderUuid);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 로고 */}
      <div className="h-14 px-4 border-b border-gray-200 flex items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/my-teams")}
        >
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
            {teams.map((team) => (
              <TeamItem
                key={team.teamUuid}
                team={team}
                isSelected={selectedTeamUuid === team.teamUuid}
                isSettingPage={isSettingPage}
                isExpanded={isTeamExpanded(team.teamUuid)}
                folders={teamFolders[team.teamUuid] || []}
                selectedFolderUuid={selectedFolderUuid}
                onTeamClick={() => handleTeamClick(team)}
                onToggleExpand={() => toggleTeamExpand(team.teamUuid)}
                onFolderClick={(folder) => handleFolderClick(folder, team)}
                onCreateFolder={() => handleCreateFolderClick(team.teamUuid)}
                onDeleteFolder={(folderUuid, folderName) =>
                  handleDeleteFolderClick(team, folderUuid, folderName)
                }
                onRenameFolder={(folderUuid, newName) =>
                  renameFolder(team.teamUuid, folderUuid, newName)
                }
                onSettingClick={() => handleSettingClick(team.teamUuid)}
              />
            ))}
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

      {/* 폴더 생성 모달 */}
      <CreateFolderModal
        isOpen={folderModalOpen}
        teamUuid={folderModalTeamUuid}
        onClose={() => setFolderModalOpen(false)}
        onFolderCreated={() => setFolderModalOpen(false)}
        createFolder={createFolder}
      />
    </aside>
  );
};

export default Sidebar;

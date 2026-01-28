import { useNavigate } from "react-router-dom";
import {
  Users,
  ChevronDown,
  ChevronRight,
  Folder,
  Settings,
} from "lucide-react";
import type { Team, Folder as FolderType } from "../../types";
import { useState } from "react";

interface TeamSidebarProps {
  currentTeam: Team | null;
  folders: FolderType[];
  teamUuid: string;
  selectedFolderUuid?: string | null;
  onFolderClick?: (folder: FolderType) => void;
  activePage: "folder" | "setting";
}

const TeamSidebar = ({
  currentTeam,
  folders,
  teamUuid,
  selectedFolderUuid,
  onFolderClick,
  activePage,
}: TeamSidebarProps) => {
  const navigate = useNavigate();
  const [isTeamExpanded, setIsTeamExpanded] = useState(true);

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
        {/* 내 팀 섹션 */}
        <div className="mb-2">
          <button
            onClick={() => navigate("/my-teams")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">내 팀</span>
          </button>
        </div>

        {/* 현재 팀 */}
        {currentTeam && (
          <div className="ml-2">
            {/* 팀 헤더 */}
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600">
              <button
                onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                className="p-0.5 hover:bg-blue-100 rounded cursor-pointer"
              >
                {isTeamExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium flex-1 truncate">
                {currentTeam.teamName}
              </span>
            </div>

            {/* 팀 하위 메뉴 */}
            {isTeamExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {/* 설정 (맨 위) */}
                <button
                  onClick={() => navigate(`/team/${teamUuid}/setting`)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                    activePage === "setting"
                      ? "bg-gray-200 text-gray-900 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>설정</span>
                </button>

                {/* 폴더 목록 */}
                {folders.map((folder) => (
                  <button
                    key={folder.folderUuid}
                    onClick={() => {
                      if (onFolderClick) {
                        onFolderClick(folder);
                      } else {
                        navigate(`/team/${teamUuid}`);
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                      activePage === "folder" &&
                      selectedFolderUuid === folder.folderUuid
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Folder className="w-4 h-4 shrink-0" />
                    <span className="truncate">{folder.folderName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default TeamSidebar;

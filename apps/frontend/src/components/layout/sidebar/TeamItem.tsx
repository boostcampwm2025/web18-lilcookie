import { useState, useRef } from "react";
import { Users, ChevronRight, FolderPlus, Settings } from "lucide-react";
import type { Team, Folder as FolderType } from "../../../types";
import FolderItem from "./FolderItem";

interface TeamItemProps {
  team: Team;
  isSelected: boolean;
  isSettingPage: boolean;
  isExpanded: boolean;
  folders: FolderType[];
  selectedFolderUuid?: string | null;
  onTeamClick: () => void;
  onToggleExpand: () => void;
  onFolderClick: (folder: FolderType) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (folderUuid: string, folderName: string) => void;
  onSettingClick: () => void;
}

const TeamItem = ({
  team,
  isSelected,
  isSettingPage,
  isExpanded,
  folders,
  selectedFolderUuid,
  onTeamClick,
  onToggleExpand,
  onFolderClick,
  onCreateFolder,
  onDeleteFolder,
  onSettingClick,
}: TeamItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  const handleNameMouseEnter = () => {
    if (nameRef.current) {
      setShowTooltip(nameRef.current.scrollWidth > nameRef.current.clientWidth);
    }
  };

  // 선택된 폴더가 현재 폴더 목록에 있는지 확인
  const selectedFolderInList =
    selectedFolderUuid &&
    folders.some((f) => f.folderUuid === selectedFolderUuid);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand();
  };

  const handleCreateFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFolder();
  };

  const handleSettingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingClick();
  };

  return (
    <div className="ml-2">
      {/* 팀 헤더 */}
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
          isSelected && !isSettingPage
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onTeamClick}
      >
        {/* 펼침/접힘 버튼 */}
        <button
          onClick={handleExpandClick}
          className="p-0.5 hover:bg-gray-200 rounded cursor-pointer transition-transform duration-200"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* 팀 아이콘 */}
        <Users className="w-4 h-4 shrink-0" />

        {/* 팀 이름 */}
        <span
          ref={nameRef}
          className="text-sm font-medium flex-1 truncate"
          title={showTooltip ? team.teamName : undefined}
          onMouseEnter={handleNameMouseEnter}
        >
          {team.teamName}
        </span>

        {/* 호버 시 액션 버튼들 */}
        <div
          className={`flex items-center gap-0.5 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={handleCreateFolderClick}
            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
            title="폴더 생성"
          >
            <FolderPlus className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleSettingClick}
            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
            title="팀 설정"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 폴더 목록 */}
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

          const isDefaultFolder = index === 0;

          return (
            <FolderItem
              key={folder.folderUuid}
              folder={folder}
              isSelected={isFolderSelected}
              isDefaultFolder={isDefaultFolder}
              onClick={() => onFolderClick(folder)}
              onDelete={() =>
                onDeleteFolder(folder.folderUuid, folder.folderName)
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default TeamItem;

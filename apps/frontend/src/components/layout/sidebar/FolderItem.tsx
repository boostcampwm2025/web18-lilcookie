import { useState } from "react";
import { Folder, Trash2 } from "lucide-react";
import type { Folder as FolderType } from "../../../types";

interface FolderItemProps {
  folder: FolderType;
  isSelected: boolean;
  isDefaultFolder: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const FolderItem = ({
  folder,
  isSelected,
  isDefaultFolder,
  onClick,
  onDelete,
}: FolderItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
        isSelected
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <Folder className="w-4 h-4 shrink-0" />
      <span
        className={`text-sm flex-1 truncate ${isSelected ? "font-medium" : ""}`}
      >
        {folder.folderName}
      </span>

      {/* 호버 시 삭제 버튼 (기본 폴더 제외) */}
      {!isDefaultFolder && (
        <button
          onClick={handleDeleteClick}
          className={`p-1 hover:bg-gray-200 rounded cursor-pointer transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          title="폴더 삭제"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
    </div>
  );
};

export default FolderItem;

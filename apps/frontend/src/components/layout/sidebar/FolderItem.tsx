import { useState, useRef, useEffect } from "react";
import { Folder, Trash2, Pencil } from "lucide-react";
import type { Folder as FolderType } from "../../../types";

interface FolderItemProps {
  folder: FolderType;
  isSelected: boolean;
  isDefaultFolder: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

const FolderItem = ({
  folder,
  isSelected,
  isDefaultFolder,
  onClick,
  onDelete,
  onRename,
}: FolderItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.folderName);
  const nameRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameMouseEnter = () => {
    if (nameRef.current) {
      setShowTooltip(nameRef.current.scrollWidth > nameRef.current.clientWidth);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(folder.folderName);
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== folder.folderName) {
      onRename(trimmedName);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setEditName(folder.folderName);
      setIsEditing(false);
    }
  };

  const handleEditBlur = () => {
    handleEditSubmit();
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
      onClick={isEditing ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      <Folder className="w-4 h-4 shrink-0" />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          className="text-sm flex-1 bg-white border border-blue-400 rounded px-1 py-0.5 outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          ref={nameRef}
          className={`text-sm flex-1 truncate ${isSelected ? "font-medium" : ""}`}
          title={showTooltip ? folder.folderName : undefined}
          onMouseEnter={handleNameMouseEnter}
        >
          {folder.folderName}
        </span>
      )}

      {/* 호버 시 편집/삭제 버튼 (기본 폴더 제외) */}
      {!isDefaultFolder && !isEditing && (
        <>
          <button
            onClick={handleEditClick}
            className={`p-1 hover:bg-gray-200 rounded cursor-pointer transition-opacity duration-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            title="폴더 이름 수정"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleDeleteClick}
            className={`p-1 hover:bg-gray-200 rounded cursor-pointer transition-opacity duration-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            title="폴더 삭제"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
};

export default FolderItem;

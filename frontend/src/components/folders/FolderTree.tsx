import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Folder } from "../../types";
import { folderApi } from "../../services/api";

interface FolderTreeProps {
  teamId: string;
  onFolderClick?: (folderId: string | null) => void;
  selectedFolderId: string | null;
}

interface FolderNode extends Folder {
  children: FolderNode[];
}

const FolderTree = ({
  teamId,
  onFolderClick,
  selectedFolderId,
}: FolderTreeProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");

  // 폴더 목록 가져오기
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const response = await folderApi.getFolders(teamId);
        if (response.success) {
          setFolders(response.data);
        }
      } catch (error) {
        console.error("폴더 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchFolders();
    }
  }, [teamId]);

  // 폴더를 트리 구조로 변환
  useEffect(() => {
    const buildTree = (parentId: string | null): FolderNode[] => {
      return folders
        .filter((folder) => folder.parentFolderId === parentId)
        .map((folder) => ({
          ...folder,
          children: buildTree(folder.folderId),
        }));
    };

    setFolderTree(buildTree(null));
  }, [folders]);

  // 폴더 펼치기/접기
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // 폴더 생성
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert("폴더 이름을 입력하세요.");
      return;
    }

    // localStorage에서 camperId 가져오기
    const camperId = localStorage.getItem("camperId") || "J001";

    try {
      await folderApi.createFolder({
        teamId,
        folderName: folderName.trim(),
        userId: camperId,
      });

      // 폴더 목록 새로고침
      const response = await folderApi.getFolders(teamId);
      if (response.success) {
        setFolders(response.data);
      }

      setIsCreating(false);
      setFolderName("");
    } catch (error) {
      console.error("폴더 생성 실패:", error);
      alert("폴더 생성에 실패했습니다.");
    }
  };

  // 폴더 이름 수정
  const handleUpdateFolder = async (folderId: string) => {
    if (!folderName.trim()) {
      alert("폴더 이름을 입력하세요.");
      return;
    }

    try {
      await folderApi.updateFolder(folderId, {
        folderName: folderName.trim(),
      });

      // 폴더 목록 새로고침
      const response = await folderApi.getFolders(teamId);
      if (response.success) {
        setFolders(response.data);
      }

      setEditingFolderId(null);
      setFolderName("");
    } catch (error) {
      console.error("폴더 수정 실패:", error);
      alert("폴더 수정에 실패했습니다.");
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (
      !window.confirm(
        `"${folderName}" 폴더를 삭제하시겠습니까?\n하위 폴더는 함께 삭제되고, 링크는 폴더에서 제거됩니다.`
      )
    ) {
      return;
    }

    try {
      await folderApi.deleteFolder(folderId);

      // 폴더 목록 새로고침
      const response = await folderApi.getFolders(teamId);
      if (response.success) {
        setFolders(response.data);
      }

      // 삭제된 폴더가 선택되어 있었다면 선택 해제
      if (selectedFolderId === folderId) {
        onFolderClick?.(null);
      }
    } catch (error) {
      console.error("폴더 삭제 실패:", error);
      alert("폴더 삭제에 실패했습니다.");
    }
  };

  // 수정 시작
  const startEdit = (folder: FolderNode) => {
    setEditingFolderId(folder.folderId);
    setFolderName(folder.folderName);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingFolderId(null);
    setFolderName("");
  };

  // 폴더 노드 렌더링
  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const hasChildren = folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.folderId);
    const isSelected = selectedFolderId === folder.folderId;
    const isEditing = editingFolderId === folder.folderId;

    return (
      <div key={folder.folderId}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group ${
            isSelected
              ? "bg-blue-100 text-blue-700 font-semibold"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.folderId);
              }}
              className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          <span className="text-lg">📁</span>

          {isEditing ? (
            <>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateFolder(folder.folderId);
                  } else if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              <button
                onClick={() => handleUpdateFolder(folder.folderId)}
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                저장
              </button>
              <button
                onClick={cancelEdit}
                className="px-2 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <span
                className="flex-1 cursor-pointer"
                onClick={() => onFolderClick?.(folder.folderId)}
              >
                {folder.folderName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(folder);
                }}
                className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-opacity cursor-pointer"
                title="이름 변경"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.folderId, folder.folderName);
                }}
                className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-opacity cursor-pointer"
                title="삭제"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">폴더</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setFolderName("");
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          title="새 폴더 만들기"
        >
          + 폴더
        </button>
      </div>

      {/* 새 폴더 생성 입력창 */}
      {isCreating && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              } else if (e.key === "Escape") {
                setIsCreating(false);
                setFolderName("");
              }
            }}
            placeholder="폴더 이름 입력"
            className="w-full px-3 py-2 border border-blue-500 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateFolder}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              생성
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setFolderName("");
              }}
              className="flex-1 px-3 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 전체 링크 보기 */}
      <div
        className={`flex items-center gap-2 px-3 py-2 mb-2 cursor-pointer rounded-lg transition-colors ${
          selectedFolderId === null
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        onClick={() => onFolderClick?.(null)}
      >
        <span className="text-lg">📂</span>
        <span>전체 링크</span>
      </div>

      {/* 폴더 트리 */}
      {folderTree.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          폴더가 없습니다
        </div>
      ) : (
        <div className="space-y-1">
          {folderTree.map((folder) => renderFolder(folder))}
        </div>
      )}
    </div>
  );
};

export default FolderTree;

import { useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import type { Link } from "../../types";

interface LinkCardProps {
  link: Link;
  onDelete?: (linkId: string) => void;
  onTagClick?: (tag: string) => void;
}

const LinkCard = ({ link, onDelete, onTagClick }: LinkCardProps) => {
  const [isVisited, setIsVisited] = useState(() => {
    const visitedLinks = localStorage.getItem("visited_links");
    return visitedLinks
      ? JSON.parse(visitedLinks).includes(link.linkUuid)
      : false;
  });

  const handleLinkClick = () => {
    if (!isVisited) {
      setIsVisited(true);
      const visitedLinks = JSON.parse(
        localStorage.getItem("visited_links") || "[]",
      );
      if (!visitedLinks.includes(link.linkUuid)) {
        localStorage.setItem(
          "visited_links",
          JSON.stringify([...visitedLinks, link.linkUuid]),
        );
      }
    }
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1) {
      handleLinkClick();
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleLinkClick}
      onAuxClick={handleAuxClick}
      className="relative flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer max-w-sm"
    >
      {/* NEW 뱃지 */}
      {!isVisited && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-md z-10 border border-blue-200">
          NEW
        </div>
      )}

      {/* 링크 아이콘 영역 */}
      <div className="h-40 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
        <Link2 className="w-16 h-16 text-blue-300" />
      </div>

      {/* 콘텐츠 */}
      <div className="p-5 flex flex-col flex-1">
        {/* 제목 */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {link.title}
        </h3>

        {/* 요약 */}
        {link.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {link.summary}
          </p>
        )}

        {/* 태그 */}
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {link.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 작성자 정보 및 삭제 버튼 */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {link.createdBy.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600 truncate">
              {link.createdBy.userName}
            </span>
          </div>

          {/* 삭제 버튼 */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(link.linkUuid);
              }}
              className="p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
              title="링크 삭제"
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>
    </a>
  );
};

export default LinkCard;

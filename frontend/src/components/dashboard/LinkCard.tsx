import { useState } from "react";
import { ExternalLink, Image, Trash2 } from "lucide-react";
import type { Link } from "../../types";

interface LinkCardProps {
  link: Link;
  onDelete?: (linkId: string) => void;
  onTagClick?: (tag: string) => void;
}

const LinkCard = ({ link, onDelete, onTagClick }: LinkCardProps) => {
  const [isVisited, setIsVisited] = useState(() => {
    const visitedLinks = localStorage.getItem("visited_links");
    return visitedLinks ? JSON.parse(visitedLinks).includes(link.linkId) : false;
  });

  const handleLinkClick = () => {
    if (!isVisited) {
      setIsVisited(true);
      const visitedLinks = JSON.parse(localStorage.getItem("visited_links") || "[]");
      if (!visitedLinks.includes(link.linkId)) {
        localStorage.setItem("visited_links", JSON.stringify([...visitedLinks, link.linkId]));
      }
    }
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      handleLinkClick();
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Get calendar dates (ignoring time)
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  // 최근 3일 이내면 NEW 뱃지
  const isNew = () => {
    const date = new Date(link.createdAt);
    const now = new Date();

    // Get calendar dates (ignoring time)
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
      {/* 썸네일 */}
      <div className="relative h-48 bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="w-full h-full flex items-center justify-center">
          <Image className="w-12 h-12 text-blue-400" />
        </div>
        {isNew() && !isVisited && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            NEW
          </span>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
            onClick={handleLinkClick}
            onAuxClick={handleAuxClick}
          >
            <span className={`transition-colors rounded-lg px-2 py-1 hover:bg-blue-50 focus:bg-blue-100 w-full block text-gray-900`}>
              {link.title}
            </span>
          </a>
        </h3>

        <p className="text-sm text-gray-600 px-2 py-1 mb-4 line-clamp-10 leading-relaxed">
          {link.summary}
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {link.tags.slice(0, 3).map((tag, index) => (
            <button
              key={index}
              onClick={() => onTagClick?.(tag)}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors font-medium cursor-pointer"
            >
              # {tag}
            </button>
          ))}
          {link.tags.length > 3 && (
            <span className="text-xs px-3 py-1 text-gray-500 font-medium">
              +{link.tags.length - 3}
            </span>
          )}
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {link.createdBy.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {link.createdBy}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(link.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(link.linkId)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group cursor-pointer"
                title="링크 삭제"
              >
                <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </button>
            )}
            <button
              onClick={() => window.open(link.url, "_blank")}
              className="hidden p-2 hover:bg-blue-50 rounded-lg transition-colors group cursor-pointer"
              title="새 탭에서 열기"
            >
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;

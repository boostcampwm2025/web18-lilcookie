import type { Link } from "../../types";
import LinkCard from "./LinkCard";
import { Package } from "lucide-react";

interface LinkGridProps {
  links: Link[];
  loading?: boolean;
  onDeleteLink?: (linkId: string) => void;
  onTagClick?: (tag: string) => void;
}

const LinkGrid = ({
  links,
  loading = false,
  onDeleteLink,
  onTagClick,
}: LinkGridProps) => {
  // 로딩 중
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 빈 상태
  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Package className="w-20 h-20 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          저장된 링크가 없습니다
        </h3>
        <p className="text-sm text-gray-500">
          브라우저 확장 프로그램으로 링크를 저장해보세요!
        </p>
      </div>
    );
  }

  // 링크 목록
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link) => (
        <LinkCard
          key={link.linkId}
          link={link}
          onDelete={onDeleteLink}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};

export default LinkGrid;

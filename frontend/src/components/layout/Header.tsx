import { Search } from "lucide-react";

interface HeaderProps {
  currentTeam?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({
  currentTeam,
  searchQuery = "",
  onSearchChange,
}: HeaderProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* 왼쪽: 로고 + 현재 팀 + 검색 */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">TS</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-900">TeamStash</span>
            {currentTeam && (
              <span className="text-xs text-gray-500">/ {currentTeam}</span>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="링크, 콘텐츠, 태그로 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* TODO: 오른쪽에 알림, 설정, 계정 기능 구현 후 활성화
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">내 계정</span>
        </button>
      </div>
      */}
    </header>
  );
};

export default Header;

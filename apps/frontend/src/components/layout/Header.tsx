import { LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showMyPageLink?: boolean;
}

const Header = ({ showMyPageLink = true }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-end">
      <div className="flex items-center gap-3">
        {showMyPageLink ? (
          <button
            onClick={() => navigate("/my-page")}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            {user?.nickname || user?.email?.split("@")[0]}
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {user?.nickname || user?.email?.split("@")[0]}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">로그아웃</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getTeamIdFromToken } from "../services/authentikAuth";

const Login = () => {
  const { loginWithAuthentik, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const teamId = getTeamIdFromToken();
      if (teamId) {
        navigate(`/${teamId}`, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-gray-50 to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="flex items-center gap-4 mb-10 ml-2">
          <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <span className="text-white font-bold text-2xl">TS</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TeamStash</h1>
            <p className="text-gray-600 text-sm">팀 링크 공유 플랫폼</p>
          </div>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            로그인
          </h2>

          {/* Authentik 로그인 버튼 */}
          <button
            type="button"
            onClick={loginWithAuthentik}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transition-all cursor-pointer"
          >
            Authentik으로 로그인
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Authentik 계정으로 안전하게 로그인하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

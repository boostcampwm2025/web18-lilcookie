import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

// 인증이 필요한 라우트를 보호하는 컴포넌트(로그인하지 않은 사용자는 로그인 페이지로 리다이렉트)

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // 인증 상태 확인 중에는 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    const redirectUrl = location.pathname + location.search;
    sessionStorage.setItem("redirectAfterLogin", redirectUrl);
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;

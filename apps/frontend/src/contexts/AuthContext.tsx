/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import {
  startAuthentikLogin,
  clearTokens,
  getValidAccessToken,
  getUserInfo,
  getAuthentikLogoutUrl,
} from "../services/authentikAuth";

// OAuth 사용자 정보 타입
interface OAuthUser {
  sub: string;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loginWithAuthentik: () => Promise<void>;
  setOAuthUser: (user: OAuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인 (Authentik OAuth 토큰 기반)
  // 토큰이 만료되었으면 자동으로 refresh_token으로 갱신 시도
  const checkAuth = async () => {
    try {
      // 유효한 토큰 가져오기 (access_token이 없거나 만료되었으면 refresh_token으로 갱신 시도)
      const accessToken = await getValidAccessToken();

      if (accessToken) {
        try {
          const userInfo = await getUserInfo(accessToken);

          setUser({
            uuid: userInfo.sub,
            email: userInfo.email || "",
            nickname: userInfo.name || userInfo.preferred_username || "",
          });
        } catch {
          // userinfo 조회 실패 - 토큰 삭제 후 재로그인 필요
          clearTokens();
          setUser(null);
        }
      } else {
        // 토큰 갱신 실패 - 재로그인 필요
        clearTokens();
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 로그아웃 (Authentik 세션도 함께 종료)
  const logout = async () => {
    // OAuth 토큰 삭제
    clearTokens();
    sessionStorage.removeItem("redirectAfterLogin");

    // Authentik 세션 종료 (로그인 페이지로 리다이렉트)
    window.location.href = getAuthentikLogoutUrl();
  };

  // Authentik OAuth 로그인 시작
  const loginWithAuthentik = async () => {
    await startAuthentikLogin();
  };

  // OAuth 콜백에서 사용자 정보 설정
  const setOAuthUser = (oauthUser: OAuthUser) => {
    setUser({
      uuid: oauthUser.sub,
      email: oauthUser.email,
      nickname: oauthUser.nickname,
    });
    setIsLoading(false);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
    checkAuth,
    loginWithAuthentik,
    setOAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

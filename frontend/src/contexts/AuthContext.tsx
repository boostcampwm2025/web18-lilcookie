/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, setAuthErrorCallback } from "../services/api";
import type { User, SignupRequest, LoginRequest } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인
  // HttpOnly 쿠키에 토큰이 있으면 자동으로 인증됨
  const checkAuth = async () => {
    try {
      const response = await authApi.checkAuth();
      if (response.success) {
        setUser({
          uuid: response.data.uuid,
          email: response.data.email,
          nickname: response.data.nickname,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  // 브라우저에 HttpOnly 쿠키가 남아있으면 자동 로그인됨
  useEffect(() => {
    checkAuth();

    // 토큰 갱신 실패 시 자동 로그아웃 처리를 위한 콜백 등록
    setAuthErrorCallback(() => {
      setUser(null);
    });
  }, []);

  // 회원가입
  // 백엔드에서 회원가입 성공 시 자동으로 JWT 토큰을 HttpOnly 쿠키로 발급
  // 따라서 회원가입 후 바로 로그인 상태가 됨
  const signup = async (data: SignupRequest) => {
    const response = await authApi.signup(data);
    if (response.success) {
      // 회원가입 성공 시 토큰이 쿠키에 저장되므로
      // user 상태를 업데이트하여 즉시 로그인 상태로 전환
      setUser({
        uuid: response.data.uuid,
        email: response.data.email,
        nickname: response.data.nickname,
      });
    } else {
      throw new Error(response.message || "회원가입에 실패했습니다.");
    }
  };

  // 로그인
  // 로그인 성공 시 JWT 토큰이 HttpOnly 쿠키로 발급됨
  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    if (response.success) {
      setUser({
        uuid: response.data.uuid,
        email: response.data.email,
        nickname: response.data.nickname,
      });
    } else {
      throw new Error(response.message || "로그인에 실패했습니다.");
    }
  };

  // 로그아웃
  // 백엔드에서 HttpOnly 쿠키를 삭제함
  const logout = async () => {
    await authApi.logout();

    // 로그아웃 시 클라이언트 상태 초기화
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

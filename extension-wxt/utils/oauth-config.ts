// OAuth 설정
export const OAUTH_BASE_URL = import.meta.env.VITE_OAUTH_BASE_URL || "http://localhost:3002";
export const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "teamstash-extension";
export const OAUTH_SCOPES = ["openid", "profile", "email", "links:read", "links:write"];

// OIDC Discovery 응답 타입
export interface OIDCDiscoveryResponse {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
}

// 토큰 응답 타입
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

// 사용자 정보 타입
export interface UserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  nickname?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

// Chrome Storage에 저장하는 인증 데이터
export interface StoredAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // 만료 시각 (ms)
  userInfo?: UserInfo;
}

// Storage 키
export const STORAGE_KEYS = {
  AUTH_DATA: "authData",
  CODE_VERIFIER: "oauth_code_verifier",
  OAUTH_STATE: "oauth_state",
} as const;

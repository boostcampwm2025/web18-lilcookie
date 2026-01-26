import { AUTHENTIK_CONFIG } from "../config/authentik";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storeOAuthParams,
  getStoredOAuthParams,
  clearStoredOAuthParams,
} from "../utils/pkce";

// 토큰 응답 타입
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

export interface AccessTokenPayload {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  team_id: string;
  exp: number;
  iat: number;
}

const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  EXPIRES_AT: "token_expires_at",
};

function getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function getStoredAccessToken(): string | null {
  return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Decodes JWT payload WITHOUT signature verification.
 * Use ONLY for display purposes (UI). Never trust for authorization.
 * All authorization decisions are made by the backend which validates signatures via JWKS.
 * JWT 페이로드를 서명 검증 없이 디코딩합니다.
 * 오직 UI 표시 용도로만 사용하세요. 권한 부여를 위해 신뢰하지 마세요.
 * 모든 권한 부여 결정은 JWKS를 통해 서명을 검증하는 백엔드에서 이루어집니다.
 */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function getTeamIdFromToken(token?: string): string | null {
  const accessToken = token ?? getStoredAccessToken();
  if (!accessToken) return null;
  const payload = decodeAccessToken(accessToken);
  return payload?.team_id ?? null;
}

// Authentik 로그인 시작
export async function startAuthentikLogin(): Promise<void> {
  // PKCE 값 생성
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // sessionStorage에 저장
  storeOAuthParams(codeVerifier, state);

  // authorize URL 생성
  const params = new URLSearchParams({
    client_id: AUTHENTIK_CONFIG.clientId,
    redirect_uri: AUTHENTIK_CONFIG.redirectUri,
    response_type: "code",
    scope: AUTHENTIK_CONFIG.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `${AUTHENTIK_CONFIG.authorizeUrl}?${params.toString()}`;

  // Authentik 로그인 페이지로 리다이렉트
  window.location.href = authorizeUrl;
}

// Authorization code -> access token
export async function exchangeCodeForToken(
  code: string,
): Promise<TokenResponse> {
  // 저장된 PKCE 값 가져오기
  const { codeVerifier } = getStoredOAuthParams();

  if (!codeVerifier) {
    throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
  }

  // 토큰 교환 요청
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: AUTHENTIK_CONFIG.clientId,
    code: code,
    redirect_uri: AUTHENTIK_CONFIG.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(AUTHENTIK_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
  }

  const tokenData: TokenResponse = await response.json();

  // PKCE 값 정리
  clearStoredOAuthParams();

  return tokenData;
}

// state 검증(CSRF 방지)
export function verifyState(receivedState: string): boolean {
  const { state: storedState } = getStoredOAuthParams();
  if (!storedState) {
    return false;
  }
  return storedState === receivedState;
}

export async function getUserInfo(
  accessToken: string,
): Promise<AccessTokenPayload> {
  const response = await fetch(AUTHENTIK_CONFIG.userinfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("사용자 정보 조회 실패");
  }

  return response.json();
}

function setCookie(name: string, value: string, maxAgeSeconds?: number): void {
  const isLocalhost = window.location.hostname === "localhost";
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;

  if (!isLocalhost) {
    cookie += "; Secure";
  }

  if (maxAgeSeconds) {
    cookie += `; max-age=${maxAgeSeconds}`;
  }

  document.cookie = cookie;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function storeTokens(tokenResponse: TokenResponse): void {
  // access_token 저장 (만료 시간 설정)
  setCookie(
    COOKIE_NAMES.ACCESS_TOKEN,
    tokenResponse.access_token,
    tokenResponse.expires_in,
  );

  // refresh_token 저장 (더 긴 만료 시간 - 7일)
  if (tokenResponse.refresh_token) {
    setCookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      tokenResponse.refresh_token,
      7 * 24 * 60 * 60,
    );
  }

  // 만료 시간 저장 (자동 갱신 판단용)
  // 안전 마진 60초를 빼서 만료 직전에 갱신하도록 함
  const expiresAt = Date.now() + (tokenResponse.expires_in - 60) * 1000;
  setCookie(
    COOKIE_NAMES.EXPIRES_AT,
    expiresAt.toString(),
    tokenResponse.expires_in,
  );
}

// 저장된 Refresh token 가져오기
export function getStoredRefreshToken(): string | null {
  return getCookie(COOKIE_NAMES.REFRESH_TOKEN);
}

// 토큰 만료 여부 확인
export function isTokenExpired(): boolean {
  const expiresAt = getCookie(COOKIE_NAMES.EXPIRES_AT);
  if (!expiresAt) return true;
  return Date.now() >= parseInt(expiresAt, 10);
}

// Refresh token으로 새 access token 발급
export async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: AUTHENTIK_CONFIG.clientId,
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch(AUTHENTIK_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return null;
    }

    const tokenData: TokenResponse = await response.json();

    // 새 토큰 저장
    storeTokens(tokenData);

    return tokenData;
  } catch {
    return null;
  }
}

// 유효한 access token 가져오기 -> 만료되었으면 자동으로 갱신 시도
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return null;
  }

  // 토큰이 만료되지 않았으면 그대로 반환
  if (!isTokenExpired()) {
    return accessToken;
  }

  // 토큰이 만료되었으면 갱신 시도
  const newTokens = await refreshAccessToken();

  if (newTokens) {
    return newTokens.access_token;
  }

  // 갱신 실패 시 null 반환 (재로그인 필요)
  return null;
}

// 저장된 모든 토큰 삭제 (로그아웃 시)
export function clearTokens(): void {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAMES.EXPIRES_AT);
}

// Authentik 로그아웃 URL 생성 (Authentik 세션도 함께 종료 - 로그아웃 후 /login으로 리다이렉트)
export function getAuthentikLogoutUrl(): string {
  const params = new URLSearchParams({
    post_logout_redirect_uri: window.location.origin + "/login",
  });

  return `${AUTHENTIK_CONFIG.logoutUrl}?${params.toString()}`;
}

import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce";
import {
  OAUTH_BASE_URL,
  OAUTH_CLIENT_ID,
  OAUTH_SCOPES,
  STORAGE_KEYS,
  type OIDCDiscoveryResponse,
  type TokenResponse,
  type UserInfo,
  type StoredAuthData,
} from "./oauth-config";

// OIDC Discovery: OAuth 엔드포인트 정보 가져오기
async function getOAuthEndpoints(): Promise<OIDCDiscoveryResponse> {
  const discoveryUrl = `${OAUTH_BASE_URL}/.well-known/openid-configuration`;
  console.log("[OAuth] OIDC Discovery 요청:", discoveryUrl);

  const response = await fetch(discoveryUrl);
  if (!response.ok) {
    throw new Error(`OIDC Discovery 실패: ${response.status} ${response.statusText}`);
  }

  const config = await response.json();
  console.log("[OAuth] OIDC Discovery 응답:", config);

  return {
    issuer: config.issuer,
    authorization_endpoint: config.authorization_endpoint,
    token_endpoint: config.token_endpoint,
    userinfo_endpoint: config.userinfo_endpoint,
  };
}

// OAuth 로그인 실행
export async function login(): Promise<UserInfo> {
  console.log("[OAuth] 로그인 시작");

  // 1. OIDC Discovery로 엔드포인트 가져오기
  const endpoints = await getOAuthEndpoints();

  // 2. PKCE 코드 생성
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  console.log("[OAuth] PKCE 생성 완료");

  // code_verifier와 state를 임시 저장 (토큰 교환 시 필요)
  await chrome.storage.session.set({
    [STORAGE_KEYS.CODE_VERIFIER]: codeVerifier,
    [STORAGE_KEYS.OAUTH_STATE]: state,
  });

  // 3. Authorization URL 구성
  const redirectUri = chrome.identity.getRedirectURL();
  const authUrl = new URL(endpoints.authorization_endpoint);
  authUrl.searchParams.set("client_id", OAUTH_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", OAUTH_SCOPES.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  console.log("[OAuth] Authorization URL:", authUrl.toString());

  // 4. 로그인 창 열기
  const responseUrl = await new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (callbackUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!callbackUrl) {
          reject(new Error("사용자가 로그인을 취소했습니다."));
          return;
        }
        resolve(callbackUrl);
      }
    );
  });

  // 5. Authorization Code 추출 및 검증
  const callbackParams = new URL(responseUrl).searchParams;
  const authorizationCode = callbackParams.get("code");
  const returnedState = callbackParams.get("state");

  const error = callbackParams.get("error");
  if (error) {
    const errorDescription = callbackParams.get("error_description") || "알 수 없는 에러";
    throw new Error(`OAuth 에러: ${error} - ${errorDescription}`);
  }

  if (!authorizationCode) {
    throw new Error("Authorization Code를 받지 못했습니다.");
  }

  // State 검증 (CSRF 방지)
  if (returnedState !== state) {
    throw new Error("State 불일치: CSRF 공격 가능성이 있습니다.");
  }

  console.log("[OAuth] Authorization Code 받음");

  // 6. Authorization Code를 Token으로 교환
  const tokenResponse = await exchangeCodeForToken(
    endpoints.token_endpoint,
    authorizationCode,
    codeVerifier,
    redirectUri
  );

  console.log("[OAuth] Token 받음");

  // 7. 사용자 정보 가져오기
  const userInfo = await getUserInfo(endpoints.userinfo_endpoint, tokenResponse.access_token);
  console.log("[OAuth] 사용자 정보:", userInfo);

  // 8. 인증 정보 저장
  const authData: StoredAuthData = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    userInfo: userInfo,
  };

  // local storage: 브라우저 종료 후에도 로그인 유지
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_DATA]: authData });

  // 임시 저장한 PKCE 값들 삭제
  await chrome.storage.session.remove([STORAGE_KEYS.CODE_VERIFIER, STORAGE_KEYS.OAUTH_STATE]);

  console.log("[OAuth] 로그인 완료!");
  return userInfo;
}

// Authorization Code를 Access Token으로 교환
async function exchangeCodeForToken(
  tokenEndpoint: string,
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: OAUTH_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Token 교환 실패: ${response.status} - ${errorData.error || "알 수 없는 에러"}`);
  }

  return response.json();
}

// 사용자 정보 가져오기
async function getUserInfo(userInfoEndpoint: string, accessToken: string): Promise<UserInfo> {
  const response = await fetch(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`UserInfo 요청 실패: ${response.status}`);
  }

  return response.json();
}

// 로그아웃
export async function logout(): Promise<void> {
  console.log("[OAuth] 로그아웃");

  await chrome.storage.local.remove([STORAGE_KEYS.AUTH_DATA]);
  await chrome.storage.session.remove([STORAGE_KEYS.CODE_VERIFIER, STORAGE_KEYS.OAUTH_STATE]);

  console.log("[OAuth] 로그아웃 완료");
}

// 저장된 인증 데이터 가져오기
export async function getStoredAuthData(): Promise<StoredAuthData | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_DATA);
  const authData = result[STORAGE_KEYS.AUTH_DATA] as StoredAuthData | undefined;
  return authData || null;
}

// 로그인 상태 확인 (만료 5분 전부터는 만료 처리)
export async function isLoggedIn(): Promise<boolean> {
  const authData = await getStoredAuthData();
  if (!authData) return false;

  const bufferTime = 5 * 60 * 1000;
  return Date.now() < authData.expiresAt - bufferTime;
}

// Access Token 가져오기
export async function getAccessToken(): Promise<string | null> {
  const isValid = await isLoggedIn();
  if (!isValid) return null;

  const authData = await getStoredAuthData();
  return authData?.accessToken || null;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<UserInfo | null> {
  const authData = await getStoredAuthData();
  return authData?.userInfo || null;
}

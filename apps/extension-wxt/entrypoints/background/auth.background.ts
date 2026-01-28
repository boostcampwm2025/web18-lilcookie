// OAuth and authentication logic for the extension

// Authentik OAuth settings (from env)
const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL;
const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
const SCOPES =
  "openid profile email roles offline_access team_id links:read links:write ai:use folders:read folders:write";

// Token storage type
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp
}

export interface UserInfo {
  userId: string; // sub claim
  teamId: string; // team_id claim
  nickname?: string; // nickname claim
}

export interface AuthState {
  isLoggedIn: boolean;
  accessToken?: string;
  userInfo?: UserInfo;
}

// JWT helpers
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function extractUserInfo(accessToken: string): UserInfo | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  const sub = payload.sub;
  const teamId = payload.team_id;

  if (typeof sub !== "string" || typeof teamId !== "string") {
    return null;
  }

  return {
    userId: sub,
    teamId,
    nickname:
      typeof payload.nickname === "string" ? payload.nickname : undefined,
  };
}

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

// Token exchange
async function exchangeCodeForToken(code: string): Promise<AuthTokens> {
  const { oauth_code_verifier } = await chrome.storage.local.get(
    "oauth_code_verifier",
  );

  if (!oauth_code_verifier || typeof oauth_code_verifier !== "string") {
    throw new Error("code_verifier가 없습니다.");
  }

  const response = await fetch(`${AUTHENTIK_URL}/application/o/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: chrome.identity.getRedirectURL(),
      code_verifier: oauth_code_verifier,
    }),
  });

  if (!response.ok) {
    throw new Error("토큰 교환 실패");
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${AUTHENTIK_URL}/application/o/token/`, {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("토큰 갱신 실패");
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

// Login - start OAuth flow
export async function login(): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate state
    const state = crypto.randomUUID();
    // Generate PKCE: code_verifier, code_challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store state and code_verifier temporarily
    await chrome.storage.local.set({
      oauth_state: state,
      oauth_code_verifier: codeVerifier,
    });

    // Build authorization URL
    const authUrl =
      `${AUTHENTIK_URL}/application/o/authorize/?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    // Launch browser popup for login
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });

    if (!responseUrl) {
      return { success: false, error: "로그인이 취소되었습니다." };
    }

    // Extract code from redirect URL
    const url = new URL(responseUrl);

    // Validate state
    const returnedState = url.searchParams.get("state");
    const { oauth_state: savedState } =
      await chrome.storage.local.get("oauth_state");
    if (returnedState !== savedState) {
      return { success: false, error: "보안 검증 실패(state mismatch)" };
    }
    await chrome.storage.local.remove("oauth_state");

    // Extract code
    const code = url.searchParams.get("code");
    if (!code) {
      return { success: false, error: "인가 코드를 받지 못했습니다." };
    }

    // Exchange code for token
    const tokens = await exchangeCodeForToken(code);

    // Store tokens
    await chrome.storage.local.set({
      auth_tokens: tokens,
    });

    // Clean up PKCE data
    await chrome.storage.local.remove("oauth_code_verifier");

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "로그인 실패",
    };
  }
}

// Logout
export async function logout(): Promise<void> {
  await chrome.storage.local.remove("auth_tokens");

  const logoutUrl = `${AUTHENTIK_URL}/application/o/teamstash/end-session/`;
  const tab = await chrome.tabs.create({ url: logoutUrl, active: false });

  setTimeout(() => {
    if (tab.id) chrome.tabs.remove(tab.id);
  }, 2000);
}

// Get current auth state
export async function getAuthState(): Promise<AuthState> {
  const { auth_tokens } = (await chrome.storage.local.get("auth_tokens")) as {
    auth_tokens?: AuthTokens;
  };

  if (!auth_tokens) {
    return { isLoggedIn: false };
  }

  // Check token expiration
  if (auth_tokens.expires_at < Date.now()) {
    // Expired - try refresh
    if (auth_tokens.refresh_token) {
      try {
        const newTokens = await refreshAccessToken(auth_tokens.refresh_token);
        await chrome.storage.local.set({ auth_tokens: newTokens });
        const userInfo = extractUserInfo(newTokens.access_token);
        if (!userInfo) {
          await logout();
          return { isLoggedIn: false };
        }
        return {
          isLoggedIn: true,
          accessToken: newTokens.access_token,
          userInfo,
        };
      } catch {
        await logout();
        return { isLoggedIn: false };
      }
    }
    return { isLoggedIn: false };
  }

  const userInfo = extractUserInfo(auth_tokens.access_token);
  if (!userInfo) {
    await logout();
    return { isLoggedIn: false };
  }
  return {
    isLoggedIn: true,
    accessToken: auth_tokens.access_token,
    userInfo,
  };
}

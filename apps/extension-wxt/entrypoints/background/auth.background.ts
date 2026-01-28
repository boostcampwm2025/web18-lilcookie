import axios from "axios";
import axiosRetry from "axios-retry";
import { AUTHENTIK_CONFIG } from "../../config/authentik";
import { API_CONFIG } from "../../config/api";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storeOAuthParams,
  getStoredOAuthParams,
  clearStoredOAuthParams,
} from "../../utils/pkce";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface Team {
  teamUuid: string;
  teamName: string;
  createdAt: string;
  role: "admin" | "member";
}

export interface UserInfo {
  userUuid: string;
  nickname?: string;
  teams: Team[];
  selectedTeamUuid: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  accessToken?: string;
  userInfo?: UserInfo;
}

const authClient = axios.create({
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

axiosRetry(authClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
});

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

function extractBasicUserInfo(
  accessToken: string,
): { userUuid: string; nickname?: string } | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  const sub = payload.sub;
  if (typeof sub !== "string") {
    return null;
  }

  return {
    userUuid: sub,
    nickname:
      typeof payload.nickname === "string" ? payload.nickname : undefined,
  };
}

async function fetchUserTeams(accessToken: string): Promise<Team[]> {
  const response = await axios.get<{ data: Team[] }>(
    `${API_CONFIG.baseUrl}/teams/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return response.data.data;
}

async function exchangeCodeForToken(code: string): Promise<AuthTokens> {
  const { codeVerifier } = await getStoredOAuthParams();

  if (!codeVerifier) {
    throw new Error("code_verifier가 없습니다.");
  }

  const response = await authClient.post<TokenResponse>(
    AUTHENTIK_CONFIG.tokenUrl,
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: AUTHENTIK_CONFIG.clientId,
      code: code,
      redirect_uri: AUTHENTIK_CONFIG.redirectUri,
      code_verifier: codeVerifier,
    }),
  );

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token ?? "",
    expires_at: Date.now() + response.data.expires_in * 1000,
  };
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthTokens | null> {
  try {
    const response = await authClient.post<TokenResponse>(
      AUTHENTIK_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: AUTHENTIK_CONFIG.clientId,
        refresh_token: refreshToken,
      }),
    );

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token ?? refreshToken,
      expires_at: Date.now() + response.data.expires_in * 1000,
    };
  } catch {
    return null;
  }
}

async function buildUserInfo(accessToken: string): Promise<UserInfo | null> {
  const basicInfo = extractBasicUserInfo(accessToken);
  if (!basicInfo) return null;

  let teams: Team[] = [];
  try {
    teams = await fetchUserTeams(accessToken);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
  }

  const { selected_team_uuid } = await chrome.storage.local.get(
    "selected_team_uuid",
  );
  const selectedTeamUuid =
    typeof selected_team_uuid === "string" &&
    teams.some((t) => t.teamUuid === selected_team_uuid)
      ? selected_team_uuid
      : teams[0]?.teamUuid ?? "";

  return {
    userUuid: basicInfo.userUuid,
    nickname: basicInfo.nickname,
    teams,
    selectedTeamUuid,
  };
}

export async function login(): Promise<{ success: boolean; error?: string }> {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    await storeOAuthParams(codeVerifier, state);

    const params = new URLSearchParams({
      client_id: AUTHENTIK_CONFIG.clientId,
      redirect_uri: AUTHENTIK_CONFIG.redirectUri,
      response_type: "code",
      scope: AUTHENTIK_CONFIG.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `${AUTHENTIK_CONFIG.authorizeUrl}?${params.toString()}`;

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });

    if (!responseUrl) {
      return { success: false, error: "로그인이 취소되었습니다." };
    }

    const url = new URL(responseUrl);

    const returnedState = url.searchParams.get("state");
    const { state: savedState } = await getStoredOAuthParams();
    if (returnedState !== savedState) {
      return { success: false, error: "보안 검증 실패(state mismatch)" };
    }

    const code = url.searchParams.get("code");
    if (!code) {
      return { success: false, error: "인가 코드를 받지 못했습니다." };
    }

    const tokens = await exchangeCodeForToken(code);

    await chrome.storage.local.set({ auth_tokens: tokens });
    await clearStoredOAuthParams();

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "로그인 실패",
    };
  }
}

export async function logout(): Promise<void> {
  await chrome.storage.local.remove(["auth_tokens", "selected_team_uuid"]);

  const tab = await chrome.tabs.create({
    url: AUTHENTIK_CONFIG.logoutUrl,
    active: false,
  });

  setTimeout(() => {
    if (tab.id) chrome.tabs.remove(tab.id);
  }, 2000);
}

export async function selectTeam(teamUuid: string): Promise<void> {
  await chrome.storage.local.set({ selected_team_uuid: teamUuid });
}

export async function getAuthState(): Promise<AuthState> {
  const { auth_tokens } = (await chrome.storage.local.get("auth_tokens")) as {
    auth_tokens?: AuthTokens;
  };

  if (!auth_tokens) {
    return { isLoggedIn: false };
  }

  if (auth_tokens.expires_at < Date.now()) {
    if (auth_tokens.refresh_token) {
      const newTokens = await refreshAccessToken(auth_tokens.refresh_token);

      if (newTokens) {
        await chrome.storage.local.set({ auth_tokens: newTokens });
        const userInfo = await buildUserInfo(newTokens.access_token);
        if (!userInfo) {
          return { isLoggedIn: false };
        }
        return {
          isLoggedIn: true,
          accessToken: newTokens.access_token,
          userInfo,
        };
      }

      return { isLoggedIn: false };
    }
    return { isLoggedIn: false };
  }

  const userInfo = await buildUserInfo(auth_tokens.access_token);
  if (!userInfo) {
    return { isLoggedIn: false };
  }

  return {
    isLoggedIn: true,
    accessToken: auth_tokens.access_token,
    userInfo,
  };
}

export default defineBackground(() => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const FE_BASE_URL = import.meta.env.VITE_FE_BASE_URL;
  const POST_URL = BASE_URL + "/links";

  // Authentik OAuth 설정
  const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL;
  const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
  const SCOPES = "openid profile email offline_access";

  const MAX_AI_INPUT_CHARACTER_COUNT = 300;

  // OAuth 인증 관련

  // 토큰 저장 타입
  interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number; // timestamp
  }

  // 로그인 함수 - OAuth 플로우 시작
  async function login(): Promise<{ success: boolean; error?: string }> {
    try {
      // 0.1. state 생성
      const state = crypto.randomUUID();
      // 0.2 pkce: code_verifier, code_challenge 생성
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 0.3. state와 code_verifier를 storage에 임시 저장
      await chrome.storage.local.set({
        oauth_state: state,
        oauth_code_verifier: codeVerifier,
      });

      // 1. 인가 url 생성
      const authUrl =
        `${AUTHENTIK_URL}/application/o/authorize/?` +
        `client_id=${CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `state=${state}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      // 2. 브라우저 팝업으로 로그인
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true, // 사용자 상호작용 필요
      });

      if (!responseUrl) {
        return { success: false, error: "로그인이 취소되었습니다." };
      }

      // 3. 리다이렉트 url에서 code 추출
      const url = new URL(responseUrl);

      // 3-1. 응답에서 state 검증
      const returnedState = url.searchParams.get("state");
      const { oauth_state: savedState } =
        await chrome.storage.local.get("oauth_state");
      if (returnedState !== savedState) {
        return { success: false, error: "보안 검증 실패(state mismatch)" };
      }
      // 3-1-1. 사용한 state 삭제
      await chrome.storage.local.remove("oauth_state");

      // 3-2. code 추출
      const code = url.searchParams.get("code");

      if (!code) {
        return { success: false, error: "인가 코드를 받지 못했습니다." };
      }

      // 4. code -> token 교환
      const tokens = await exchangeCodeForToken(code);

      // 5. storage에 토큰 저장
      await chrome.storage.local.set({
        auth_tokens: tokens,
      });

      // 6. 임시저장된 pkcd 데이터 정리
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

  // code -> token 교환 함수
  async function exchangeCodeForToken(code: string): Promise<AuthTokens> {
    // 저장된 code_verifier 가져오기
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

  // 현재 인증 상태 확인
  async function getAuthState(): Promise<{
    isLoggedIn: boolean;
    accessToken?: string;
  }> {
    const { auth_tokens } = (await chrome.storage.local.get("auth_tokens")) as {
      auth_tokens?: AuthTokens;
    };

    if (!auth_tokens) {
      return { isLoggedIn: false };
    }

    // 토큰 만료 체크
    if (auth_tokens.expires_at < Date.now()) {
      // 만료됐으면 refresh 시도
      if (auth_tokens.refresh_token) {
        try {
          const newTokens = await refreshAccessToken(auth_tokens.refresh_token);
          await chrome.storage.local.set({ auth_tokens: newTokens });
          return { isLoggedIn: true, accessToken: newTokens.access_token };
        } catch {
          // refresh 실패
          await logout();
          return { isLoggedIn: false };
        }
      }
      return { isLoggedIn: false };
    }
    return { isLoggedIn: true, accessToken: auth_tokens.access_token };
  }

  // refresh token으로 access token 갱신
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

  // 로그아웃
  async function logout(): Promise<void> {
    await chrome.storage.local.remove("auth_tokens");
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveLink") {
      saveLink(request.data).then(sendResponse);
      return true;
    } else if (request.action === "summarize") {
      summarizeContent(request.content, request.aiPassword)
        .then(sendResponse)
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        );
      return true;
    } else if (request.action === "login") {
      login().then(sendResponse);
      return true;
    } else if (request.action === "logout") {
      logout().then(() => sendResponse({ success: true }));
      return true;
    } else if (request.action === "getAuthState") {
      getAuthState().then(sendResponse);
      return true;
    }
  });

  async function summarizeContent(content: string, aiPassword: string) {
    try {
      // 인증 상태 확인 및 토큰 가져오기
      const authState = await getAuthState();
      if (!authState.isLoggedIn || !authState.accessToken) {
        return { success: false, error: "로그인이 필요합니다" };
      }

      const response = await fetch(BASE_URL + "/ai/summary", {
        method: "POST",
        body: JSON.stringify({
          content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT),
          aiPassword,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json.data };
      } else {
        const errorJson = await response.json().catch(() => ({}));
        return { success: false, error: errorJson.message || "요약 실패" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  async function saveLink(formData: any) {
    try {
      // 인증 상태 확인 및 토큰 가져오기
      const authState = await getAuthState();
      if (!authState.isLoggedIn || !authState.accessToken) {
        return { success: false, error: "로그인이 필요합니다." };
      }

      const response = await fetch(POST_URL, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${authState.accessToken}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json };
      } else {
        const errorJson = await response.json().catch(() => ({}));
        return { success: false, error: errorJson.message || "저장 실패" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  // TODO: 유저-팀 연결 후 새 링크 알림 기능 복원
  // // 알람 설정: 1분마다 실행
  // chrome.alarms.create("pollLinks", { periodInMinutes: 0.5 });

  // chrome.alarms.onAlarm.addListener((alarm) => {
  //   if (alarm.name === "pollLinks") {
  //     checkNewLinks();
  //   }
  // });

  // // Notification click handler: open dashboard
  // chrome.notifications.onClicked.addListener(async (notificationId) => {
  //   if (notificationId === "teamstash-new-links") {
  //     const { teamId } = await chrome.storage.sync.get("teamId");
  //     if (teamId && typeof teamId === "string") {
  //       chrome.tabs.create({ url: `${FE_BASE_URL}/${teamId.toLowerCase()}` });
  //     }
  //     chrome.notifications.clear(notificationId);
  //     await chrome.storage.local.set({ unseenLinkCount: 0 });
  //   }
  // });

  // async function checkNewLinks() {
  //   try {
  //     const { teamId, lastCheck, camperId } = await chrome.storage.sync.get([
  //       "teamId",
  //       "lastCheck",
  //       "camperId",
  //     ]);

  //     if (!teamId) return;

  //     const now = new Date();
  //     const formattedNow = now.toISOString();

  //     if (!lastCheck) {
  //       await chrome.storage.sync.set({ lastCheck: formattedNow });
  //       return;
  //     }

  //     const url = new URL(POST_URL);
  //     url.searchParams.append("teamId", String(teamId));
  //     url.searchParams.append("createdAfter", String(lastCheck));

  //     const response = await fetch(url.toString());
  //     if (response.ok) {
  //       const json = await response.json();
  //       const links = json.data || [];
  //       const newLinks = links.filter(
  //         (link: any) => link.createdBy !== camperId,
  //       );

  //       if (Array.isArray(newLinks) && newLinks.length > 0) {
  //         const { unseenLinkCount } = await chrome.storage.local.get([
  //           "unseenLinkCount",
  //         ]);
  //         const totalNewLinks =
  //           (Number(unseenLinkCount) || 0) + newLinks.length;

  //         const notificationId = "teamstash-new-links";
  //         chrome.notifications.create(notificationId, {
  //           type: "basic",
  //           iconUrl: "images/icon-128.png",
  //           title: "[TeamStash] 새로운 링크 알림",
  //           message: `${totalNewLinks}개의 새로운 링크가 등록되었습니다.`,
  //           priority: 2,
  //         });

  //         chrome.storage.local.set({
  //           unseenLinkCount: totalNewLinks,
  //         });
  //       }

  //       await chrome.storage.sync.set({ lastCheck: formattedNow });
  //     }
  //   } catch (error) {}
  // }

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab) {
        showSummary(tab);
        // TODO: 유저-팀 연결 후 대시보드 방문 체크 복원
        // checkDashboardVisit(tab);
      }
    } catch (error) {}
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab) {
      showSummary(tab);
      // TODO: 유저-팀 연결 후 대시보드 방문 체크 복원
      // checkDashboardVisit(tab);
    }
  });

  // TODO: 유저-팀 연결 후 대시보드 방문 체크 복원
  // async function checkDashboardVisit(tab: chrome.tabs.Tab) {
  //   try {
  //     if (!tab || !tab.url) return;

  //     const { teamId } = await chrome.storage.sync.get("teamId");
  //     if (!teamId || typeof teamId !== "string") return;

  //     const dashboardUrl = `${FE_BASE_URL}/${teamId.toLowerCase()}`;

  //     if (tab.url.startsWith(dashboardUrl)) {
  //       await chrome.storage.local.set({ unseenLinkCount: 0 });
  //       chrome.notifications.clear("teamstash-new-links");
  //     }
  //   } catch (error) {}
  // }

  async function showSummary(tab: chrome.tabs.Tab) {
    try {
      if (!tab || !tab.id) {
        return;
      }

      if (!tab.url?.startsWith("http")) {
        chrome.storage.session.set({ pageContent: null });
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractContent",
      });
      chrome.storage.session.set({ pageContent: response || null });
    } catch (error) {
      chrome.storage.session.set({ pageContent: null });
    }
  }
});

// pkce 관련 헬퍼 함수들
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

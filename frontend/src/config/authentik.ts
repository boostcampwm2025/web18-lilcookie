// Authentik OAuth 설정

const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL;
const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_AUTHENTIK_REDIRECT_URI;

export const AUTHENTIK_CONFIG = {
  clientId: CLIENT_ID,

  // OAuth 엔드포인트
  authorizeUrl: `${AUTHENTIK_URL}/application/o/authorize/`,
  tokenUrl: `${AUTHENTIK_URL}/application/o/token/`,
  userinfoUrl: `${AUTHENTIK_URL}/application/o/userinfo/`,

  // 프론트엔드 콜백 URL
  redirectUri: REDIRECT_URI,

  // 요청할 권한 범위
  scope: "openid profile email offline_access",

  // 로그아웃 엔드포인트 (Authentik 세션도 함께 종료)
  logoutUrl: `${AUTHENTIK_URL}/application/o/team-stash/end-session/`,
};

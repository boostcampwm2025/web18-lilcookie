const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL;
const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;

export const AUTHENTIK_CONFIG = {
  clientId: CLIENT_ID,

  authorizeUrl: `${AUTHENTIK_URL}/application/o/authorize/`,
  tokenUrl: `${AUTHENTIK_URL}/application/o/token/`,
  userinfoUrl: `${AUTHENTIK_URL}/application/o/userinfo/`,

  redirectUri: chrome.identity.getRedirectURL(),

  scope:
    "openid profile email roles offline_access team_id links:read links:write ai:use folders:read folders:write",

  logoutUrl: `${AUTHENTIK_URL}/application/o/teamstash/end-session/`,
};

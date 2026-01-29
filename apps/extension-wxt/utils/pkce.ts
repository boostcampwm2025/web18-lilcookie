function base64UrlEncode(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

export function generateState(): string {
  return crypto.randomUUID();
}

const STORAGE_KEYS = {
  CODE_VERIFIER: "oauth_code_verifier",
  STATE: "oauth_state",
};

export async function storeOAuthParams(
  codeVerifier: string,
  state: string,
): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.CODE_VERIFIER]: codeVerifier,
    [STORAGE_KEYS.STATE]: state,
  });
}

export async function getStoredOAuthParams(): Promise<{
  codeVerifier: string | null;
  state: string | null;
}> {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.CODE_VERIFIER,
    STORAGE_KEYS.STATE,
  ]);
  const codeVerifier = result[STORAGE_KEYS.CODE_VERIFIER];
  const state = result[STORAGE_KEYS.STATE];
  return {
    codeVerifier: typeof codeVerifier === "string" ? codeVerifier : null,
    state: typeof state === "string" ? state : null,
  };
}

export async function clearStoredOAuthParams(): Promise<void> {
  await chrome.storage.local.remove([
    STORAGE_KEYS.CODE_VERIFIER,
    STORAGE_KEYS.STATE,
  ]);
}

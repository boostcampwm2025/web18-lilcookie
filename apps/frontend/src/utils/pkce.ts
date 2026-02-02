// Base64 URL 인코딩 함수
function base64UrlEncode(buffer: Uint8Array): string {
  // Uint8Array를 일반 Base64로 변환
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);

  // Base64 URL 형식으로 변환
  // + → -
  // / → _
  // = 패딩 제거
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// code_verifier 생성(PKCE 스펙이 따라)
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// code_challenge 생성 -> code_verifier를 SHA-256으로 해시한 후 Base64 URL 인코딩
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return base64UrlEncode(new Uint8Array(hash));
}

// state 생성 (CSRF 방지용) -> 로그인 요청마다 고유한 값을 생성해서 콜백에서 검증
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

const STORAGE_KEYS = {
  CODE_VERIFIER: "oauth_code_verifier",
  STATE: "oauth_state",
};

// OAuth 시작 전 PKCE 값들을 sessionStorage에 저장
export function storeOAuthParams(codeVerifier: string, state: string): void {
  sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.STATE, state);
}

// 콜백에서 저장된 OAuth 파라미터 가져오기
export function getStoredOAuthParams(): {
  codeVerifier: string | null;
  state: string | null;
} {
  return {
    codeVerifier: sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER),
    state: sessionStorage.getItem(STORAGE_KEYS.STATE),
  };
}

// OAuth 완료 후 저장된 파라미터 삭제
export function clearStoredOAuthParams(): void {
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.STATE);
}

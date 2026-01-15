// code_verifier 생성
export function generateCodeVerifier(): string {
  // 사용 가능한 문자들 (RFC 7636에 정의된 문자 집합)
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  // 48바이트의 랜덤 데이터 생성 (crypto API 사용)
  const randomBytes = new Uint8Array(48);
  crypto.getRandomValues(randomBytes);

  // 각 바이트를 charset의 문자로 변환
  // 예: randomBytes[0]이 150이면 → 150 % 66 = 18 → charset[18] = 'S'
  let verifier = "";
  for (let i = 0; i < randomBytes.length; i++) {
    verifier += charset[randomBytes[i] % charset.length];
  }

  return verifier;
}

// code_challenge 생성
export async function generateCodeChallenge(verifier: string): Promise<string> {
  // code_verifier를 UTF-8 바이트 배열로 변환
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);

  // SHA-256 해시 계산
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // 해시 결과(ArrayBuffer)를 Base64 문자열로 변환
  const hashArray = new Uint8Array(hashBuffer);
  let base64 = "";

  // ArrayBuffer를 문자열로 변환하는 과정
  // 각 바이트를 문자 코드로 변환 후, btoa()로 Base64 인코딩
  for (let i = 0; i < hashArray.length; i++) {
    base64 += String.fromCharCode(hashArray[i]);
  }
  base64 = btoa(base64);

  // Base64를 Base64URL로 변환
  // '+' → '-', '/' → '_', '=' 제거
  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return base64url;
}

// state 파라미터 생성
export function generateState(): string {
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);

  // 바이트를 16진수 문자열로 변환
  // 예: 0xAB → "ab"
  let state = "";
  for (let i = 0; i < randomBytes.length; i++) {
    state += randomBytes[i].toString(16).padStart(2, "0");
  }

  return state;
}

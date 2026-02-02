/**
 * OIDC 관련 상수
 */

/** JWKS 캐시 유효 기간 (ms) */
export const JWKS_CACHE_DURATION_MS = 300000; // 5분

/** JWKS fetch 최대 재시도 횟수 */
export const JWKS_MAX_RETRIES = 3;

/** issuer에서 slug 추출 정규식 */
export const ISSUER_SLUG_PATTERN = /\/application\/o\/([^/]+)\/?$/;

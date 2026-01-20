import { Request } from "express";

export interface TokenInfo {
  token: string;
  expiresAt: number;
}

export interface AuthTokens {
  accessTokenInfo: TokenInfo;
  refreshTokenInfo: TokenInfo;
}

// 공개용 유저 페이로드 인터페이스
export interface UserPayload {
  uuid: string;
  email: string;
  nickname: string;
}

// 인증 결과 인터페이스
export interface AuthResult {
  user: UserPayload;
  tokens: AuthTokens;
}

export interface AccessTokenPayload {
  sub: string; // User UUID
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // User UUID
  jti: string; // Token UUID
  iat: number;
  exp: number;
}

// express Request 확장 인터페이스
export interface AuthenticatedRequest extends Request {
  accessTokenPayload?: AccessTokenPayload;
  refreshTokenPayload?: RefreshTokenPayload;
  rawAccessToken?: string;
  rawRefreshToken?: string;
}

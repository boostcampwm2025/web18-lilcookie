import { RefreshToken } from "../entities/refresh-token.entity";

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  deleteByJtiAndUser(jti: string, userUuid: string): Promise<void>;
  findByJtiAndUser(jti: string, userUuid: string): Promise<RefreshToken | null>;
  deleteExpiredTokens(): Promise<number>;
}

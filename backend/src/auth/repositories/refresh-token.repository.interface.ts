import { RefreshToken } from "../entities/refresh-token.entity";

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  deleteByUserId(userId: number): Promise<void>;
}

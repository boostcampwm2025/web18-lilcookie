export class RefreshToken {
  id: number;
  jti: string; // jwt uuid
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}

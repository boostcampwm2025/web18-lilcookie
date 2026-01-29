export class TokenUsage {
  id: number;
  teamId: number;
  date: string;
  usedTokens: number;
  maxTokens: number;

  constructor(partial: Partial<TokenUsage>) {
    Object.assign(this, partial);
  }
}

export class SummarizeResponseDto {
  tags: string[];
  summary: string;

  constructor(partial: Partial<SummarizeResponseDto>) {
    Object.assign(this, partial);
  }

  static from(tags: string[], summary: string): SummarizeResponseDto {
    return new SummarizeResponseDto({
      tags,
      summary,
    });
  }
}

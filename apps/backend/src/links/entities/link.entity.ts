export class Link {
  linkId: number;
  linkUuid: string;
  teamId: number;
  teamUuid: string;
  folderId: number;
  folderUuid: string;
  linkUrl: string;
  linkTitle: string;
  linkTags: string; // JSON 문자열로 저장
  linkSummary: string;
  createdAt: Date;
  createdBy: number;

  constructor(partial: Partial<Link>) {
    Object.assign(this, partial);
  }

  /**
   * 링크 태그를 파싱하여 문자열 배열로 반환
   * - 태그가 없거나 파싱에 실패하면 빈 배열 반환
   * @return 태그 문자열 배열
   */
  getParsedTags(): string[] {
    try {
      const parsed: unknown = JSON.parse(this.linkTags);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((tag): tag is string => typeof tag === "string")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }
}

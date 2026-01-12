export class Link {
  linkId: string;
  teamId: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: string;
  folderId: string | null; // 폴더 ID (null이면 폴더 없음)

  constructor(partial: Partial<Link>) {
    Object.assign(this, partial);
  }
}

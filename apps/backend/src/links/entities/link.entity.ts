export class Link {
  id: number;
  uuid: string;
  teamId: number;
  folderId: number | null;
  url: string;
  title: string;
  tags: string; // JSON 문자열로 저장
  summary: string;
  createdAt: Date;
  createdBy: number;

  constructor(partial: Partial<Link>) {
    Object.assign(this, partial);
  }
}

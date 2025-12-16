export class Link {
  linkId: string;
  teamId: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: string;

  constructor(partial: Partial<Link>) {
    Object.assign(this, partial);
  }
}

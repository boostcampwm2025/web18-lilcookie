export class Folder {
  id: number;
  uuid: string;
  teamId: number;
  name: string;
  createdAt: Date;
  createdBy: number;

  constructor(partial: Partial<Folder>) {
    Object.assign(this, partial);
  }
}

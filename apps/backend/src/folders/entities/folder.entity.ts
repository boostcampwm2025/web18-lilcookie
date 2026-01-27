export class Folder {
  folderId: number;
  folderUuid: string;
  teamId: number;
  folderName: string;
  createdAt: Date;
  createdBy: number;

  constructor(partial: Partial<Folder>) {
    Object.assign(this, partial);
  }
}

export class Folder {
  folderId: string; // 폴더 고유 ID
  teamId: string; // 팀 ID (web01, web18 등)
  folderName: string; // 폴더 이름
  parentFolderId: string | null; // 부모 폴더 ID (null이면 최상위 폴더)
  createdAt: string; // 생성 시각
  createdBy: string; // 생성한 사용자 ID

  constructor(partial: Partial<Folder>) {
    Object.assign(this, partial);
  }
}

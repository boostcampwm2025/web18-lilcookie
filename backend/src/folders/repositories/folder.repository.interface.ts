import { Folder } from "../entities/folder.entity";

export interface IFolderRepository {
  create(folder: Folder): Promise<Folder>;
  findAll(): Promise<Folder[]>;
  findAllByTeam(teamId: string): Promise<Folder[]>;
  findOne(folderId: string): Promise<Folder | null>;
  update(folderId: string, folderName: string): Promise<Folder | null>;
  remove(folderId: string): Promise<boolean>;
  findSubfolders(parentFolderId: string): Promise<Folder[]>;
}

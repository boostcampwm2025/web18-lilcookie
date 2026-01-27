import { Folder } from "../entities/folder.entity";
import { FolderWithCreator, CreateFolderInput } from "../types/folder.types";

export interface IFolderRepository {
  create(input: CreateFolderInput): Promise<FolderWithCreator>;
  findAllByTeam(teamId: number): Promise<FolderWithCreator[]>;
  findByUuid(folderUuid: string): Promise<FolderWithCreator | null>;
  update(folderId: number, folderName: string): Promise<FolderWithCreator | null>;
  remove(folderId: number): Promise<boolean>;
  findByTeamIdAndName(teamId: number, folderName: string): Promise<Folder | null>;
  findDefaultFolderByTeamId(teamId: number): Promise<Folder | null>;
}

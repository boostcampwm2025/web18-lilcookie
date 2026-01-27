import { Folder } from "../entities/folder.entity";

export interface IFolderRepository {
  create(folder: Omit<Folder, "id" | "uuid" | "createdAt">): Promise<Folder>;
  findAll(): Promise<Folder[]>;
  findAllByTeam(teamUuid: string): Promise<Folder[]>;
  findByUuid(uuid: string): Promise<Folder | null>;
  update(uuid: string, name: string): Promise<Folder | null>;
  remove(uuid: string): Promise<boolean>;
}

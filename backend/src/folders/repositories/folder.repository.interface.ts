import { Folder } from "../entities/folder.entity";

export interface IFolderRepository {
  create(folder: Omit<Folder, "id" | "uuid">): Promise<Folder>;
  findAll(): Promise<Folder[]>;
  findAllByTeam(teamId: number): Promise<Folder[]>;
  findOne(uuid: string): Promise<Folder | null>;
  update(uuid: string, name: string): Promise<Folder | null>;
  remove(uuid: string): Promise<boolean>;
}

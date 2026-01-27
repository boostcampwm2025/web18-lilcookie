import { Folder } from "../entities/folder.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 폴더와 생성한 사용자 정보 포함 타입
 */
export interface FolderWithCreator {
  folder: Folder;
  creator: User;
}

/**
 * 폴더 생성시 필요한 입력 타입
 */
export interface CreateFolderInput {
  teamId: number;
  folderName: string;
  createdBy: number;
}

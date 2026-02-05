import { Injectable } from "@nestjs/common";
import type { Folder as PrismaFolder, User as PrismaUser } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { Folder } from "../entities/folder.entity";
import { FolderMapper } from "../mappers/folder.mapper";
import { UserMapper } from "../../user/mappers/user.mapper";
import { FolderWithCreator, CreateFolderInput } from "../types/folder.types";
import { DEFAULT_FOLDER_NAME } from "../constants/folder.constants";

/**
 * Prisma Folder + Creator 타입
 * 프리즈마에 정의된 Folder 타입에 생성한 사용자 정보 포함
 */
type PrismaFolderWithCreator = PrismaFolder & {
  creator: PrismaUser;
};

@Injectable()
export class FolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 폴더 생성
   * @param input 생성 입력 데이터
   * @returns 생성된 폴더와 생성한 사용자 정보
   */
  async create(input: CreateFolderInput): Promise<FolderWithCreator> {
    const created = await this.prisma.folder.create({
      data: {
        teamId: input.teamId,
        name: input.folderName,
        createdBy: input.createdBy,
      },
      include: {
        creator: true,
      },
    });

    return {
      folder: FolderMapper.fromPrisma(created as PrismaFolderWithCreator),
      creator: UserMapper.fromPrisma(created.creator),
    };
  }

  /**
   * 폴더 이름 중복 체크
   * @param teamId 팀 pk
   * @param folderName 폴더 이름
   * @returns 해당 이름의 폴더 존재 여부
   */
  async existsByTeamIdAndName(teamId: number, folderName: string): Promise<boolean> {
    const folder = await this.prisma.folder.findFirst({
      where: {
        teamId,
        name: folderName,
      },
    });
    return folder !== null;
  }

  /**
   * 특정 팀의 모든 폴더 조회
   * @param teamId 팀 ID
   * @returns 폴더와 해당 폴더를 생성한 사용자 정보 배열
   */
  async findAllByTeam(teamId: number): Promise<FolderWithCreator[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        creator: true,
      },
    });

    return folders.map((f) => ({
      folder: FolderMapper.fromPrisma(f as PrismaFolderWithCreator),
      creator: UserMapper.fromPrisma(f.creator),
    }));
  }

  /**
   * 특정 폴더 조회
   * @param folderUuid 폴더 UUID
   * @returns 폴더와 해당 폴더를 생성한 사용자 정보 또는 null
   */
  async findByUuid(folderUuid: string): Promise<FolderWithCreator | null> {
    const folder = await this.prisma.folder.findUnique({
      where: {
        uuid: folderUuid,
      },
      include: {
        creator: true,
      },
    });

    if (!folder) {
      return null;
    }

    return {
      folder: FolderMapper.fromPrisma(folder as PrismaFolderWithCreator),
      creator: UserMapper.fromPrisma(folder.creator),
    };
  }

  /**
   * 특정 폴더 정보 업데이트
   * @param folderId 폴더 ID
   * @param folderName 새로운 폴더 이름
   * @returns 업데이트된 폴더와 해당 폴더를 생성한 사용자 정보 또는 null
   */
  async update(folderId: number, folderName: string): Promise<FolderWithCreator | null> {
    try {
      const updated = await this.prisma.folder.update({
        where: {
          id: folderId,
        },
        data: {
          name: folderName,
        },
        include: {
          creator: true,
        },
      });

      return {
        folder: FolderMapper.fromPrisma(updated as PrismaFolderWithCreator),
        creator: UserMapper.fromPrisma(updated.creator),
      };
    } catch {
      return null;
    }
  }

  /**
   * 특정 폴더 삭제
   * @param folderId 폴더 ID
   * @returns 삭제 성공 여부
   */
  async remove(folderId: number): Promise<boolean> {
    try {
      await this.prisma.folder.delete({ where: { id: folderId } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 특정 팀의 폴더 이름으로 조회
   * @param teamId 팀 ID
   * @param folderName 폴더 이름
   * @returns 폴더 또는 null
   */
  async findByTeamIdAndName(teamId: number, folderName: string): Promise<Folder | null> {
    const folder = await this.prisma.folder.findFirst({
      where: {
        teamId,
        name: folderName,
      },
    });

    return folder ? FolderMapper.fromPrisma(folder) : null;
  }

  /**
   * 특정 팀의 기본 폴더 조회
   * @param teamId 팀 ID
   * @returns 기본 폴더 또는 null
   */
  async findDefaultFolderByTeamId(teamId: number): Promise<Folder | null> {
    return this.findByTeamIdAndName(teamId, DEFAULT_FOLDER_NAME);
  }
}

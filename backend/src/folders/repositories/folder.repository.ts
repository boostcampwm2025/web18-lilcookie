import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IFolderRepository } from "./folder.repository.interface";
import { Folder } from "../entities/folder.entity";

@Injectable()
export class FolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(folder: Folder): Promise<Folder> {
    const created = await this.prisma.folder.create({
      data: {
        folderId: folder.folderId,
        teamId: folder.teamId,
        folderName: folder.folderName,
        parentFolderId: folder.parentFolderId,
        createdAt: folder.createdAt,
        createdBy: folder.createdBy,
      },
    });

    return new Folder({
      folderId: created.folderId,
      teamId: created.teamId,
      folderName: created.folderName,
      parentFolderId: created.parentFolderId,
      createdAt: created.createdAt,
      createdBy: created.createdBy,
    });
  }

  async findAll(): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return folders.map(
      (folder) =>
        new Folder({
          folderId: folder.folderId,
          teamId: folder.teamId,
          folderName: folder.folderName,
          parentFolderId: folder.parentFolderId,
          createdAt: folder.createdAt,
          createdBy: folder.createdBy,
        }),
    );
  }

  async findAllByTeam(teamId: string): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return folders.map(
      (folder) =>
        new Folder({
          folderId: folder.folderId,
          teamId: folder.teamId,
          folderName: folder.folderName,
          parentFolderId: folder.parentFolderId,
          createdAt: folder.createdAt,
          createdBy: folder.createdBy,
        }),
    );
  }

  async findOne(folderId: string): Promise<Folder | null> {
    const folder = await this.prisma.folder.findUnique({
      where: {
        folderId,
      },
    });

    if (!folder) {
      return null;
    }

    return new Folder({
      folderId: folder.folderId,
      teamId: folder.teamId,
      folderName: folder.folderName,
      parentFolderId: folder.parentFolderId,
      createdAt: folder.createdAt,
      createdBy: folder.createdBy,
    });
  }

  async update(folderId: string, folderName: string): Promise<Folder | null> {
    try {
      const updated = await this.prisma.folder.update({
        where: {
          folderId,
        },
        data: {
          folderName,
        },
      });

      return new Folder({
        folderId: updated.folderId,
        teamId: updated.teamId,
        folderName: updated.folderName,
        parentFolderId: updated.parentFolderId,
        createdAt: updated.createdAt,
        createdBy: updated.createdBy,
      });
    } catch {
      return null;
    }
  }

  async remove(folderId: string): Promise<boolean> {
    try {
      await this.prisma.folder.delete({
        where: {
          folderId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findSubfolders(parentFolderId: string): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        parentFolderId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return folders.map(
      (folder) =>
        new Folder({
          folderId: folder.folderId,
          teamId: folder.teamId,
          folderName: folder.folderName,
          parentFolderId: folder.parentFolderId,
          createdAt: folder.createdAt,
          createdBy: folder.createdBy,
        }),
    );
  }
}

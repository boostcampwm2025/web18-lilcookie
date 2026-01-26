import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IFolderRepository } from "./folder.repository.interface";
import { Folder } from "../entities/folder.entity";

@Injectable()
export class FolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(folder: Omit<Folder, "id" | "uuid" | "createdAt">): Promise<Folder> {
    const created = await this.prisma.folder.create({
      data: {
        teamId: folder.teamId,
        name: folder.name,
        createdBy: folder.createdBy,
      },
    });

    return new Folder(created);
  }

  async findAll(): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return folders.map((f) => new Folder(f));
  }

  async findAllByTeam(teamId: number): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        teamId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return folders.map((f) => new Folder(f));
  }

  async findOne(uuid: string): Promise<Folder | null> {
    const folder = await this.prisma.folder.findUnique({
      where: {
        uuid,
      },
    });

    return folder ? new Folder(folder) : null;
  }

  async update(uuid: string, name: string): Promise<Folder | null> {
    try {
      const updated = await this.prisma.folder.update({
        where: {
          uuid,
        },
        data: {
          name,
        },
      });

      return new Folder(updated);
    } catch {
      return null;
    }
  }

  async remove(uuid: string): Promise<boolean> {
    try {
      await this.prisma.folder.delete({ where: { uuid } });
      return true;
    } catch {
      return false;
    }
  }
}

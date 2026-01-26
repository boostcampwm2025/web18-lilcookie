import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUuid(uuid: string) {
    return this.prisma.user.findUnique({ where: { uuid } });
  }

  async create(data: { uuid: string; nickname: string }) {
    return this.prisma.user.create({ data });
  }
}

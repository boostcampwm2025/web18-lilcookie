import { Injectable } from "@nestjs/common";
import { User as PrismaUser } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { IUserRepository } from "./user.repository.interface";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        authentikId: user.authentikId,
        email: user.email,
        nickname: user.nickname,
        termsOfService: user.termsOfService,
        privacyPolicy: user.privacyPolicy,
        marketingConsent: user.marketingConsent,
        termsOfServiceAt: user.termsOfServiceAt,
        privacyPolicyAt: user.privacyPolicyAt,
        marketingConsentAt: user.marketingConsentAt,
      },
    });

    return this.toEntity(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toEntity(user) : null;
  }

  async findByAuthentikId(authentikId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { authentikId },
    });

    return user ? this.toEntity(user) : null;
  }

  private toEntity(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      authentikId: prismaUser.authentikId,
      email: prismaUser.email,
      nickname: prismaUser.nickname,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
      termsOfService: prismaUser.termsOfService,
      privacyPolicy: prismaUser.privacyPolicy,
      marketingConsent: prismaUser.marketingConsent,
      termsOfServiceAt: prismaUser.termsOfServiceAt,
      privacyPolicyAt: prismaUser.privacyPolicyAt,
      marketingConsentAt: prismaUser.marketingConsentAt,
    });
  }
}

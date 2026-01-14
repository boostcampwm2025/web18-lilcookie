import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IUserRepository } from "./user.repository.interface";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname,
        passwordHash: user.passwordHash,
        termsOfService: user.termsOfService,
        privacyPolicy: user.privacyPolicy,
        marketingConsent: user.marketingConsent,
        termsOfServiceAt: user.termsOfServiceAt,
        privacyPolicyAt: user.privacyPolicyAt,
        marketingConsentAt: user.marketingConsentAt,
      },
    });

    return new User({
      id: created.id,
      uuid: created.uuid,
      email: created.email,
      nickname: created.nickname,
      passwordHash: created.passwordHash,
      createdAt: created.createdAt,
      termsOfService: created.termsOfService,
      privacyPolicy: created.privacyPolicy,
      marketingConsent: created.marketingConsent,
      termsOfServiceAt: created.termsOfServiceAt,
      privacyPolicyAt: created.privacyPolicyAt,
      marketingConsentAt: created.marketingConsentAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      termsOfService: user.termsOfService,
      privacyPolicy: user.privacyPolicy,
      marketingConsent: user.marketingConsent,
      termsOfServiceAt: user.termsOfServiceAt,
      privacyPolicyAt: user.privacyPolicyAt,
      marketingConsentAt: user.marketingConsentAt,
    });
  }

  async findByUuid(uuid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      termsOfService: user.termsOfService,
      privacyPolicy: user.privacyPolicy,
      marketingConsent: user.marketingConsent,
      termsOfServiceAt: user.termsOfServiceAt,
      privacyPolicyAt: user.privacyPolicyAt,
      marketingConsentAt: user.marketingConsentAt,
    });
  }
}

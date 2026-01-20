import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { User } from "./entities/user.entity";
import type { AuthentikJwtPayload } from "./strategies/authentik-jwt.strategy";

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Authentik에서 인증된 유저를 찾거나 새로 생성
   * - 토큰에서 추출한 정보로 유저 조회/생성
   */
  async findOrCreateUser(payload: AuthentikJwtPayload): Promise<User> {
    // Authentik ID로 기존 유저 찾기
    const existingUser = await this.userRepository.findByAuthentikId(payload.sub);
    if (existingUser) {
      return existingUser;
    }

    // 신규 유저 생성 (첫 로그인)
    const now = new Date();
    const newUser = new User({
      id: 0,
      authentikId: payload.sub,
      email: payload.email,
      nickname: payload.preferred_username || payload.name || payload.email.split("@")[0],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      // 첫 로그인 시 약관 동의는 기본값으로 설정 (나중에 별도 동의 플로우 추가 가능)
      termsOfService: true,
      privacyPolicy: true,
      marketingConsent: false,
      termsOfServiceAt: now,
      privacyPolicyAt: now,
      marketingConsentAt: null,
    });

    return this.userRepository.create(newUser);
  }

  /**
   * Authentik ID로 유저 조회
   */
  async getUserByAuthentikId(authentikId: string): Promise<User> {
    const user = await this.userRepository.findByAuthentikId(authentikId);
    if (!user) {
      throw new UnauthorizedException("유저 정보를 불러오는데 실패했습니다.");
    }
    return user;
  }
}

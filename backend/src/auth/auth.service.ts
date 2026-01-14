import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import { UserRepository } from "./repositories/user.repository";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";
import { SignupRequestDto } from "./dto/signup.request.dto";
import { User } from "./entities/user.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupRequestDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    await this.validateSignup(dto);

    const user = await this.registerUser(dto);
    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  }

  private async validateSignup(dto: SignupRequestDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      // 존재하는 사용자(이메일)
      throw new BadRequestException("회원가입에 실패했습니다.");
    }

    const { termsOfService, privacyPolicy } = dto.agreements;
    if (!termsOfService || !privacyPolicy) {
      // 필수약관 동의안함
      throw new BadRequestException("회원가입에 실패했습니다.");
    }
  }

  private async registerUser(dto: SignupRequestDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const now = new Date();

    const user = new User({
      id: 0,
      uuid: uuidv4(),
      email: dto.email,
      nickname: dto.nickname,
      passwordHash,
      createdAt: now,
      termsOfService: dto.agreements.termsOfService,
      privacyPolicy: dto.agreements.privacyPolicy,
      marketingConsent: dto.agreements.marketingConsent,
      termsOfServiceAt: now,
      privacyPolicyAt: now,
      marketingConsentAt: dto.agreements.marketingConsent ? now : null,
    });

    return this.userRepository.create(user);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.uuid };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_TOKEN_SECRET"),
      expiresIn: this.configService.get("JWT_ACCESS_EXPIRES_IN"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN"),
    });

    await this.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // Refresh Token DB 저장
  private async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = new RefreshToken({
      id: 0,
      userId,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.create(refreshTokenEntity);
  }
}

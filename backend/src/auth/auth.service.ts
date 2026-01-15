import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import { UserRepository } from "./repositories/user.repository";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";
import { SignupRequestDto } from "./dto/signup.request.dto";
import { LoginRequestDto } from "./dto/login.request.dto";
import { User } from "./entities/user.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpSec: number;
  private readonly refreshExpSec: number;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>("JWT_ACCESS_SECRET");
    this.refreshSecret = this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    // 환경변수에 설정된 만료시간(String -> Number) (단위: 초)
    this.accessExpSec = Number(this.configService.getOrThrow<number>("JWT_ACCESS_EXP_SEC"));
    this.refreshExpSec = Number(this.configService.getOrThrow<number>("JWT_REFRESH_EXP_SEC"));
  }

  async signup(dto: SignupRequestDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    await this.validateSignup(dto);

    const user = await this.registerUser(dto);
    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  }

  async login(dto: LoginRequestDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.verifyUser(dto);
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

  private async verifyUser(dto: LoginRequestDto): Promise<User> {
    const user = await this.userRepository.findByEmail(dto.email);
    const isPasswordValid = user ? await this.compareValue(dto.password, user.passwordHash) : false;
    if (!user || !isPasswordValid) {
      // 유저 존재 여부 및 비밀번호 일치 확인
      throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    return user;
  }

  private async registerUser(dto: SignupRequestDto): Promise<User> {
    const passwordHash = await this.hashValue(dto.password);
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
      secret: this.accessSecret,
      expiresIn: this.accessExpSec,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpSec,
    });

    await this.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // Refresh Token DB 저장
  private async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = await this.hashValue(refreshToken);

    // Date.now()는 밀리초 단위기에 refreshExpSec를 1000으로 곱해줘야 함
    const expiresAt = new Date(Date.now() + this.refreshExpSec * 1000);

    const refreshTokenEntity = new RefreshToken({
      id: 0,
      userId,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.create(refreshTokenEntity);
  }

  // --- 해싱 관련 ---

  private async hashValue(value: string): Promise<string> {
    return bcrypt.hash(value, this.SALT_ROUNDS);
  }

  private async compareValue(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

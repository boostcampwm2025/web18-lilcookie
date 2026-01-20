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
import { AuthResult, AuthTokens, TokenInfo } from "./interfaces/auth.interface";

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

  // --- 메서드 ---
  async signup(dto: SignupRequestDto): Promise<AuthResult> {
    await this.validateSignup(dto);

    const user = await this.registerUser(dto);
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async login(dto: LoginRequestDto): Promise<AuthResult> {
    const user = await this.verifyUser(dto);
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async logout(userUuid: string, jti: string, rawRefreshToken: string) {
    const token = await this.refreshTokenRepository.findByJtiAndUser(jti, userUuid);
    if (!token) {
      throw new UnauthorizedException("로그아웃에 실패했습니다.");
    }

    const isMatch = await this.compareValue(rawRefreshToken, token.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException("로그아웃에 실패했습니다.");
    }

    try {
      await this.refreshTokenRepository.deleteByJtiAndUser(jti, userUuid);
    } catch {
      throw new UnauthorizedException("로그아웃에 실패했습니다.");
    }
  }

  async getUserByUuid(userUuid: string): Promise<User> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new UnauthorizedException("유저 정보를 불러오는데 실패했습니다.");
    }

    return user;
  }

  async refreshTokens(userUuid: string, jti: string, rawRefreshToken: string): Promise<AuthTokens> {
    const token = await this.refreshTokenRepository.findByJtiAndUser(jti, userUuid);
    if (!token) {
      throw new UnauthorizedException("토큰 재발급에 실패했습니다.");
    }

    const isMatch = await this.compareValue(rawRefreshToken, token.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException("토큰 재발급에 실패했습니다.");
    }

    const user = await this.getUserByUuid(userUuid);
    if (!user) {
      throw new UnauthorizedException("토큰 재발급에 실패했습니다.");
    }

    // 기존 Refresh Token 삭제 + 새 토큰 발급
    try {
      await this.refreshTokenRepository.deleteByJtiAndUser(jti, userUuid);
    } catch {
      // 삭제 실패해도 무시
    }

    return this.generateTokens(user);
  }

  // --- 검증 및 처리 ---
  private async validateSignup(dto: SignupRequestDto): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException("회원가입에 실패했습니다.");
    }

    const { termsOfService, privacyPolicy } = dto.agreements;
    if (!termsOfService || !privacyPolicy) {
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

  // --- 회원가입 처리 ---
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

  // --- 토큰 관련 ---
  private async generateTokens(user: User): Promise<AuthTokens> {
    const accessTokenInfo = this.createAccessToken(user);
    const { jti, refreshTokenInfo } = this.createRefreshToken(user);

    // Refresh Token DB 저장
    await this.saveRefreshToken(user.id, jti, refreshTokenInfo);

    return { accessTokenInfo, refreshTokenInfo };
  }

  private createAccessToken(user: User): TokenInfo {
    const expiresAt = Date.now() + this.accessExpSec * 1000;
    const payload = { sub: user.uuid };
    const token = this.jwtService.sign(payload, { secret: this.accessSecret, expiresIn: this.accessExpSec });

    return { token, expiresAt };
  }

  private createRefreshToken(user: User): { jti: string; refreshTokenInfo: TokenInfo } {
    const jti = uuidv4();
    const expiresAt = Date.now() + this.refreshExpSec * 1000;
    const payload = { sub: user.uuid, jti };
    const token = this.jwtService.sign(payload, { secret: this.refreshSecret, expiresIn: this.refreshExpSec });

    return {
      jti,
      refreshTokenInfo: { token, expiresAt },
    };
  }

  private async saveRefreshToken(userId: number, jti: string, refreshTokenInfo: TokenInfo): Promise<void> {
    const tokenHash = await this.hashValue(refreshTokenInfo.token);
    const expiresAt = new Date(refreshTokenInfo.expiresAt);

    const refreshToken = new RefreshToken({
      id: 0,
      userId,
      jti,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.create(refreshToken);
  }

  // --- 해싱 관련 ---
  private async hashValue(value: string): Promise<string> {
    return bcrypt.hash(value, this.SALT_ROUNDS);
  }

  private async compareValue(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

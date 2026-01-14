import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "./repositories/user.repository";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // 필수 환경변수 목록
        const requiredEnvVars = [
          "JWT_ACCESS_SECRET",
          "JWT_REFRESH_SECRET",
          "JWT_ACCESS_EXP_SEC",
          "JWT_REFRESH_EXP_SEC",
        ];

        for (const key of requiredEnvVars) {
          if (!config.get(key)) {
            throw new Error(`환경변수 설정 오류: ${key}가 존재하지 않습니다.`);
          }
        }

        return {
          // 비즈니스 로직에서 override를 통해 변경 가능
          secret: config.get("JWT_ACCESS_SECRET"),
          signOptions: {
            issuer: "lilcookie",
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, RefreshTokenRepository],
  exports: [AuthService],
})
export class AuthModule {}

import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "./repositories/user.repository";
import { AuthentikJwtStrategy } from "./strategies/authentik-jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "authentik-jwt" }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, AuthentikJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

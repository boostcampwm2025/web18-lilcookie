import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

export interface AuthentikJwtPayload {
  sub: string; // Authentik user ID
  email: string;
  preferred_username: string;
  name?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

@Injectable()
export class AuthentikJwtStrategy extends PassportStrategy(Strategy, "authentik-jwt") {
  constructor(configService: ConfigService) {
    const issuer = configService.getOrThrow<string>("AUTHENTIK_ISSUER");
    const jwksUri = configService.getOrThrow<string>("AUTHENTIK_JWKS_URI");
    const clientId = configService.getOrThrow<string>("AUTHENTIK_CLIENT_ID");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: clientId,
      issuer: issuer,
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri,
      }),
    });
  }

  validate(payload: AuthentikJwtPayload): AuthentikJwtPayload {
    // passport-jwt가 자동으로 토큰 검증 (서명, 만료, issuer, audience)
    // 여기서는 payload를 그대로 반환 (request.user에 저장됨)
    return payload;
  }
}

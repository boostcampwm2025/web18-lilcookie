import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jose from "jose";
import type { OidcTokenPayload } from "./interfaces/oidc.interface";

type JWKWithKid = jose.JWK & { kid: string };

interface JWKSResponse {
  keys: JWKWithKid[];
}

@Injectable()
export class OidcService {
  private jwksUrl: string;
  private issuer: string;
  private audience: string;
  private cachedJwks: JWKSResponse | null;
  private cacheExpiry: number;
  private readonly CACHE_DURATION = 300000;

  constructor(private readonly configService: ConfigService) {
    this.jwksUrl = this.configService.getOrThrow<string>("AUTHENTIK_JWKS_URL");
    this.issuer = this.configService.getOrThrow<string>("AUTHENTIK_ISSUER");
    this.audience = this.configService.getOrThrow<string>("AUTHENTIK_AUDIENCE");
    this.cacheExpiry = 0;
    this.cachedJwks = null;
  }

  async validateToken(token: string): Promise<OidcTokenPayload> {
    try {
      const header = jose.decodeProtectedHeader(token);

      if (!header.kid) {
        throw new UnauthorizedException("Invalid token: missing kid");
      }

      const publicKey = await this.getPublicKey(header.kid);

      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return this.validatePayload(payload);
    } catch (error) {
      if (error instanceof jose.errors.JOSEError) {
        throw new UnauthorizedException("Invalid token signature");
      }
      throw error;
    }
  }

  private async getPublicKey(kid: string): Promise<CryptoKey | Uint8Array> {
    const now = Date.now();

    if (this.cachedJwks && now < this.cacheExpiry) {
      const key = this.cachedJwks.keys.find((k) => k.kid === kid);

      if (!key) {
        throw new UnauthorizedException("Invalid token: key not found");
      }

      return jose.importJWK(key);
    }

    const response = await fetch(this.jwksUrl);
    if (!response.ok) {
      throw new UnauthorizedException("Failed to fetch JWKS");
    }

    const jwks = (await response.json()) as JWKSResponse;
    this.cachedJwks = jwks;
    this.cacheExpiry = now + this.CACHE_DURATION;

    const key = jwks.keys.find((k) => k.kid === kid);

    if (!key) {
      throw new UnauthorizedException("Invalid token: key not found");
    }

    return jose.importJWK(key);
  }

  private validatePayload(payload: jose.JWTPayload): OidcTokenPayload {
    // Validate required standard claims (already verified by jwtVerify, but type-check here)
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new UnauthorizedException("Invalid token: missing sub");
    }
    if (!payload.iss || typeof payload.iss !== "string") {
      throw new UnauthorizedException("Invalid token: missing iss");
    }
    if (!payload.aud || (typeof payload.aud !== "string" && !Array.isArray(payload.aud))) {
      throw new UnauthorizedException("Invalid token: missing aud");
    }
    if (!payload.exp || typeof payload.exp !== "number") {
      throw new UnauthorizedException("Invalid token: missing exp");
    }
    if (!payload.iat || typeof payload.iat !== "number") {
      throw new UnauthorizedException("Invalid token: missing iat");
    }

    // Validate custom claims
    if (!payload.team_id || typeof payload.team_id !== "string") {
      throw new UnauthorizedException("Invalid token: missing team_id");
    }
    if (!payload.roles || !Array.isArray(payload.roles) || !payload.roles.every((role) => typeof role === "string")) {
      throw new UnauthorizedException("Invalid token: missing or invalid roles");
    }
    if (!payload.scope || typeof payload.scope !== "string") {
      throw new UnauthorizedException("Invalid token: missing scope");
    }

    // After validation, we can safely assert types
    return {
      sub: payload.sub,
      iss: payload.iss,
      aud: Array.isArray(payload.aud) ? payload.aud[0] : payload.aud,
      exp: payload.exp,
      iat: payload.iat,
      jti: typeof payload.jti === "string" ? payload.jti : undefined,
      team_id: payload.team_id,
      roles: payload.roles,
      scope: payload.scope,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
    };
  }
}

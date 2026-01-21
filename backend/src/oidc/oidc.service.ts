import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jose from "jose";
import { OidcAccessTokenPayloadSchema, type OidcAccessTokenPayload } from "./interfaces/oidc.interface";

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

  async validateToken(token: string): Promise<OidcAccessTokenPayload> {
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
      // Preserve original error context for better debugging
      throw new UnauthorizedException(
        `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
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

    const jwks = await this.fetchJwksWithExponentialBackoff(this.jwksUrl);
    this.cachedJwks = jwks;
    this.cacheExpiry = now + this.CACHE_DURATION;

    const key = jwks.keys.find((k) => k.kid === kid);

    if (!key) {
      throw new UnauthorizedException("Invalid token: key not found");
    }

    return jose.importJWK(key);
  }

  private validatePayload(payload: jose.JWTPayload): OidcAccessTokenPayload {
    const result = OidcAccessTokenPayloadSchema.safeParse(payload);

    if (!result.success) {
      const errorMessage = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new UnauthorizedException(`Invalid token: ${errorMessage}`);
    }

    return result.data;
  }

  private async fetchJwksWithExponentialBackoff(
    url: string,
    maxRetries = 3,
    baseDelayMs = 500,
    timeoutMs = 5000,
  ): Promise<JWKSResponse> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId); // Clear timeout if request succeeds

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return (await response.json()) as JWKSResponse;
      } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error

        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (isLastAttempt) {
          throw new UnauthorizedException(`Failed to fetch JWKS after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Exponential backoff: delay = baseDelay * 2^(attempt-1)
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new UnauthorizedException("Unexpected error in JWKS fetch retry");
  }
}

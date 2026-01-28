import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { retryWithBackoff, throwOnAxiosError } from "../common/http.operators";
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
  private jwksFetchPromise: Promise<JWKSResponse> | null; // Cache the fetch promise
  private readonly CACHE_DURATION = 300000;
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.jwksUrl = this.configService.getOrThrow<string>("AUTHENTIK_JWKS_URL");
    this.issuer = this.configService.getOrThrow<string>("AUTHENTIK_ISSUER");
    this.audience = this.configService.getOrThrow<string>("AUTHENTIK_AUDIENCE");
    this.cacheExpiry = 0;
    this.cachedJwks = null;
    this.jwksFetchPromise = null;
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

    // If a fetch is already in progress, wait for it
    if (this.jwksFetchPromise) {
      const jwks = await this.jwksFetchPromise;
      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("Invalid token: key not found");
      }
      return jose.importJWK(key);
    }

    // Start a new fetch and cache the promise
    this.jwksFetchPromise = this.fetchJwksWithExponentialBackoff(this.jwksUrl);

    try {
      const jwks = await this.jwksFetchPromise;
      this.cachedJwks = jwks;
      this.cacheExpiry = now + this.CACHE_DURATION;
      this.jwksFetchPromise = null; // Clear the promise after success

      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("Invalid token: key not found");
      }
      return jose.importJWK(key);
    } catch (error) {
      this.jwksFetchPromise = null; // Clear on error too
      throw error;
    }
  }

  private validatePayload(payload: jose.JWTPayload): OidcAccessTokenPayload {
    const result = OidcAccessTokenPayloadSchema.safeParse(payload);

    if (!result.success) {
      const errorMessage = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new UnauthorizedException(`Invalid token: ${errorMessage}`);
    }

    return result.data;
  }

  private async fetchJwksWithExponentialBackoff(url: string): Promise<JWKSResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<JWKSResponse>(url)
        .pipe(retryWithBackoff(this.MAX_RETRIES), throwOnAxiosError(UnauthorizedException, "Failed to fetch JWKS")),
    );
    return data;
  }
}

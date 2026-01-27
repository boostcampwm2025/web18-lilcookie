import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, catchError, retry, timer } from "rxjs";
import { AxiosError } from "axios";
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
  private jwksFetchPromise: Promise<JWKSResponse> | null; // 현재 진행 중인 JWKS fetch 프로미스
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

  /**
   * 토큰 검증 및 페이로드 반환
   * @param token OIDC 액세스 토큰
   * @returns 검증된 토큰의 페이로드
   */
  async validateToken(token: string): Promise<OidcAccessTokenPayload> {
    try {
      const header = jose.decodeProtectedHeader(token);
      if (!header.kid) {
        throw new UnauthorizedException("유효하지 않은 토큰: kid가 없습니다.");
      }

      const publicKey = await this.getPublicKey(header.kid);

      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return this.validatePayload(payload);
    } catch (error) {
      if (error instanceof jose.errors.JOSEError) {
        throw new UnauthorizedException("유효하지 않은 토큰 서명입니다.");
      }
      // 기타 오류 처리
      throw new UnauthorizedException(`토큰 검증 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 캐시된 JWKS에서 공개 키를 가져오거나, 없으면 원격에서 가져옴
   * @param kid 키 ID
   * @returns 공개 키
   */
  private async getPublicKey(kid: string): Promise<CryptoKey | Uint8Array> {
    const now = Date.now();

    if (this.cachedJwks && now < this.cacheExpiry) {
      const key = this.cachedJwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("Invalid token: key not found");
      }

      return jose.importJWK(key);
    }

    // JWKS가 캐시되어 있지 않거나 만료된 경우
    if (this.jwksFetchPromise) {
      const jwks = await this.jwksFetchPromise;
      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }

      return jose.importJWK(key);
    }

    // 새로운 JWKS fetch 시작
    this.jwksFetchPromise = this.fetchJwksWithExponentialBackoff(this.jwksUrl);

    try {
      const jwks = await this.jwksFetchPromise;
      this.cachedJwks = jwks;
      this.cacheExpiry = now + this.CACHE_DURATION;
      this.jwksFetchPromise = null; // 성공 후 프로미스 초기화

      const key = jwks.keys.find((k) => k.kid === kid);
      if (!key) {
        throw new UnauthorizedException("유효하지 않은 토큰: 키를 찾을 수 없습니다.");
      }

      return jose.importJWK(key);
    } catch (error) {
      this.jwksFetchPromise = null; // 오류 발생 시에도 프로미스 초기화
      throw error;
    }
  }

  /**
   * 토큰 페이로드 유효성 검사
   * @param payload 토큰 페이로드
   * @returns 유효한 OidcAccessTokenPayload
   */
  private validatePayload(payload: jose.JWTPayload): OidcAccessTokenPayload {
    const result = OidcAccessTokenPayloadSchema.safeParse(payload);
    if (!result.success) {
      const errorMessage = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new UnauthorizedException(`유효하지 않은 토큰 페이로드: ${errorMessage}`);
    }

    return result.data;
  }

  /**
   * JWKS를 지수 백오프로 가져오기
   * @param url JWKS URL
   * @returns JWKS 응답
   */
  private async fetchJwksWithExponentialBackoff(url: string): Promise<JWKSResponse> {
    const { data } = await firstValueFrom(
      this.httpService.get<JWKSResponse>(url).pipe(
        retry({
          count: this.MAX_RETRIES,
          delay: (error, retryCount) => {
            const delayMs = 500 * Math.pow(2, retryCount - 1);
            return timer(delayMs);
          },
        }),
        catchError((error: AxiosError) => {
          const errorMessage = error.message;
          throw new UnauthorizedException(
            `JWKS를 ${this.MAX_RETRIES}회 시도했으나 가져오지 못했습니다: ${errorMessage}`,
          );
        }),
      ),
    );
    return data;
  }
}

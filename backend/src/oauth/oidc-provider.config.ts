import { ConfigService } from "@nestjs/config";
import { Configuration } from "oidc-provider";
import { PrismaService } from "../database/prisma.service";

// 개발용 기본 JWKS (환경변수 없을 때 사용)
const DEV_JWKS = {
  keys: [
    {
      kty: "RSA",
      kid: "dev-key-1",
      use: "sig",
      alg: "RS256",
      n: "yLFttP7EADp0QEEymftn5vF_Kx7htJ0BdrVnv-I7KSbtdao70yiOY4BICdpZraMfZF8SKpBodcr-qgha6WsML17qRBAO3FbU3BA3nghrVkttpsJVYWLLq23uleVr9u8o9ooGfUtpvkzx1dAIqHfTQhCxZqapo4UAG3R5QY_z5qjRtnP9NzeMNcY_IUPvSieqv8qmJNFEx9iCvyk1yVQBaSpYxRQvg4f71tb0pGgaQ5aT5nn6rkLlL932n0JyFKs8u9QREDOctzrZTePu2-cGSoFdKzCgmWzoR1Q9FoaIE1AV6igCXmLfCib2n69WSlnCfAq2zuWpxqWNSnzQhUjYiQ",
      e: "AQAB",
      d: "AWCUVehkrHK6PwGjiQJ8a02Pd5qJ5n0oWCn1CRBSoxzpBsRxDikqVvz3oZetw18J9VygqYmdqedHeZ--jfkF16JhXa-1hmYTJmJ3Gz7IC8rPORR-1QECUE4cE8vEAqkQAScf1cbJdjydcT_w-0T9PmgSa5ertNtSDZ4uQdiszhGp5mJGMmJ0_qScP51EiZEwzzlTR4nNgU0lvy7oloMbDyQcXXUDo7kDGR9sinSZ4orIpc0c6mv7nbkUbXp5txE7LvAiscHu88-flJHRgl9W193blDUg5aAbNP2Ci9vfuFMxq_aUVGT4bAlLWmBVqSyzWmxNOiX40azbHGmw7qkW4Q",
      p: "8xuutx_nLanhCPZq9s-gIbyCRiIvlHqNnHIYmUOUYo2lYTxkkdoaWeGGzUnPwjDGsjwk0Kemq2U5DZFL0SgJqRKLOGf4Y-IzxEWHySVt6E8Llmq-XY784oC8NnApIKwi-r0MqSUCQsjQoi8NoTeHFGO45juyBUBv_yZL6oi9Odk",
      q: "01XwoTc-ghCaR9O_-0a-iKJw7dHq8vth7M0MMCJP35s-qqcQnD8K-kAmpqPMqNGvL72JjMNcBrsFlunfwBBhHSuX4_W2eks8pjZhgobjb4vIDrgTJSe_8u_hSlFQaNrqgtMHi1Q-a5WZRkFH5OGqZJjfLT3ZlaQim8qnYZalNjE",
      dp: "tfjirvCSevvOFoddSaHgm2Afo5-zPdD-bzx4bUDIsXyVblNmdEZtsxm9bazydslL8d5TMFxNxb3fFujLd6Qglw3qaC5rH1kSprflDAuYWWvRoKYGGMIPSPxT5evO3UX8aPNZpsKtDpCCmuPdr--AjSKYJL5KYuP48WQZL1VrTwE",
      dq: "HPUlp7F-KyxDN5xYLgIfkXFQsAWXf_vaCyx9gwrwjt8i0xdZO0-YHXo00ZiYLnms24nJEzSho3p05ZzeP97-r5SNl3rPqiotAUlqSwxYlaw9mWa3mNu9fXhJEnnZ3sRAZfSsj_bXJr605d-EDmStiGM6EWTsL4jyBQ7bqI-Py8E",
      qi: "M7MONAECkSKasCNm1gLBhI9DTkBMWa6MqtmLazqCliwUpZdUy08smlF2vRAoL7NzWWAUc9ENMHvpn8IV_eaQIxQ6EP7AoJWoMNyRMwmIK_Ro6TNYFqcFqvHqfIdFr5sA8Kda2_ZNTQMhgGr9qz8I1JayJz_uFoHOSITDigwtOo8",
    },
  ],
};

export function getOidcConfig(prisma: PrismaService, config: ConfigService): Configuration {
  // 환경변수에서 값 읽기 (없으면 기본값 사용)
  const resourceServer = config.get<string>("OIDC_RESOURCE_SERVER") || "http://localhost:3000";
  const redirectUris = config.get<string>("OIDC_REDIRECT_URIS")?.split(",") || [
    "http://localhost:3000/auth/callback",
    "https://localhost:3000/auth/callback",
  ];
  const cookieKeys = config.get<string>("OIDC_COOKIE_KEYS")?.split(",") || ["dev-secret-key-1", "dev-secret-key-2"];
  const jwksString = config.get<string>("OIDC_JWKS");
  const jwks = jwksString ? (JSON.parse(jwksString) as typeof DEV_JWKS) : DEV_JWKS;
  return {
    /**
     * 클라이언트 설정
     * clients: 초기 클라이언트 목록
     * 나중에 DB에서 동적으로 로드하거나 API로 등록할 수 있지만,
     * 테스트를 위해 하드코딩된 클라이언트를 하나 추가합니다
     *
     * 실제 운영 시에는 이 부분을 빈 배열로 두고,
     * DB에서 클라이언트를 동적으로 로드하거나 API로 등록합니다.
     */
    clients: [
      {
        client_id: "stash-extension-dev",
        client_name: "Stash Browser Extension (Development)",
        // client_secret는 undefined (Public Client - 익스텐션은 secret 저장 불가)
        redirect_uris: redirectUris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none", // Public Client는 인증 없음
        application_type: "web",
      },
    ],

    // 지원하는 기능
    features: {
      /**
       * devInteractions: 개발용 로그인/동의 화면
       * 기본 제공되는 간단한 UI를 사용합니다.
       * 나중에 커스텀 UI로 교체하면 false로 바꾸기
       */
      devInteractions: {
        enabled: true,
      },

      /**
       * resourceIndicators: Resource Server 식별
       * 여러 API 서버가 있을 때 어떤 서버에 접근할지 지정합니다.
       * 우리는 하나의 백엔드만 있으므로 간단하게 설정합니다.
       */
      resourceIndicators: {
        enabled: true,
        defaultResource: () => resourceServer,
        getResourceServerInfo: () => ({
          scope: "openid profile email links:read links:write folders:read folders:write",
          audience: resourceServer,
        }),
      },

      /**
       * Registration: Dynamic Client Registration
       * 클라이언트를 API로 동적 등록할 수 있게 합니다.
       */
      registration: {
        enabled: false,
      },

      /**
       * RegistrationManagement: 등록된 클라이언트 관리
       * 클라이언트 수정/삭제 기능입니다.
       */
      registrationManagement: {
        enabled: false,
      },

      /**
       * revocation: Token Revocation
       * 토큰 취소 엔드포인트를 제공합니다.
       * /oauth/revoke 엔드포인트가 자동으로 생성됩니다.
       */
      revocation: {
        enabled: true,
      },
    },

    /**
     * ttl: Token Time-To-Live (만료 시간)
     * 각 토큰/코드의 수명을 초 단위로 설정합니다.
     */
    ttl: {
      AccessToken: 60 * 60, // 1시간 (3600초)
      AuthorizationCode: 10 * 60, // 10분 (600초)
      RefreshToken: 30 * 24 * 60 * 60, // 30일 (2592000초)
      Grant: 365 * 24 * 60 * 60, // 1년 (Grant는 사용자 동의 기록이므로 길게)
      IdToken: 60 * 60, // 1시간
      Interaction: 60 * 60, // 1시간 (로그인 세션)
      Session: 14 * 24 * 60 * 60, // 14일 (브라우저 세션)
    },

    /**
     * jwks: JSON Web Key Set - JWT 서명에 사용할 RSA 키
     *
     * JWT 토큰 발급 시 이 키로 서명하고, 검증 시 공개키로 확인함
     * - 서명할 때: 개인키(d, p, q, dp, dq, qi) 사용
     * - 검증할 때: 공개키(n, e) 사용
     *
     * 운영 환경에서는 반드시 환경 변수나 KMS에서 로드해야 함!
     * 아래는 개발용 키 (절대 운영에서 사용 금지)
     *
     * 새 키 생성 방법:
     * ```bash
     * node -e "
     * const { generateKeyPairSync } = require('crypto');
     * const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
     * const jwk = privateKey.export({ format: 'jwk' });
     * jwk.kid = 'key-1'; jwk.use = 'sig'; jwk.alg = 'RS256';
     * console.log(JSON.stringify(jwk, null, 2));
     * "
     * ```
     */
    jwks,

    /**
     * claims: OpenID Connect에서 제공할 사용자 정보 항목
     * 표준 클레임과 커스텀 클레임을 정의합니다.
     */
    claims: {
      openid: ["sub"], // subject (사용자 고유 ID)
      profile: ["nickname"], // 프로필 정보
      email: ["email"], // 이메일
    },

    /**
     * findAccount: 사용자 정보 조회 함수
     * oidc-provider가 사용자 정보를 요청할 때 이 함수를 호출합니다.
     * /oauth/userinfo 엔드포인트에서 사용됩니다.
     *
     * @param ctx - Koa context
     * @param sub - subject (사용자 ID - uuid)
     * @returns accountId와 claims() 메서드를 가진 객체
     */
    findAccount: async (_ctx, sub) => {
      // sub = uuid 값으로 들어옴
      const user = await prisma.user.findUnique({
        where: { uuid: sub }, // uuid로 조회
      });

      if (!user) return undefined;

      return {
        accountId: sub,
        claims() {
          return {
            sub,
            nickname: user.nickname,
            email: user.email,
          };
        },
      };
    },

    /**
     * interactions: 사용자 인증 및 동의 처리
     * 로그인 화면, 동의 화면으로 리다이렉트할 URL을 지정합니다.
     *
     * devInteractions가 활성화되어 있으면 이 설정은 무시되고,
     * oidc-provider가 제공하는 기본 UI를 사용합니다.
     *
     * 커스텀 UI를 만들 때 이 부분을 수정합니다.
     */
    // interactions: {
    //   url(ctx, interaction) {
    //     return `/oauth/interaction/${interaction.uid}`;
    //   },
    // },

    /**
     * cookies: 세션 쿠키 설정
     * oidc-provider가 브라우저에 세션 쿠키를 저장할 때 사용합니다.
     */
    cookies: {
      keys: cookieKeys,
    },

    /**
     * pkce: PKCE 요구 사항
     * Public Client (익스텐션 등)는 PKCE를 필수로 사용해야 합니다.
     * Authorization Code 탈취 공격을 방지합니다.
     */
    pkce: {
      required: (_ctx, client) => {
        // Public Client는 PKCE 필수
        return client.tokenEndpointAuthMethod === "none";
      },
    },
  };
}

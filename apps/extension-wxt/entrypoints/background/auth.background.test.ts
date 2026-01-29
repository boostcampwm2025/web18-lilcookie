import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing";
import {
  AuthTokensSchema,
  JwtBasicPayloadSchema,
  StoredAuthTokensSchema,
} from "../../schemas/auth.schema";

describe("Auth Schemas", () => {
  describe("AuthTokensSchema", () => {
    it("should validate valid auth tokens", () => {
      const validTokens = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refresh_token: "refresh_token_value",
        expires_at: Date.now() + 3600000,
      };

      const result = AuthTokensSchema.safeParse(validTokens);
      expect(result.success).toBe(true);
    });

    it("should reject tokens with missing fields", () => {
      const invalidTokens = {
        access_token: "token",
      };

      const result = AuthTokensSchema.safeParse(invalidTokens);
      expect(result.success).toBe(false);
    });
  });

  describe("JwtBasicPayloadSchema", () => {
    it("should validate JWT payload with sub", () => {
      const payload = {
        sub: "user-uuid-123",
        nickname: "TestUser",
        iat: 1234567890,
        exp: 1234567890,
      };

      const result = JwtBasicPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sub).toBe("user-uuid-123");
        expect(result.data.nickname).toBe("TestUser");
      }
    });

    it("should allow payload without nickname", () => {
      const payload = {
        sub: "user-uuid-123",
      };

      const result = JwtBasicPayloadSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject payload without sub", () => {
      const payload = {
        nickname: "TestUser",
      };

      const result = JwtBasicPayloadSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});

describe("Chrome Storage Integration", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("should store and retrieve auth tokens", async () => {
    const tokens = {
      access_token: "test_access_token",
      refresh_token: "test_refresh_token",
      expires_at: Date.now() + 3600000,
    };

    await chrome.storage.local.set({ auth_tokens: tokens });
    const storage = await chrome.storage.local.get("auth_tokens");

    const result = StoredAuthTokensSchema.safeParse(storage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auth_tokens?.access_token).toBe("test_access_token");
    }
  });

  it("should handle empty storage gracefully", async () => {
    const storage = await chrome.storage.local.get("auth_tokens");

    const result = StoredAuthTokensSchema.safeParse(storage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auth_tokens).toBeUndefined();
    }
  });
});

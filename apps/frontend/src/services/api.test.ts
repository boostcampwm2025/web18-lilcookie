import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import MockAdapter from "axios-mock-adapter";
import type { TokenResponse } from "./authentikAuth";

vi.mock("./authentikAuth", () => ({
  getStoredAccessToken: vi.fn(() => "old-token"),
  refreshAccessToken: vi.fn(),
  clearTokens: vi.fn(),
}));

import api from "./api";
import {
  getStoredAccessToken,
  refreshAccessToken,
  clearTokens,
} from "./authentikAuth";

const mock = new MockAdapter(api, { delayResponse: 10 });

const mockedGetStoredAccessToken = getStoredAccessToken as Mock;
const mockedRefreshAccessToken = refreshAccessToken as Mock;

beforeEach(() => {
  mock.reset();
  vi.clearAllMocks();
  mockedGetStoredAccessToken.mockReturnValue("old-token");

  Object.defineProperty(window, "location", {
    writable: true,
    value: { pathname: "/dashboard", href: "" },
  });
});

describe("401 token refresh", () => {
  it("should refresh access token and retry on 401", async () => {
    const refreshedTokens: TokenResponse = {
      access_token: "new-token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid",
    };
    mockedRefreshAccessToken.mockResolvedValueOnce(refreshedTokens);

    mock.onGet("/test").replyOnce(401).onGet("/test").replyOnce(200, { ok: true });

    const response = await api.get("/test");

    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(response.data).toEqual({ ok: true });
  });

  it("should queue requests while refresh is in progress", async () => {
    let resolveRefresh!: (value: TokenResponse) => void;
    const refreshPromise = new Promise<TokenResponse>((resolve) => {
      resolveRefresh = resolve;
    });
    mockedRefreshAccessToken.mockReturnValue(refreshPromise);

    let callCount = 0;
    mock.onGet("/test").reply(() => {
      callCount++;
      if (callCount <= 2) return [401];
      return [200, { ok: true }];
    });

    const firstRequest = api.get("/test");
    const secondRequest = api.get("/test");

    // Flush microtasks so both interceptors have fired
    await vi.waitFor(() => expect(callCount).toBe(2));

    resolveRefresh({
      access_token: "new-token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid",
    });

    const [firstResponse, secondResponse] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(firstResponse.data).toEqual({ ok: true });
    expect(secondResponse.data).toEqual({ ok: true });
  });

  it("should redirect to login when refresh fails", async () => {
    mockedRefreshAccessToken.mockRejectedValueOnce(new Error("refresh failed"));

    mock.onGet("/test").replyOnce(401);

    await expect(api.get("/test")).rejects.toThrow("refresh failed");
    expect(clearTokens).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });
});

describe("axios-retry transient failures", () => {
  it("should retry and succeed on second attempt for 500", async () => {
    mock
      .onGet("/flaky")
      .replyOnce(500)
      .onGet("/flaky")
      .replyOnce(200, { recovered: true });

    const response = await api.get("/flaky");
    expect(response.data).toEqual({ recovered: true });
  });

  it("should fail after exhausting all retries", async () => {
    mock.onGet("/down").reply(500);

    await expect(api.get("/down")).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  it("should wait longer between retries (exponential backoff)", async () => {
    const timestamps: number[] = [];

    mock.onGet("/slow").reply(() => {
      timestamps.push(Date.now());
      if (timestamps.length <= 3) return [500];
      return [200, { ok: true }];
    });

    await api.get("/slow");

    expect(timestamps.length).toBe(4);
    const firstGap = timestamps[1] - timestamps[0];
    const secondGap = timestamps[2] - timestamps[1];
    const thirdGap = timestamps[3] - timestamps[2];
    expect(secondGap).toBeGreaterThan(firstGap);
    expect(thirdGap).toBeGreaterThan(secondGap);
  });
});

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { fakeBrowser } from "wxt/testing";

import { StoredAuthTokensSchema } from "../../schemas/auth.schema";

vi.mock("./auth.background", () => ({
  getAuthState: vi.fn(),
  logout: vi.fn(),
  StoredAuthTokensSchema,
}));

import api from "./api";
import { getAuthState, logout } from "./auth.background";

const mock = new MockAdapter(api, { delayResponse: 10 });

const mockedGetAuthState = getAuthState as Mock;

const setStorageTokens = async (
  overrides?: Partial<{ refresh_token: string }>,
) => {
  await chrome.storage.local.set({
    auth_tokens: {
      access_token: "access",
      refresh_token: overrides?.refresh_token ?? "refresh",
      expires_at: Date.now() + 3600000,
    },
  });
};

beforeEach(async () => {
  mock.reset();
  vi.clearAllMocks();
  fakeBrowser.reset();
  await setStorageTokens();
});

describe("API client auth flow", () => {
  it("adds Authorization header from auth state", async () => {
    mockedGetAuthState.mockResolvedValueOnce({
      isLoggedIn: true,
      accessToken: "header-token",
    });

    mock.onGet("/auth-header").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer header-token");
      return [200, { ok: true }];
    });

    const response = await api.get("/auth-header");
    expect(response.data).toEqual({ ok: true });
  });

  it("refreshes token and retries on 401", async () => {
    let callCount = 0;
    mockedGetAuthState.mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        return { isLoggedIn: true, accessToken: "old-token" };
      }
      return { isLoggedIn: true, accessToken: "new-token" };
    });

    mock
      .onGet("/test")
      .replyOnce(401)
      .onGet("/test")
      .replyOnce(200, { ok: true });

    const response = await api.get("/test");

    expect(mockedGetAuthState).toHaveBeenCalled();
    expect(response.data).toEqual({ ok: true });
  });

  it("queues requests while refresh is in progress", async () => {
    let resolveAuthState!: (value: {
      isLoggedIn: boolean;
      accessToken?: string;
    }) => void;
    const refreshPromise = new Promise<{
      isLoggedIn: boolean;
      accessToken?: string;
    }>((resolve) => {
      resolveAuthState = resolve;
    });

    const authStateQueue: Array<
      | { isLoggedIn: boolean; accessToken?: string }
      | Promise<{ isLoggedIn: boolean; accessToken?: string }>
    > = [
      { isLoggedIn: true, accessToken: "old-token" },
      { isLoggedIn: true, accessToken: "old-token" },
      refreshPromise,
      { isLoggedIn: true, accessToken: "new-token" },
      { isLoggedIn: true, accessToken: "new-token" },
    ];

    mockedGetAuthState.mockImplementation(async () => {
      const next = authStateQueue.shift();
      if (!next) return { isLoggedIn: false };
      return next instanceof Promise ? await next : next;
    });

    let callCount = 0;
    mock.onGet("/test").reply(() => {
      callCount += 1;
      if (callCount <= 2) return [401];
      return [200, { ok: true }];
    });

    const firstRequest = api.get("/test");
    const secondRequest = api.get("/test");

    await vi.waitFor(() => expect(callCount).toBe(2));

    resolveAuthState({ isLoggedIn: true, accessToken: "new-token" });

    const [firstResponse, secondResponse] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(firstResponse.data).toEqual({ ok: true });
    expect(secondResponse.data).toEqual({ ok: true });
  });

  it("logs out when refresh fails", async () => {
    mockedGetAuthState
      .mockResolvedValueOnce({ isLoggedIn: true, accessToken: "old-token" })
      .mockResolvedValueOnce({ isLoggedIn: false });

    mock.onGet("/test").replyOnce(401);

    await expect(api.get("/test")).rejects.toThrow("Token refresh failed");
    expect(logout).toHaveBeenCalledOnce();
  });

  it("logs out when refresh token is missing", async () => {
    await setStorageTokens({ refresh_token: "" });
    mockedGetAuthState.mockResolvedValueOnce({
      isLoggedIn: true,
      accessToken: "old-token",
    });

    mock.onGet("/test").replyOnce(401);

    await expect(api.get("/test")).rejects.toThrow("No refresh token");
    expect(logout).toHaveBeenCalledOnce();
  });
});

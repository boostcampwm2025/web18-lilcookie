import axios, { type InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { getAuthState, logout, type AuthTokens } from "./auth.background";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
});

let isRefreshing = false;
const tokenRefreshRetriedRequests = new WeakSet<InternalAxiosRequestConfig>();
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  const authState = await getAuthState();
  if (authState.accessToken) {
    config.headers.Authorization = `Bearer ${authState.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: InternalAxiosRequestConfig | undefined =
      error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !tokenRefreshRetriedRequests.has(originalRequest)
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      tokenRefreshRetriedRequests.add(originalRequest);
      isRefreshing = true;

      try {
        const { auth_tokens } = (await chrome.storage.local.get(
          "auth_tokens",
        )) as { auth_tokens?: AuthTokens };

        if (!auth_tokens?.refresh_token) {
          throw new Error("No refresh token");
        }

        const authState = await getAuthState();
        isRefreshing = false;

        if (authState.isLoggedIn && authState.accessToken) {
          processQueue(null, authState.accessToken);
          originalRequest.headers.Authorization = `Bearer ${authState.accessToken}`;
          return api(originalRequest);
        }

        throw new Error("Token refresh failed");
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        await logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

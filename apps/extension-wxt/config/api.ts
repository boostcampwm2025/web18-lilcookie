export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,

  retry: {
    default: { maxRetries: 3, delayFactor: 1000 },
    slow: { maxRetries: 5, delayFactor: 2000 },
    ai: { maxRetries: 0, delayFactor: 0 },
  },
};

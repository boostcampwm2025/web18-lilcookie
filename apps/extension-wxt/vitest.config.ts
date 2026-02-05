import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

export default defineConfig({
  test: {
    mockReset: true,
    restoreMocks: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
  },
  plugins: [WxtVitest()],
});

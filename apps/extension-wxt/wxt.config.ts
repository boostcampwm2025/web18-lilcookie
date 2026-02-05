import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3, // Chrome와 Firefox 모두 MV3로 빌드
  dev: {
    server: {
      port: 3001, // 백엔드(3000)와 충돌 방지
    },
  },
  manifest: ({ mode, browser }) => ({
    name: "TeamStash",
    version: "1.1.3",
    description: "URL을 간편히 저장하고 팀과 공유하는 확장프로그램",
    permissions: [
      "activeTab",
      "tabs",
      "storage",
      "alarms",
      "notifications",
      "scripting",
      "identity",
    ],
    host_permissions: [],
    icons: {
      "16": "images/icon-16.png",
      "32": "images/icon-32.png",
      "48": "images/icon-48.png",
      "128": "images/icon-128.png",
    },
    browser_specific_settings: {
      gecko: {
        id: "lilcookie.team.stash@gmail.com",
        data_collection_permissions: {
          required: [
            "personallyIdentifyingInfo",
            "authenticationInfo",
            "browsingActivity",
            "websiteContent",
            "websiteActivity",
          ],
        },
      },
    },
    ...(mode === "development" &&
      browser === "chrome" && {
        key: import.meta.env.CHROME_EXTENSION_KEY,
      }),
  }),
});

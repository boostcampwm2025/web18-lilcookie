import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifestVersion: 3, // Chrome와 Firefox 모두 MV3로 빌드
  manifest: {
    name: "TeamStash",
    version: "1.0",
    description: "한 번의 클릭으로 URL을 저장하는 확장 프로그램",
    permissions: [
      "activeTab",
      "tabs",
      "storage",
      "alarms",
      "notifications",
      "scripting",
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
        id: "teamstash@boostcamp.connect",
      },
    },
  },
});

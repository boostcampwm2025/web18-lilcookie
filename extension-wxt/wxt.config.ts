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
        id: "teamstash@boostcamp.connect",
      },
    },
    // TODO: 환경 변수로 분리
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArh/GtehbcWQ1KDBevXfK2FDcuVVvT9mJ5JcSdFyHEC9yM/MR/HGll8qGQ6s8bWXL4s0ybAkYcLqZWe/cwvpRS7PcXBE/bsqgvD81so++Sm4Q6HCAXc9FD8J1ofAugyUsyZC0dSWg33nYS0HeyBHPDJF2AqGjD1sjwvY04+ZxFWvu44m/mugEVtu7B5rErr/JfzyaCrJ5HzAnbdxUISNs8kveENaIh+7Hvs1CklTOrAkCBc9678NVXwSTDSZtiit4QgRDQU9H9pDgGegKVXxk4mtl7GkCMqIY0RAdd0kXTTMYBKmYvj0488OnMHTCyMrft8eA0qguXFaG0Q+9EvsagQIDAQAB",
  },
});

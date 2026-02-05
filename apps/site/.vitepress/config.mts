import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TeamStash",
  description: "팀의 지식을 한 곳에 모으고 활용하세요.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      {
        text: "🔌 Integrations & API",
        items: [
          {
            text: "🚀 연동 시작하기: OAuth2 앱 발급",
            link: "/integrations-and-api/OAuth2-App-Registration/",
          },
          {
            text: "🔗 n8n 크레덴셜 등록 가이드",
            link: "/integrations-and-api/n8n-Integration-Guide/",
          },
          {
            text: "📚 API Reference",
            link: "/integrations-and-api/API-Reference/",
          },
        ],
      },
      {
        text: "💡 n8n Cookbook (활용 예제)",
        items: [
          {
            text: "🛠️ [Lv.0] 공통: 슬랙 봇 생성 및 n8n 연결",
            link: "/n8n-cookbook/Example-Slack-Base-Setup/",
          },
          {
            text: "🔔 [Lv.1] 링크 저장 시 슬랙 & 메일 실시간 알림",
            link: "/n8n-cookbook/Example-Notification/",
          },
          {
            text: "🤖 [Lv.2] 슬랙 슬래시 명령어로 상세 저장 봇 만들기",
            link: "/n8n-cookbook/Example-Slack-Save-Bot/",
          },
        ],
      },
    ],

    sidebar: [],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/boostcampwm2025/web18-lilcookie",
      },
    ],
  },
  vite: {
    server: {
      port: 5174,
    },
  },
});

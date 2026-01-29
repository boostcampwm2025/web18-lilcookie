import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TeamStash",
  description: "팀의 링크를 한 곳에 모으고 AI로 요약하는 브라우저 확장 프로그램",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
    ],

    sidebar: [],

    socialLinks: [
      { icon: "github", link: "https://github.com/boostcampwm-2024/web18-lilcookie" },
    ],
  },
  vite: {
    server: {
      port: 5174,
    },
  },
});

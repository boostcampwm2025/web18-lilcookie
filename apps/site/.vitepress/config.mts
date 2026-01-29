import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TeamStash",
  description: "팀의 지식을 한 곳에 모으고 활용하세요.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
    ],

    sidebar: [],

    socialLinks: [
      { icon: "github", link: "https://github.com/boostcampwm2025/web18-lilcookie" },
    ],
  },
  vite: {
    server: {
      port: 5174,
    },
  },
});

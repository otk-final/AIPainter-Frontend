
import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/index/index" },
    { path: "/setting", component: "@/pages/setting/index" },
  ],
  npmClient: 'yarn',
  theme:{
    '@primary-color': "#6E4DF0",
    '@l-font-color': "rgba(255, 255, 255, 0.9)",
    '@m-font-color': "rgba(255, 255, 255, 0.8)",
    '@s-font-color': "rgba(255, 255, 255, 0.6)"
  }
});



import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/index/index" },
    { path: "/setting", component: "@/pages/setting/index" },
  ],
  npmClient: 'yarn',
  theme:{
    '@primary-color': "#6E4DF0",
    '@error-color': "#C03132",
    '@l-font-color': "rgba(255, 255, 255, 0.9)",
    '@m-font-color': "rgba(255, 255, 255, 0.8)",
    '@s-font-color': "rgba(255, 255, 255, 0.6)",
    '@xs-font-color': "rgba(255, 255, 255, 0.4)",
    '@bg-primary': "#1E1F22",
    '@bg-card': "#29292D",
    '@bg-modal': "#2B2D31",
    '@bg-btn': "#424242",
    "@bg-input": "#414246",
    "@line-color": "#2D2D2E"
  }
});



import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/index/index" },
    { path: "/setting", component: "@/pages/setting/index" },
    { path: "/create", component: "@/pages/create/index" },
    { path: "/imitate", component: "@/pages/imitate-mock/index" },
    { path: 'roleset', component: '@/pages/roleset/index'}
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
    "@bg-input": "#1B1B1C",
    "@line-color": "#2D2D2E",
    "@border-line-color": "#484848",
    "@font-primary-color": "#aa95ff"
  }
});


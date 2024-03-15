
import { defineConfig } from "umi";

export default defineConfig({
  jsMinifier: 'terser',
  cssMinifier: 'cssnano',
  routes: [
    { path: "/", component: "@/pages/index/index" },
    { path: "/setting", component: "@/pages/setting/index" },
    { path: "/story/:pid", component: "@/pages/story/index" },
    { path: "/imitate/:pid", component: "@/pages/imitate/index" },
    { path: "/roleset/:pid", component: "@/pages/roleset/index" },
    { path: "/draft", component: "@/pages/draft/index" }
  ],
  npmClient: 'yarn',
  theme: {
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
  },
  define: {
    "process.env.TENANT_ID": process.env.TENANT_ID,
    "process.env.APP_ID": process.env.APP_ID,
    "process.env.BAIDU_HOST": process.env.BAIDU_HOST,
    "process.env.BYTEDANCE_HOST": process.env.BYTEDANCE_HOST,
    "process.env.BYTEDANCE_APP_ID": process.env.BYTEDANCE_APP_ID,
    "process.env.OPENAI_HOST": process.env.OPENAI_HOST,
    "process.env.OPENAI_MODE": process.env.OPENAI_MODE,
    "process.env.OPENAI_ASSISTANT_ID": process.env.OPENAI_ASSISTANT_ID,
    "process.env.COMFYUI_HOST": process.env.COMFYUI_HOST,
    "process.env.AUTH_HOST": process.env.AUTH_HOST,
    "process.env.AUTH_CLIENT_BASIC": process.env.AUTH_CLIENT_BASIC,
  }
});


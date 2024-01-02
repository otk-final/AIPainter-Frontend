
import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "@/pages/index/index" },
    { path: "/setting", component: "@/pages/setting/index" },
  ],
  npmClient: 'yarn',
});


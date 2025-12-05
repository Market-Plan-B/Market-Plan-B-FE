import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".vue", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Yahoo Finance 프록시 (추가)
      "/yahoo-finance": {
        target: "https://query1.finance.yahoo.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/yahoo-finance/, "/v8/finance/chart"),
        secure: false,
      },
    },
  },
});

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
      "/yahoo-finance": {
        target: "https://query1.finance.yahoo.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/yahoo-finance/, "/v8/finance/chart"),
        secure: false,
      },
      // NOAA 태풍/허리케인 데이터
      "/noaa-tropical": {
        target: "https://mapservices.weather.noaa.gov",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/noaa-tropical/,
            "/tropical/rest/services/tropical/NHC_tropical_weather/MapServer"
          ),
        secure: false,
      },
    },
  },
});

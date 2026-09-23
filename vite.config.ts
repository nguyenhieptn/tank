import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/siquantank/",
  server: {
    host: "::",
    port: 8082,
    allowedHosts: ["demo.expsolution.io"],
    hmr: {
      overlay: false,
    },
    proxy: {
      "^/siquantank/api": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siquantank\/api/, "/api"),
      },
      "^/siquantank/uploads": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siquantank\/uploads/, "/uploads"),
      },
      "/api": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 8082,
    allowedHosts: ["demo.expsolution.io"],
    proxy: {
      "^/siquantank/api": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siquantank\/api/, "/api"),
      },
      "^/siquantank/uploads": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siquantank\/uploads/, "/uploads"),
      },
      "/api": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:8086",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));

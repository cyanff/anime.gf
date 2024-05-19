import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path, { resolve } from "path";

const isLocal = false;

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@shared": resolve("src/shared/")
      }
    },

    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/renderer/src"),
        "@shared": resolve("src/shared/"),
        "@platform": isLocal
          ? resolve("src/renderer/src/lib/platform/platform.ts")
          : resolve("../test-vite/platform/platform.ts")
      }
    },
    plugins: [react()]
  }
});

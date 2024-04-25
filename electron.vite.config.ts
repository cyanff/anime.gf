import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path, { resolve } from "path";

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
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared/")
      }
    },
    plugins: [react()]
  }
});

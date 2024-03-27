import path from "path";
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

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

// electron.vite.config.ts
import path from "path";
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var __electron_vite_injected_dirname = "/home/phan/src/anime.gf";
var electron_vite_config_default = defineConfig({
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
        "@": path.resolve(__electron_vite_injected_dirname, "./src/renderer/src"),
        "@renderer": resolve("src/renderer/src"),
        "@shared": resolve("src/shared/")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};

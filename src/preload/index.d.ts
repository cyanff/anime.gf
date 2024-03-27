import { ElectronAPI } from "@electron-toolkit/preload";
import { API } from "./index";

declare global {
  interface Window {
    api: API;
  }
}

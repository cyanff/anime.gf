import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Declare API types so that type checking works in the renderer process
export interface API {}

const api: API = {};

try {
  contextBridge.exposeInMainWorld("electron", electronAPI);
  contextBridge.exposeInMainWorld("api", api);
} catch (error) {
  console.error(error);
}

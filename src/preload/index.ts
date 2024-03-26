import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Declare API types so that type checking works in the renderer process
export interface API {}

const api = {
  sqlite: {
    run: (query: string, params: [] = []) => ipcRenderer.invoke("sqlite.run", query, params),
    all: (query: string, params: [] = []) => ipcRenderer.invoke("sqlite.all", query, params)
  }
};

try {
  contextBridge.exposeInMainWorld("api", api);
} catch (error) {
  console.error(error);
}

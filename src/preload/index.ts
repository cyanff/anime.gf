import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Declare API types so that type checking works in the renderer process
export interface API {
  getDDB: () => Promise<Object>;
  writeDDB: (ddb: Object) => Promise<void>;
}

const api: API = {
  getDDB: () => ipcRenderer.invoke("getDDB"),
  writeDDB: (ddb) => ipcRenderer.invoke("writeDDB", ddb)
};

try {
  contextBridge.exposeInMainWorld("electron", electronAPI);
  contextBridge.exposeInMainWorld("api", api);
} catch (error) {
  console.error(error);
}

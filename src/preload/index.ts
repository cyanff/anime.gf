import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// The preload script attaches arbitrary APIs to the window object, making them available in the renderer process.
// You could declare the types of these APIs here so typescript can check them when you're working in renderer/
export interface API {
  getDDB: () => Promise<Object>;
  writeDDB: (ddb: Object) => Promise<void>;
}

const api: API = {
  getDDB: () => ipcRenderer.invoke("getDDB"),
  writeDDB: (ddb) => ipcRenderer.invoke("writeDDB", ddb)
};

if (process.contextIsolated) {
  try {
    // TODO electronAPI looks a bit unsafe, look in to this later
    // https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

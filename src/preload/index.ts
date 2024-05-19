import { contextBridge, ipcRenderer } from "electron";

export const ELECTRON_TRPC_CHANNEL = "electron-trpc";
const exposeElectronTRPC = () => {
  const electronTRPC: any = {
    sendMessage: (operation) => ipcRenderer.send(ELECTRON_TRPC_CHANNEL, operation),
    onMessage: (callback) => ipcRenderer.on(ELECTRON_TRPC_CHANNEL, (_event, args) => callback(args))
  };
  contextBridge.exposeInMainWorld("electronTRPC", electronTRPC);
};

process.once("loaded", async () => {
  exposeElectronTRPC();
});

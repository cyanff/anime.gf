import { contextBridge, ipcRenderer } from "electron";
import { ipcHandlers } from "../main/lib/ipc";

export type API = DeepDelFirstArg<typeof ipcHandlers>;
type DelFirstArg<T> = T extends (arg1: any, ...args: infer P) => infer R ? (...args: P) => R : never;
type DeepDelFirstArg<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? DelFirstArg<T[K]> : DeepDelFirstArg<T[K]>;
};

declare global {
  interface Window {
    api: API;
  }
}

/**
 * Recursively create a proxy object that invokes IPC calls when methods are called.
 * The resulting object could be used from the renderer process like so:
 *
 * @example
 * window.api.sqlite.run("SELECT * FROM table");
 * window.api.blob.cards.get("cardDirName");
 */
const createAPIProxy = (handlers: any, prefix = ""): any => {
  const api: any = {};
  for (const key of Object.keys(handlers)) {
    const channel = prefix ? `${prefix}.${key}` : key;
    if (typeof handlers[key] === "function") {
      api[key] = (...args: any[]) => ipcRenderer.invoke(channel, ...args);
    } else {
      api[key] = createAPIProxy(handlers[key], channel);
    }
  }
  return api;
};

const api: API = createAPIProxy(ipcHandlers);
contextBridge.exposeInMainWorld("api", api);

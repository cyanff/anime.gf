import { contextBridge, ipcRenderer } from "electron";
import { Result } from "@shared/utils";
import { RunResult } from "../main/lib/store/sqlite";

// Declare API types so that type checking works in the renderer process
export interface API {
  sqlite: {
    run: (query: string, params?: any[]) => Promise<RunResult>;
    all: (query: string, params?: any[]) => Promise<unknown[]>;
    get: (query: string, params?: any[]) => Promise<unknown>;
  };
  blob: {
    cards: {
      get: (card: string) => Promise<Result<Buffer, Error>>;
    };
  };
}

const api: API = {
  sqlite: {
    run: (query, params = []) => ipcRenderer.invoke("sqlite.run", query, params),
    all: (query, params = []) => ipcRenderer.invoke("sqlite.all", query, params),
    get: (query, params = []) => ipcRenderer.invoke("sqlite.get", query, params)
  },
  blob: {
    cards: {
      get: (card: string) => ipcRenderer.invoke("blob.cards.get", card)
    }
  }
};

try {
  contextBridge.exposeInMainWorld("api", api);
} catch (error) {
  console.error(error);
}

import { contextBridge, ipcRenderer } from "electron";
import { Result } from "@shared/utils";

// Declare API types so that type checking works in the renderer process
export interface API {
  sqlite: {
    run: (query: string, params?: []) => Promise<any>;
    all: (query: string, params?: []) => Promise<unknown[]>;
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
    all: (query, params = []) => ipcRenderer.invoke("sqlite.all", query, params)
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

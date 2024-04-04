import { contextBridge, ipcRenderer } from "electron";
import { Result } from "@shared/utils";
import { RunResult } from "../main/lib/store/sqlite";
import { CardBundle } from "@shared/types";

// Expose API types to the renderer process
export interface API {
  sqlite: {
    run: (query: string, params?: any[]) => Promise<RunResult>;
    all: (query: string, params?: any[]) => Promise<unknown[]>;
    get: (query: string, params?: any[]) => Promise<unknown>;
  };
  blob: {
    cards: {
      get: (card: string) => Promise<Result<CardBundle, Error>>;
    };
  };
  secret: {
    get: (k: string) => Promise<Result<string, Error>>;
    set: (k: string, v: string) => Promise<Result<void, Error>>;
  };
  xfetch: {
    post: (url: string, body: Object, headers: Record<string, string>) => Promise<Result<any, Error>>;
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
      get: (card) => ipcRenderer.invoke("blob.cards.get", card)
    }
  },
  secret: {
    get: (k) => ipcRenderer.invoke("secret.get", k),
    set: (k, v) => ipcRenderer.invoke("secret.set", k, v)
  },
  xfetch: {
    post: (url, body, headers) => ipcRenderer.invoke("xfetch.post", url, body, headers)
  }
};

contextBridge.exposeInMainWorld("api", api);

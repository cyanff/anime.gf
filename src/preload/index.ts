import { contextBridge, ipcRenderer } from "electron";
import { Result } from "@shared/utils";
import { RunResult } from "../main/lib/store/sqlite";
import { CardBundle, PersonaBundleWithoutData, Settings } from "@shared/types";

// Expose API types to the renderer process
export interface API {
  sqlite: {
    run: (query: string, params?: any[]) => Promise<RunResult>;
    all: (query: string, params?: any[]) => Promise<unknown[]>;
    get: (query: string, params?: any[]) => Promise<unknown>;
    runAsTransaction: (queries: string[], params: any[][]) => Promise<void>;
  };
  blob: {
    cards: {
      get: (card: string) => Promise<Result<CardBundle, Error>>;
    };
    personas: {
      get: (persona: string) => Promise<Result<PersonaBundleWithoutData, Error>>;
    };
  };
  secret: {
    get: (k: string) => Promise<Result<string, Error>>;
    set: (k: string, v: string) => Promise<Result<void, Error>>;
  };
  setting: {
    get: () => Promise<Result<Settings, Error>>;
    set: (settings: any) => Promise<Result<void, Error>>;
  };
  xfetch: {
    post: (url: string, body: Object, headers: Record<string, string>) => Promise<Result<any, Error>>;
    get: (url: string, headers: Record<string, string>) => Promise<Result<any, Error>>;
  };
}

const api: API = {
  sqlite: {
    run: (query, params = []) => ipcRenderer.invoke("sqlite.run", query, params),
    all: (query, params = []) => ipcRenderer.invoke("sqlite.all", query, params),
    get: (query, params = []) => ipcRenderer.invoke("sqlite.get", query, params),
    runAsTransaction: (queries, params) => ipcRenderer.invoke("sqlite.runAsTransaction", queries, params)
  },
  blob: {
    cards: {
      get: (card) => ipcRenderer.invoke("blob.cards.get", card)
    },
    personas: {
      get: (persona) => ipcRenderer.invoke("blob.personas.get", persona)
    }
  },
  secret: {
    get: (k) => ipcRenderer.invoke("secret.get", k),
    set: (k, v) => ipcRenderer.invoke("secret.set", k, v)
  },
  setting: {
    get: () => ipcRenderer.invoke("setting.get"),
    set: (settings) => ipcRenderer.invoke("setting.set", settings)
  },
  xfetch: {
    post: (url, body, headers) => ipcRenderer.invoke("xfetch.post", url, body, headers),
    get: (url, headers) => ipcRenderer.invoke("xfetch.get", url, headers)
  }
};
contextBridge.exposeInMainWorld("api", api);

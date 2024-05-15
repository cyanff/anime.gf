import { PersonaFormData } from "@shared/forms";
import { CardData, PersonaBundle, Result, Settings, UICardBundle } from "@shared/types";
import { contextBridge, ipcRenderer } from "electron";
import { RunResult } from "../main/lib/store/sqlite";
import { XFetchConfig } from "../main/lib/xfetch";

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
      get: (id: number) => Promise<Result<UICardBundle, Error>>;
      create: (
        cardData: CardData,
        bannerURI: string | null,
        avatarURI: string | null
      ) => Promise<Result<undefined, Error>>;
      update: (
        id: number,
        cardData: CardData,
        bannerURI: string | null,
        avatarURI: string | null
      ) => Promise<Result<undefined, Error>>;
      del: (cardID: number) => Promise<Result<undefined, Error>>;
      export_: (card: string) => Promise<Result<void, Error>>;
      import_: (zip: string) => Promise<Result<void, Error>>;
    };
    personas: {
      get: (persona: string) => Promise<Result<PersonaBundle, Error>>;
      post: (data: PersonaFormData) => Promise<Result<void, Error>>;
      put: (id: number, data: PersonaFormData) => Promise<Result<void, Error>>;
      rename: (oldName: string, newName: string) => Promise<Result<void, Error>>;
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
    post: (
      url: string,
      body?: object,
      headers?: Record<string, string>,
      config?: XFetchConfig
    ) => Promise<Result<any, Error>>;
    get: (url: string, headers?: Record<string, string>, config?: XFetchConfig) => Promise<Result<any, Error>>;
    abort: (uuid: string) => Promise<Result<void, Error>>;
  };

  utils: {
    openURL: (url: string) => void;
    getNativeImage: (path: string) => Promise<Result<Electron.NativeImage, Error>>;
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
      get: (id) => ipcRenderer.invoke("blob.cards.get", id),
      create: (cardData, bannerURI, avatarURI) =>
        ipcRenderer.invoke("blob.cards.create", cardData, bannerURI, avatarURI),
      update: (id, cardData, bannerURI, avatarURI) =>
        ipcRenderer.invoke("blob.cards.update", id, cardData, bannerURI, avatarURI),
      del: (cardID) => ipcRenderer.invoke("blob.cards.del", cardID),
      export_: (card) => ipcRenderer.invoke("blob.cards.export_", card),
      import_: (zip) => ipcRenderer.invoke("blob.cards.import_", zip)
    },
    personas: {
      get: (persona) => ipcRenderer.invoke("blob.personas.get", persona),
      post: (data) => ipcRenderer.invoke("blob.personas.post", data),
      put: (id, data) => ipcRenderer.invoke("blob.personas.put", id, data),
      rename: (oldName, newName) => ipcRenderer.invoke("blob.personas.rename", oldName, newName)
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
    post: (url, body, headers, config) => ipcRenderer.invoke("xfetch.post", url, body, headers, config),
    get: (url, headers, config) => ipcRenderer.invoke("xfetch.get", url, headers, config),
    abort: (uuid) => ipcRenderer.invoke("xfetch.abort", uuid)
  },
  utils: {
    openURL: (url) => ipcRenderer.invoke("utils.openURL", url),
    getNativeImage: (path) => ipcRenderer.invoke("utils.getNativeImage", path)
  }
};

contextBridge.exposeInMainWorld("api", api);

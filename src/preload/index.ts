import { CardBundle, CardData, PersonaBundleWithoutData, PersonaFormData, Result, Settings } from "@shared/types";
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
    image: {
      get: (path: string) => Promise<Result<any, Error>>;
    };
    cards: {
      get: (card: string) => Promise<Result<CardBundle, Error>>;
      create: (
        cardData: CardData,
        bannerURI: string | null,
        avatarURI: string | null
      ) => Promise<Result<undefined, Error>>;
      update: (
        cardID: number,
        cardData: CardData,
        bannerURI: string | null,
        avatarURI: string | null
      ) => Promise<Result<undefined, Error>>;
      del: (cardID: number) => Promise<Result<undefined, Error>>;
      exportToZip: (card: string) => Promise<Result<void, Error>>;
      importFromZip: (zip: string) => Promise<Result<void, Error>>;
    };
    personas: {
      get: (persona: string) => Promise<Result<PersonaBundleWithoutData, Error>>;
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
      body: Object,
      headers: Record<string, string>,
      config?: XFetchConfig
    ) => Promise<Result<any, Error>>;
    get: (url: string, headers: Record<string, string>, config?: XFetchConfig) => Promise<Result<any, Error>>;
  };

  utils: {
    openURL: (url: string) => void;
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
    image: {
      get: (path) => ipcRenderer.invoke("blob.image.get", path)
    },
    cards: {
      get: (card) => ipcRenderer.invoke("blob.cards.get", card),
      create: (cardData, bannerURI, avatarURI) =>
        ipcRenderer.invoke("blob.cards.create", cardData, bannerURI, avatarURI),
      update: (cardID, cardData, bannerURI, avatarURI) =>
        ipcRenderer.invoke("blob.cards.update", cardID, cardData, bannerURI, avatarURI),
      del: (cardID) => ipcRenderer.invoke("blob.cards.del", cardID),
      exportToZip: (card) => ipcRenderer.invoke("blob.cards.exportToZip", card),
      importFromZip: (zip) => ipcRenderer.invoke("blob.cards.importFromZip", zip)
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
    get: (url, headers, config) => ipcRenderer.invoke("xfetch.get", url, headers, config)
  },
  utils: {
    openURL: (url) => ipcRenderer.invoke("utils.openURL", url)
  }
};

contextBridge.exposeInMainWorld("api", api);

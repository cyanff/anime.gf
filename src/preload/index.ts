import { contextBridge, ipcRenderer } from "electron";
import { Result } from "@shared/utils";
import { RunResult } from "../main/lib/store/sqlite";
import { CardBundle, CardData, PersonaBundleWithoutData, Settings } from "@shared/types";

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
      post: (
        cardData: CardData,
        bannerImage: string | null,
        avatarImage: string | null
      ) => Promise<Result<string, Error>>;
      exportToZip: (card: string) => Promise<Result<void, Error>>;
      importFromZip: (zip: string) => Promise<Result<void, Error>>;
    };
    personas: {
      get: (persona: string) => Promise<Result<PersonaBundleWithoutData, Error>>;
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
    post: (url: string, body: Object, headers: Record<string, string>) => Promise<Result<any, Error>>;
    get: (url: string, headers: Record<string, string>) => Promise<Result<any, Error>>;
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
      post: (cardData, bannerImage, avatarImage) =>
        ipcRenderer.invoke("blob.cards.post", cardData, bannerImage, avatarImage),
      exportToZip: (card) => ipcRenderer.invoke("blob.cards.exportToZip", card),
      importFromZip: (zip) => ipcRenderer.invoke("blob.cards.importFromZip", zip)
    },
    personas: {
      get: (persona) => ipcRenderer.invoke("blob.personas.get", persona),
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
    post: (url, body, headers) => ipcRenderer.invoke("xfetch.post", url, body, headers),
    get: (url, headers) => ipcRenderer.invoke("xfetch.get", url, headers)
  },
  utils: {
    openURL: (url) => ipcRenderer.invoke("utils.openURL", url)
  }
};

contextBridge.exposeInMainWorld("api", api);

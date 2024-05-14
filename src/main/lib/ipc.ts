import { PersonaFormData } from "@shared/forms";
import { CardData } from "@shared/types";
import { ipcMain, shell } from "electron";
import blob from "./store/blob";
import secret from "./store/secret";
import setting from "./store/setting";
import sqlite from "./store/sqlite";
import { getNativeImage } from "./utils";
import { XFetchConfig, xfetch } from "./xfetch";

export const ipcHandlers = {
  sqlite: {
    run: async (_, query: string, params: [] = []) => sqlite.run(query, params),
    all: async (_, query: string, params: [] = []) => sqlite.all(query, params),
    get: async (_, query: string, params: [] = []) => sqlite.get(query, params),
    runAsTransaction: async (_, queries: string[], params: [][]) => sqlite.runAsTransaction(queries, params)
  },
  blob: {
    cards: {
      get: async (_, card: string) => blob.cards.get(card),
      create: async (_, cardData: CardData, bannerURI: string | null, avatarURI: string | null) =>
        blob.cards.create(cardData, bannerURI, avatarURI),
      update: async (_, cardID: number, cardData: CardData, bannerURI: string | null, avatarURI: string | null) =>
        blob.cards.update(cardID, cardData, bannerURI, avatarURI),
      del: async (_, cardID: number) => blob.cards.del(cardID),
      export_: async (_, card: string) => blob.cards.export_(card),
      import_: async (_, zip: string) => blob.cards.import_(zip)
    },
    personas: {
      get: async (_, persona: string) => blob.personas.get(persona),
      post: async (_, data: PersonaFormData) => blob.personas.post(data),
      put: async (_, id: number, data: PersonaFormData) => blob.personas.put(id, data)
    }
  },
  secret: {
    get: async (_, k: string) => secret.get(k),
    set: async (_, k: string, v: string) => secret.set(k, v)
  },
  setting: {
    get: async () => setting.get(),
    set: async (_, settings: any) => setting.set(settings)
  },
  xfetch: {
    post: async (_, url: string, body?: object, headers?: Record<string, string>, config?: XFetchConfig) =>
      xfetch.post(url, body, headers, config),
    get: async (_, url: string, headers?: Record<string, string>, config?: XFetchConfig) =>
      xfetch.get(url, headers, config),
    abort: async (_, uuid: string) => xfetch.abort(uuid)
  },
  utils: {
    openURL: async (_, url: string) => shell.openExternal(url),
    getNativeImage: async (_, path: string) => getNativeImage(path)
  }
};

// Recurse through the ipcHandlers object and register all handlers with ipcMain
function registerHandlers(handlers: any, prefix = "") {
  for (const [key, handler] of Object.entries(handlers)) {
    const channel = prefix ? `${prefix}.${key}` : key;
    if (typeof handler === "function") {
      ipcMain.handle(channel, (_, ...args) => handler(...args));
    } else {
      registerHandlers(handler, channel);
    }
  }
}

async function init() {
  registerHandlers(ipcHandlers);
}

export default {
  init
};

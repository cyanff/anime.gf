import { CardData, PersonaFormData } from "@shared/types";
import { ipcMain, shell } from "electron";
import blob from "./store/blob";
import secret from "./store/secret";
import setting from "./store/setting";
import sqlite from "./store/sqlite";
import { XFetchConfig, xfetch } from "./xfetch";

async function init() {
  ipcMain.handle("sqlite.run", async (_, query: string, params: [] = []) => {
    return sqlite.run(query, params);
  });
  ipcMain.handle("sqlite.all", async (_, query: string, params: [] = []) => {
    return sqlite.all(query, params);
  });
  ipcMain.handle("sqlite.get", async (_, query: string, params: [] = []) => {
    return sqlite.get(query, params);
  });
  ipcMain.handle("sqlite.runAsTransaction", async (_, queries: string[], params: [][]) => {
    return sqlite.runAsTransaction(queries, params);
  });

  ipcMain.handle("blob.image.get", async (_, path: string) => {
    return await blob.image.get(path);
  });

  ipcMain.handle("blob.cards.get", async (_, card: string) => {
    return await blob.cards.get(card);
  });

  ipcMain.handle(
    "blob.cards.create",
    async (_, cardData: CardData, bannerURI: string | null, avatarURI: string | null) => {
      return await blob.cards.create(cardData, bannerURI, avatarURI);
    }
  );

  ipcMain.handle(
    "blob.cards.update",
    async (_, cardID: number, cardData: CardData, bannerURI: string | null, avatarURI: string | null) => {
      return await blob.cards.update(cardID, cardData, bannerURI, avatarURI);
    }
  );

  ipcMain.handle("blob.cards.del", async (_, cardID: number) => {
    return await blob.cards.del(cardID);
  });

  ipcMain.handle("blob.cards.export_", async (_, card: string) => {
    return await blob.cards.export_(card);
  });

  ipcMain.handle("blob.cards.import_", async (_, zip: string) => {
    return await blob.cards.import_(zip);
  });

  ipcMain.handle("blob.personas.get", async (_, persona: string) => {
    return await blob.personas.get(persona);
  });
  ipcMain.handle("blob.personas.post", async (_, data: PersonaFormData) => {
    return await blob.personas.post(data);
  });

  ipcMain.handle("blob.personas.put", async (_, id: number, data: PersonaFormData) => {
    return await blob.personas.put(id, data);
  });

  ipcMain.handle("secret.get", async (_, k: string) => {
    return await secret.get(k);
  });

  ipcMain.handle("secret.set", async (_, k: string, v: string) => {
    return await secret.set(k, v);
  });

  ipcMain.handle(
    "xfetch.post",
    async (_, url: string, body?: object, headers?: Record<string, string>, config?: XFetchConfig) => {
      return await xfetch.post(url, body, headers, config);
    }
  );

  ipcMain.handle("xfetch.get", async (_, url: string, headers?: Record<string, string>, config?: XFetchConfig) => {
    return await xfetch.get(url, headers, config);
  });

  ipcMain.handle("xfetch.abort", async (_, uuid: string) => {
    return await xfetch.abort(uuid);
  });

  ipcMain.handle("utils.openURL", async (_, url: string) => {
    return await shell.openExternal(url);
  });

  ipcMain.handle("setting.get", async () => {
    return await setting.get();
  });

  ipcMain.handle("setting.set", async (_, settings: any) => {
    return await setting.set(settings);
  });
}

export default {
  init
};

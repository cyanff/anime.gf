import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { CardData, PersonaFormData } from "@shared/types";
import { BrowserWindow, Menu, Tray, app, ipcMain, nativeImage, net, protocol, shell } from "electron";
import path, { join } from "path";
import { i } from "vite/dist/node/types.d-aGj9QkWt";
import icon from "../../resources/icon.png?asset";
import blob from "./lib/store/blob";
import secret from "./lib/store/secret";
import setting from "./lib/store/setting";
import sqlite from "./lib/store/sqlite";
import { cardsRootPath, personasRootPath } from "./lib/utils";
import { XFetchConfig, xfetch } from "./lib/xfetch";

let win: any;
let isQuiting = false;

app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, _navigationUrl) => {
    event.preventDefault();
  });
});

protocol.registerSchemesAsPrivileged([
  {
    scheme: "agf",
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      supportFetchAPI: false
    }
  }
]);
app.enableSandbox();

app.whenReady().then(async () => {
  if (is.dev && process.env["REACT_DEVTOOLS"] === "true") {
    const { REACT_DEVELOPER_TOOLS, default: installExtension } = await import("electron-devtools-assembler");
    await installExtension(REACT_DEVELOPER_TOOLS);
  }
  electronApp.setAppUserModelId("gf.anime");

  // https://stackoverflow.com/questions/37828758/electron-js-how-to-minimize-close-window-to-system-tray-and-restore-window-back
  const tray = new Tray(nativeImage.createFromPath(icon));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function () {
        win.show();
      }
    },
    {
      label: "Quit",
      click: function () {
        isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip("anime.gf");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    win.show();
  });

  app.on("before-quit", function () {
    isQuiting = true;
  });

  /**
   * An electron protocol that handles requests from the renderer process to agf:///host/path
   * https://www.electronjs.org/docs/latest/api/protocol
   * Currently only supports the "cards" host agf:///cards/path
   *
   * The renderer process cannot access the filesystem.
   * This is a problem when you want to display images stored on disk.
   *
   * You could serialize an image through electron IPC but this is slow.
   *
   * You should use this protocol to display images instead.
   *
   * Note that requests made through fetch are disabled.
   * So fetch(agf:///cards/whatever/path) will be rejected
   * Instead use <img src="agf:///host/path"
   *
   * @example
   * Example usage in renderer:
   * <img src="agf:///cards/some_char/avatar.png"/>
   * <img src="agf:///cards/some_other_char/banner.png"/>
   *
   */
  protocol.handle("agf", (req) => {
    const { host, pathname } = new URL(req.url);
    if (host === "cards") {
      const resolved = path.resolve(path.join(cardsRootPath, pathname));
      // Ensure that only resources inside userData/blob/cards are accessible
      if (!resolved.startsWith(cardsRootPath)) {
        return new Response(
          `The requested path is unsafe.
      Path given"${pathname}
      Resolved to${resolved}
      Resolved path is outside of the allowed directory: ${cardsRootPath}"`,
          { status: 400 }
        );
      }
      return net.fetch(path.join("file://", resolved));
    }

    if (host === "personas") {
      const resolved = path.resolve(path.join(personasRootPath, pathname));

      if (!resolved.startsWith(personasRootPath)) {
        return new Response(
          `The requested path is unsafe.
      Path given"${pathname}
      Resolved to${resolved}
      Resolved path is outside of the allowed directory: ${personasRootPath}"`,
          { status: 400 }
        );
      }
      return net.fetch(path.join("file://", resolved));
    }

    return new Response(`Host "${host}" is unsupported.`, {
      status: 400,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  });

  await sqlite.init();
  await blob.init();
  await secret.init();
  await setting.init();

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

  ipcMain.handle("blob.cards.exportToZip", async (_, card: string) => {
    return await blob.cards.exportToZip(card);
  });

  ipcMain.handle("blob.cards.importFromZip", async (_, zip: string) => {
    return await blob.cards.importFromZip(zip);
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

  // Open or close DevTools using F12 in development
  // Ignore Cmd/Ctrl + R in production.
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    // For macOS, re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Quit when all windows are closed
  app.on("window-all-closed", async () => {
    const settingsRes = await setting.get();
    if (settingsRes.kind === "ok" && settingsRes.value.advanced.closeToTray) {
      win.hide();
      return;
    }

    // Except on macOS
    // It's common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  createWindow();
  // Implement Electron auto-updater
  // autoUpdater.on();
});

function createWindow(): void {
  win = new BrowserWindow({
    title: "anime.gf",
    icon: icon,
    width: 900,
    height: 670,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      spellcheck: false,
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: false,
      webSecurity: true
    }
  });

  win.on("ready-to-show", () => {
    win.show();
  });

  win.on("minimize", (e) => {
    e.preventDefault();
    win.hide();
  });

  win.on("close", (e) => {
    if (!isQuiting) {
      e.preventDefault();
      win.hide();
    }
    return false;
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load vite dev server in development or static files in production
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

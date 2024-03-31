import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import secret from "./lib/store/secret";
import sqlite from "./lib/store/sqlite";
import qdrant from "./lib/store/qdrant";
import blob from "./lib/store/blob";
import { xfetch } from "./lib/xfetch";

app.enableSandbox();
app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");

  qdrant.init();
  await sqlite.init();
  await blob.init();
  await secret.init();

  ipcMain.handle("sqlite.run", async (_, query: string, params: [] = []) => {
    return sqlite.run(query, params);
  });
  ipcMain.handle("sqlite.all", async (_, query: string, params: [] = []) => {
    return sqlite.all(query, params);
  });
  ipcMain.handle("sqlite.get", async (_, query: string, params: [] = []) => {
    return sqlite.get(query, params);
  });
  ipcMain.handle("blob.cards.get", async (_, card: string) => {
    return await blob.cards.get(card);
  });
  ipcMain.handle("secret.get", async (_, k: string) => {
    return await secret.get(k);
  });
  ipcMain.handle("secret.set", async (_, k: string, v: string) => {
    return await secret.set(k, v);
  });
  ipcMain.handle("xfetch.post", async (_, url: string, body: Object, headers: Record<string, string>) => {
    return await xfetch.post(url, body, headers);
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
  app.on("window-all-closed", () => {
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
  // https://www.electron.build/auto-update.html
});

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 960,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
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

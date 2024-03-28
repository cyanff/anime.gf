import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { init as initQdrant } from "./lib/store/qdrant";
import { init as initSqlite } from "./lib/store/sqlite";
import { init as initBlob } from "./lib/store/blob";
import { get, run, all } from "./lib/store/sqlite";
import blob from "./lib/store/blob";

// Enable globlal renderer sandboxing
app.enableSandbox();
app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron");

  await initSqlite();
  await initQdrant();
  await initBlob();

  ipcMain.handle("sqlite.run", async (_, query: string, params: [] = []) => {
    return run(query, params);
  });
  ipcMain.handle("sqlite.all", async (_, query: string, params: [] = []) => {
    return all(query, params);
  });
  ipcMain.handle("sqlite.get", async (_, query: string, params: [] = []) => {
    return get(query, params);
  });
  ipcMain.handle("blob.cards.get", async (_, card: string) => {
    return await blob.cards.get(card);
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
  const mainWindow = new BrowserWindow({
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

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load vite dev server in development or static files in production
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

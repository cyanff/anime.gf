import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, Menu, Tray, app, dialog, nativeImage, net, protocol, shell } from "electron";
import { autoUpdater } from "electron-updater";
import path, { join } from "path";
import icon from "../../resources/icon.png?asset";
import ipc from "./lib/ipc";
import blob from "./lib/store/blob";
import secret from "./lib/store/secret";
import setting from "./lib/store/setting";
import sqlite from "./lib/store/sqlite";
import { cardsRootPath, personasRootPath } from "./lib/utils";

let window: any;
let isQuiting = false;

// Prevent multiple app instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

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
  // Load react devtools in development if REACT_DEVTOOLS is set to true
  if (is.dev && process.env["REACT_DEVTOOLS"] === "true") {
    const { REACT_DEVELOPER_TOOLS, default: installExtension } = await import("electron-devtools-assembler");
    await installExtension(REACT_DEVELOPER_TOOLS);
  }
  electronApp.setAppUserModelId("gf.anime");

  // Set the autoUpdater config path to the dev-app-update.yml in development
  // This allows us to test the autoUpdater with releases from another repo
  if (is.dev) {
    autoUpdater.updateConfigPath = path.join(process.cwd(), "dev-app-update.yml");
  }

  // Close to tray functionalities
  // https://stackoverflow.com/questions/37828758/electron-js-how-to-minimize-close-window-to-system-tray-and-restore-window-back
  const tray = new Tray(nativeImage.createFromPath(icon));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App      ",
      click: () => {
        window.show();
      }
    },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip("anime.gf");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    window.show();
  });
  app.on("before-quit", () => {
    isQuiting = true;
  });

  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      if (!window.isVisible()) {
        window.show();
      }
      window.focus();
    }
  });

  // Disable navigation for security purposes
  app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, url) => {
      event.preventDefault();
      if (url.startsWith("agf://") || url.startsWith("http://localhost")) return;
      shell.openExternal(url);
    });
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
  await ipc.init();

  // Open or close DevTools using F12 in development
  // Ignore Cmd/Ctrl + R in production.
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    // For macOS, re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // Check for updates every 15 minutes
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify();
    },
    1000 * 60 * 15
  );
  autoUpdater.on("update-downloaded", (e) => {
    const { version } = e;
    const dialogOpts: Electron.MessageBoxOptions = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: `anime.gf version ${version} has been downloaded.`,
      detail: "Restart the application to apply the update."
    };

    dialog.showMessageBox(dialogOpts).then((val) => {
      if (val.response === 0) {
        isQuiting = true;
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on("error", (error) => {
    console.error("There was a problem updating the application");
    console.error(error);
  });

  createWindow();
});

function createWindow(): void {
  window = new BrowserWindow({
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
      webSecurity: true
    }
  });

  window.on("ready-to-show", () => {
    // if (loadingWindow) loadingWindow.close();
    window.show();
  });

  window.on("close", async (e) => {
    if (!isQuiting) {
      e.preventDefault();
      const settingsRes = await setting.get();
      if (settingsRes.kind === "ok" && settingsRes.value?.advanced?.closeToTray) {
        window.hide();
        return;
      } else {
        app.quit();
        return false;
      }
    }
    app.quit();
    return false;
  });

  window.webContents.setWindowOpenHandler((details) => {
    // Open external links in the default browser
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load vite dev server in development or static files in production
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

import { Result } from "@shared/types";
import { isError } from "@shared/utils";
import { app, nativeImage } from "electron";
import fs, { PathLike } from "fs";
import fsp from "fs/promises";
import JSZip from "jszip";
import path, { dirname, join } from "path";

const isDev = process.env.NODE_ENV === "development";

export const dbPath = join(app.getPath("userData"), "agf.db");

// The path of the the "resources" directory
// In development: root/resources/
// In production:
// Electron builder bundles everything into an ASAR archive by default
// However, we've specified that the contents of /resources remains unpacked so that we could easily access them
// The unpacked resources are under /app.asar.unpacked/resources
export const resourcesPath = isDev
  ? join(app.getAppPath(), "/resources/")
  : join(dirname(app.getAppPath()), "/app.asar.unpacked/resources/");
export const migrationsPath = join(resourcesPath, "/migrations");

export const secretsPath = path.join(app.getPath("userData"), "secrets.json");
export const settingsPath = path.join(app.getPath("userData"), "settings.json");

// Blob
// ======================================================================
export const blobRootPath = path.join(app.getPath("userData"), "blob");
export const cardsRootPath = path.join(blobRootPath, "cards");
export const personasRootPath = path.join(blobRootPath, "personas");
// ======================================================================

/**
 * Checks if a file exists and is accessible at the specified path.
 * @param path - The path to the file.
 * @returns A promise that resolves to a boolean indicating whether the file exists and is accessible.
 */
export async function attainable(path: PathLike): Promise<boolean> {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Extracts the contents of a ZIP file with a FLAT DIRECTORY STRUCTURE to a specified directory.
 * @param zipSrc - The path to the ZIP file to extract.
 * @param dirDest - The directory to extract the ZIP file contents to.
 * @returns A promise that resolves to a Result object containing void if successful, else an error.
 */
export async function extractZipToDir(zipSrc: string, dirDest): Promise<Result<void, Error>> {
  const data = await fsp.readFile(zipSrc);
  const zip = await JSZip.loadAsync(data);
  try {
    for (const fileName in zip.files) {
      const file = zip.files[fileName];
      if (!file.dir) {
        const content = await file.async("nodebuffer");
        const destFilePath = path.join(dirDest, path.basename(fileName));
        await fsp.writeFile(destFilePath, content);
      }
    }
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export function copyFolder(src, dest) {
  // Create destination folder if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  // Read the contents of the source folder
  fs.readdirSync(src).forEach((file) => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      // Recurse
      copyFolder(srcPath, destPath);
    } else {
      // Copy file to dest
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

export async function downloadImageBuffer(path: PathLike): Promise<Result<Buffer, Error>> {
  try {
    if (path instanceof Buffer) {
      return { kind: "ok", value: path };
    }
    const res = await fetch(path);
    if (!res.ok) {
      return { kind: "err", error: new Error(`Failed to download image from ${path}`) };
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { kind: "ok", value: buffer };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export async function getNativeImage(path: string): Promise<Result<Electron.NativeImage, Error>> {
  try {
    const image = nativeImage.createFromPath(path);
    return { kind: "ok", value: image };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export async function fileToBuffer(path: PathLike): Promise<Result<Buffer, Error>> {
  try {
    if (path instanceof Buffer) {
      return { kind: "ok", value: path };
    }

    if (typeof path === "string") {
      if (!(await attainable(path))) {
        return { kind: "err", error: new Error(`Path "${path}" is not accessible.`) };
      }
      const buffer = await fsp.readFile(path);
      return { kind: "ok", value: buffer };
    }

    if (path instanceof URL) {
      downloadImageBuffer(path);
      const buffer = await fsp.readFile(path);
      return { kind: "ok", value: buffer };
    }
    throw new Error("PathLike is not a string, Buffer, or URL");
  } catch (error) {
    return { kind: "err", error: new Error(`Failed to convert PathLike to Buffer: ${error.message}`) };
  }
}

import { ImageExt, Result } from "@shared/types";
import { isError } from "@shared/utils";
import { app } from "electron";
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

export async function downloadImageBuffer(url: string): Promise<Result<Buffer, Error>> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { kind: "err", error: new Error(`Failed to download image from ${url}`) };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extRes = await imageExtFromBuffer(buffer);
    if (extRes.kind === "err") {
      throw extRes.error;
    }
    return { kind: "ok", value: buffer };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

const magicBytesPairs = [
  ["89504E47", "png"],
  ["FFD8FF", "jpg"],
  ["52494646", "webp"],
  ["47494638", "gif"]
];

export async function imageExtFromBuffer(buffer: Buffer): Promise<Result<ImageExt, Error>> {
  try {
    const magicBytes = buffer.toString("hex", 0, 4).toUpperCase();
    for (const [key, ext] of magicBytesPairs) {
      if (magicBytes.startsWith(key)) {
        return { kind: "ok", value: ext };
      }
    }
    return { kind: "err", error: new Error("Unsupported image type") };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

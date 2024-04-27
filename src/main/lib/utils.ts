import { Result } from "@shared/types";
import { isError } from "@shared/utils";
import { app } from "electron";
import fs, { PathLike } from "fs";
import fsp from "fs/promises";
import JSZip from "jszip";
import path, { dirname, join } from "path";

// TODO, make sure all of these directories exists on init
export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());
export const dbPath = join(app.getPath("userData"), "agf.db");
export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");
export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");

export const secretsPath = path.join(app.getPath("userData"), "secrets.json");
export const settingsPath = path.join(app.getPath("userData"), "settings.json");

// Root directory for all blob data
export const blobRootPath = path.join(app.getPath("userData"), "blob");
// Directories for different types of blob data
export const cardsRootPath = path.join(blobRootPath, "cards");
export const personasRootPath = path.join(blobRootPath, "personas");

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

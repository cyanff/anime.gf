import fsp from "fs/promises";
import fs from "fs";
import { app } from "electron";
import path, { join, dirname } from "path";
import { PathLike } from "fs";
import JSZip from "jszip";
import { Result, isError } from "@shared/utils";

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

import fs from "fs/promises";
import { app } from "electron";
import path, { join, dirname } from "path";
import { PathLike } from "fs";

// TODO, make sure all of these directories exists on init

export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());
export const dbPath = join(app.getPath("userData"), "agf.db");
export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");
export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");
// Root directory for all blob data
export const blobPath = path.join(app.getPath("userData"), "blob");
// Silly tavern .png cards are stored in blob/cards
export const cardsPath = path.join(blobPath, "cards");
export const personasPath = path.join(blobPath, "personas");
export const secretsPath = path.join(app.getPath("userData"), "secrets.json");
export const settingsPath = path.join(app.getPath("userData"), "settings.json");

/**
 * Checks if a file exists and is accessible at the specified path.
 * @param path - The path to the file.
 * @returns A promise that resolves to a boolean indicating whether the file exists and is accessible.
 */
export async function attainable(path: PathLike): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

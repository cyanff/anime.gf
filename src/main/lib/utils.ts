import fs from "fs/promises";
import { app } from "electron";
import path, { join, dirname } from "path";

export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());
export const dbPath = join(app.getPath("userData"), "agf.db");
export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");
export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");
// Root directory for all blob data
export const blobPath = path.join(app.getPath("userData"), "blob");
// Silly tavern .png cards are stored in blob/cards
export const cardsPath = path.join(blobPath, "cards");

export async function fileExistsAndAccessible(path): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

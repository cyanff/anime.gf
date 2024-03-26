import fs from "fs/promises";
import { app } from "electron";
import { join, dirname } from "path";

export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());
export const dbPath = join(app.getPath("userData"), "agf.db");
export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");
export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");

export async function fileExistsAndAccessible(path): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

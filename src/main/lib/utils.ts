import { app } from "electron";
import { join, dirname } from "path";

// App path in production is some/dir/app.asar
// We strip the app.asar to get the actual path
export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());

export const dbPath = join(app.getPath("userData"), "agf.db");

export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");

export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");

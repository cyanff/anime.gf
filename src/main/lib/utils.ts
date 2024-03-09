import { app } from "electron";
import { join } from "path";

export const rootPath = app.getAppPath();
export const dbPath = join(app.getPath("userData"), "agf.db");
export const migrationsDir =
  process.env.NODE_ENV === "development"
    ? join(process.cwd(), "resources/migrations")
    : // TODO not sure if this is correct
      join(rootPath, "resources/migrations");

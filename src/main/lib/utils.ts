import fs from "fs/promises";
import { app } from "electron";
import { join, dirname } from "path";

// App path in production is some/dir/app.asar
// We strip the app.asar to get the actual path
export const rootPath = process.env.NODE_ENV === "development" ? app.getAppPath() : dirname(app.getAppPath());
export const dbPath = join(app.getPath("userData"), "agf.db");
export const unpackedPath = join(rootPath, "/app.asar.unpacked/resources/");
export const migrationsDir =
  process.env.NODE_ENV === "development" ? join(rootPath, "resources/migrations") : join(unpackedPath, "migrations");

// ======================= Dumb DB =======================
// Usage:
// import { DDB } from "./utils";
// const ddb: Object = DDB.get();
// ddb["key"] = "value";
// DDB.write();
let ddbPath = join(process.cwd(), "ddb.json");

export async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    // File doesn't exist or not accessible (e.g. no permissions)
    return false;
  }
}

export async function getDDB(): Promise<Object> {
  const dbExists = await fileExists(ddbPath);
  if (!dbExists) {
    await fs.writeFile(ddbPath, JSON.stringify({}, null, 2));
  }
  const db = await fs.readFile(ddbPath, "utf-8");
  return JSON.parse(db);
}

export async function writeDDB(ddb: Object) {
  fs.writeFile(ddbPath, JSON.stringify(ddb, null, 2));
}

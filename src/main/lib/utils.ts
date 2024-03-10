import fs from "fs";
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
let ddb: Object;
export class DDB {
  constructor() {
    throw new Error("DDB is a static class and cannot be instantiated");
  }
  static get() {
    if (ddb) {
      return ddb;
    }
    return (ddb = JSON.parse(fs.readFileSync(ddbPath, "utf-8")));
  }
  static write() {
    fs.writeFileSync(ddbPath, JSON.stringify(ddb, null, 2));
  }
}

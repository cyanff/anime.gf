import Database from "better-sqlite3";
import { app } from "electron";
import fsp from "fs/promises";
import path from "path";
import { attainable, dbPath, migrationsPath } from "../utils";
import { Result } from "./../../../shared/types";

// TODO: refactor apis in this file to return Result<T,E>
let db: Database.Database;

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}
export function run(query: string, params: any[] = []): RunResult {
  const stmt = db.prepare(query);
  return stmt.run(...params);
}

export function all(query: string, params: any[] = []) {
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function get(query: string, params: any[] = []) {
  const stmt = db.prepare(query);
  const res = stmt.get(...params);
  if (!res) {
    throw new Error("No result found");
  }
  return res;
}

export function runAsTransaction(queries: string[], params: any[][] = []) {
  const asTransaction = db.transaction((transactionQueries: string[], transactionParams: any[][]) => {
    for (let i = 0; i < transactionQueries.length; i++) {
      const stmt = db.prepare(transactionQueries[i]);
      stmt.run(...transactionParams[i]);
    }
  });
  return asTransaction(queries, params);
}

interface Migration {
  version: string;
  statement: string;
  name: string;
}

function ensureSchemaMigrationsTable() {
  const q = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT NOT NULL PRIMARY KEY,
      statement TEXT,
      name TEXT
    )`;
  db.exec(q);
}

async function init() {
  db = Database(dbPath);
  //   // Users of the app's first release doesn't have a schema_migrations table
  //   // Yet their schemas are up to date.
  //   // So we'll just create the schema_migrations table and insert the first migration
  // if schema migrations table doesn't exist and a table exists "cards"
  //  create schema_migrations table
  // insert the init migration
  // return
  await update();
}

async function update() {
  ensureSchemaMigrationsTable();

  // Check if the database needs to be updated
  const migrationsRes = await getMigrations();
  const currentVersionRes = await getCurrentVersion();
  if (migrationsRes.kind === "err") {
    console.error("Error getting migrations:", migrationsRes.error);
    return;
  }
  if (currentVersionRes.kind === "err") {
    console.error("Error getting the current db version:", currentVersionRes.error);
    return;
  }
  const migrations = migrationsRes.value;
  const targetVersion = migrations[migrations.length - 1].version;
  const currentVersion = currentVersionRes.value || "0";
  if (currentVersion === targetVersion) {
    console.log("Database is already up to date");
    return;
  }
  if (currentVersion > targetVersion) {
    console.error(
      "Current database version is newer than the target version!\nThis should never happen.\nSkipping migrations."
    );
    return;
  }
  const newMigrations = migrations.filter((m) => m.version > currentVersion);

  try {
    await backup();
    await runMigrations(newMigrations);
  } catch (error) {
    console.error("Error during database update:", error);
    console.log("Attempting to restore database from backup...");
    await restore();
  }
}

async function runMigrations(migrations: Migration[]): Promise<Result<void, Error>> {
  try {
    for (const migration of migrations) {
      db.exec(migration.statement);
      const q = `INSERT INTO schema_migrations (version, statement, name) VALUES (?, ?, ?)`;
      run(q, [migration.version, migration.statement, migration.name]);
    }
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getMigrations(): Promise<Result<Migration[], Error>> {
  try {
    const files = await fsp.readdir(migrationsPath);
    const migrations: Migration[] = [];

    for (const file of files) {
      if (path.extname(file) === ".sql") {
        const content = await fsp.readFile(path.join(migrationsPath, file), "utf-8");
        const timestampAndName = path.basename(file, ".sql");
        const nameParts = timestampAndName.split("_");

        if (nameParts.length != 2) {
          throw new Error(
            `Invalid migration file name, migration file *must* be in this format "timestamp_name" ${file}`
          );
        }
        const [version, name] = nameParts;
        migrations.push({ version, statement: content, name });
      }
    }
    migrations.sort((a, b) => a.version.localeCompare(b.version));
    return { kind: "ok", value: migrations };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getCurrentVersion(): Promise<Result<string | undefined, Error>> {
  try {
    const q = `SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1`;
    const result = all(q) as { version: string }[];
    if (result.length > 1) throw new Error("Multiple versions found in schema_migrations table");
    if (result.length == 0) return { kind: "ok", value: undefined };
    return { kind: "ok", value: result[0].version };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function backup() {
  const backupPath = `${dbPath}.bak`;
  await fsp.copyFile(dbPath, backupPath);
}

async function restore() {
  const backupPath = `${dbPath}.bak`;
  if (await attainable(backupPath)) {
    await fsp.copyFile(backupPath, dbPath);
  } else {
    console.error("Restore failed, backup file is inaccessible.");
  }
}

export default {
  init,
  run,
  all,
  get,
  runAsTransaction
};

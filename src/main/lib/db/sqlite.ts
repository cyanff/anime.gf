import Database from "better-sqlite3";
import { app } from "electron";
const { join } = require("path");
import fs from "fs";
import { log } from "../utils/logger";

let db: Database.Database;

/**
 * Executes a SQL query with optional parameters and returns the result.
 * @param sql - The SQL query to execute.
 * @param params - Optional parameters to be used in the query.
 * @returns The result of the query.
 */
export function executeQuery(sql, params?) {
  try {
    let stmt = db.prepare(sql);
    const trimmedSql = sql.trim().toUpperCase();
    if (trimmedSql.startsWith("SELECT") || trimmedSql.startsWith("WITH")) {
      return stmt.all(...(params || []));
    } else {
      return stmt.run(...(params || []));
    }
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

/**
 * Initializes the database connection.
 */
export async function initializeDatabase() {
  console.log(`Initializing database... ${app.getPath("userData")}/agf.db`);
  const dbPath = join(app.getPath("userData"), "agf.db");
  db = Database(dbPath);
}

interface Migration {
  version: string;
  statement: string;
  name: string;
}

interface MigratorConfig {
  migrationDir: string;
  dbPath: string;
}

export class Migrator {
  private migrationsDir: string;
  private dbPath: string;
  private db: Database.Database;

  constructor(config: MigratorConfig) {
    this.migrationsDir = config.migrationDir;
    this.dbPath = config.dbPath;
    this.db = new Database(this.dbPath);
  }

  ensureSchema() {
    const q = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT NOT NULL PRIMARY KEY,
      statement TEXT,
      name TEXT
    )`.trim();
    this.db.exec(q);
  }

  // Migrate the database to the latest version
  // TODO: Break this up
  async migrate() {
    this.ensureSchema();
    const dbMigrations = this.db.prepare("SELECT * FROM schema_migrations order by version").all() as Migration[];
    const dbVersion = dbMigrations[dbMigrations.length - 1]?.version || "0";

    // File name format: <version>_<name>.sql
    // Where version is a timestamp in the format YYYYMMDDHHMMSS
    // This format is lexicographically sortable
    const files = fs.readdirSync(this.migrationsDir);
    files.sort();
    const fileVersion = files[files.length - 1]?.split("_")[0] || "0";

    if (dbVersion === fileVersion) {
      log("Database is up to date");
      return;
    }

    if (dbVersion > fileVersion) {
      log(`Database version ${dbVersion} is ahead of file version ${fileVersion}`);
      return;
    }

    log(`Database version ${dbVersion} is behind file version ${fileVersion}`);
    log("Starting migration...");

    log(`Backing up db to ${this.dbPath}.bak`);
    fs.copyFileSync(this.dbPath, `${this.dbPath}.bak`);
    log("Backup complete.");

    log("Upgrading database...");
    const newMigrations = files.filter((file) => file > dbVersion);

    try {
      newMigrations.forEach((file) => {
        const [version, name] = file.split("_");
        const statement = fs.readFileSync(join(this.migrationsDir, file), { encoding: "utf8" });
        this.db.exec(statement);
        this.db
          .prepare("INSERT INTO schema_migrations (version, statement, name) VALUES (?, ?, ?)")
          .run(version, statement, name);
        log(`Migrated to version ${version}`);
      });

      log("Migration complete.");
    } catch (e) {
      log("Migration failed. Restoring database...");
      await this.restoreDB();
      log("Database restored.");
    }
  }

  async restoreDB() {
    const backupPath = `${this.dbPath}.bak`;
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, this.dbPath);
    }
  }
}

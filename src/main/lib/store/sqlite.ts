import Database from "better-sqlite3";
import { dbPath } from "../utils";

let db: Database.Database;

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

function run(query: string, params: [] = []): RunResult {
  let stmt = db.prepare(query);
  return stmt.run(...params);
}

function all(query: string, params: [] = []) {
  let stmt = db.prepare(query);
  return stmt.all(...params);
}

function get(query: string, params: [] = []) {
  let stmt = db.prepare(query);
  const res = stmt.get(...params);
  if (!res) {
    throw new Error("No result found");
  }
  return res;
}

/**
 * Initializes the database connection.
 */
async function init() {
  db = Database(dbPath);

  // TODO: run migrations on install
  // New install
  // if (!fs.existsSync(dbPath)) {
  //   // const migrator = new Migrator({ migrationDir: migrationsDir, dbPath });
  //   // migrator.migrate();
  // }
}

export default {
  init,
  run,
  all,
  get
};

// interface Migration {
//   version: string;
//   statement: string;
//   name: string;
// }

// interface MigratorConfig {
//   migrationDir: string;
//   dbPath: string;
// }

// export class Migrator {
//   private migrationsDir: string;
//   private dbPath: string;
//   private db: Database.Database;

//   constructor(config: MigratorConfig) {
//     this.migrationsDir = config.migrationDir;
//     this.dbPath = config.dbPath;
//     this.db = new Database(this.dbPath);
//   }

//   ensureSchema() {
//     const q = `
//     CREATE TABLE IF NOT EXISTS schema_migrations (
//       version TEXT NOT NULL PRIMARY KEY,
//       statement TEXT,
//       name TEXT
//     )`.trim();
//     this.db.exec(q);
//   }

//   // Migrate the database to the latest version
//   // TODO: Break this up
//   async migrate() {
//     this.ensureSchema();
//     const dbMigrations = this.db.prepare("SELECT * FROM schema_migrations order by version").all() as Migration[];
//     const dbVersion = dbMigrations[dbMigrations.length - 1]?.version || "0";

//     // File name format: <version>_<name>.sql
//     // Where version is a timestamp in the format YYYYMMDDHHMMSS
//     // This format is lexicographically sortable
//     const files = fs.readdirSync(this.migrationsDir);
//     files.sort();
//     const fileVersion = files[files.length - 1]?.split("_")[0] || "0";

//     if (dbVersion === fileVersion) {
//       console.log("Database is up to date");
//       return;
//     }

//     if (dbVersion > fileVersion) {
//       console.log(`Database version ${dbVersion} is ahead of file version ${fileVersion}`);
//       return;
//     }

//     console.log(`Database version ${dbVersion} is behind file version ${fileVersion}`);
//     console.log("Starting migration...");

//     console.log(`Backing up db to ${this.dbPath}.bak`);
//     fs.copyFileSync(this.dbPath, `${this.dbPath}.bak`);
//     console.log("Backup complete.");

//     console.log("Upgrading database...");
//     const newMigrations = files.filter((file) => file > dbVersion);

//     try {
//       newMigrations.forEach((file) => {
//         const [version, name] = file.split("_");
//         const statement = fs.readFileSync(join(this.migrationsDir, file), { encoding: "utf8" });
//         this.db.exec(statement);
//         this.db
//           .prepare("INSERT INTO schema_migrations (version, statement, name) VALUES (?, ?, ?)")
//           .run(version, statement, name);
//         console.log(`Migrated to version ${version}`);
//       });

//       console.log("Migration complete.");
//     } catch (e) {
//       console.log("Migration failed. Restoring database...");
//       await this.restoreDB();
//       console.log("Database restored.");
//     }
//   }

//   async restoreDB() {
//     const backupPath = `${this.dbPath}.bak`;
//     if (fs.existsSync(backupPath)) {
//       fs.copyFileSync(backupPath, this.dbPath);
//     }
//   }
// }

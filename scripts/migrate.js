const { app } = require("electron");
const Database = require("better-sqlite3");
const fsp = require("fs").promises;
const path = require("path");
const { join, dirname } = require("path");

let projectRootPath;
let userData;
let dbPath;
let db;
let migrationsPath;

(async () => {
  try {
    projectRootPath = dirname(app.getAppPath());
    // When this script is ran with the `electron` cli, the app path is under `~/blah/blah/Electron/`
    // we want it to be `~/blah/blah/agf/`
    userData = join(dirname(app.getPath("userData")), "agf");
    dbPath = join(userData, "agf.db");
    db = new Database(dbPath);
    migrationsPath = join(projectRootPath, "resources/migrations");

    const migrationsRes = await getMigrations();
    ensureSchemaMigrationsTable();
    if (migrationsRes.kind === "err") {
      throw migrationsRes.error;
    }
    const runRes = runMigrations(migrationsRes.value);
    if (runRes.kind === "err") {
      throw runRes.error;
    }
  } catch (e) {
    console.error("Error running migrations.");
    console.error(e);
  } finally {
    console.log("Migrations ran successfully.");
    app.exit();
  }
})();

function ensureSchemaMigrationsTable() {
  const q = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT NOT NULL PRIMARY KEY,
      statement TEXT,
      name TEXT
    )`;
  db.exec(q);
}

async function runMigrations(migrations) {
  try {
    for (const migration of migrations) {
      console.log(`Running migration ${migration.version} - ${migration.name}`);
      db.exec(migration.statement);
      db.prepare("INSERT INTO schema_migrations (version, statement, name) VALUES (?, ?, ?)").run(
        migration.version,
        migration.statement,
        migration.name
      );
    }
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getMigrations() {
  try {
    const files = await fsp.readdir(migrationsPath);
    const migrations = [];

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

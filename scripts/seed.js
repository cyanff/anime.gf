const Database = require("better-sqlite3");
const os = require("os");
const { join } = require("path");
const fs = require("fs");
const remote = require("electron").remote;
const { app } = require("electron");

const dbPath = join(os.homedir(), ".config/agf/agf.db");
const db = new Database(dbPath);

console.log(process.cwd());
const statement = fs.readFileSync(join(process.cwd(), "/scripts/seed.sql"), { encoding: "utf-8" });
try {
  db.exec(statement);
} catch (e) {
  console.log("Error seeding database.");
  console.error(e);
  app.exit(1);
}

console.log("Database seeded successfully.");
app.exit(0);

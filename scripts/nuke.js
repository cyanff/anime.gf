const os = require("os");
const { unlinkSync } = require("fs");
const { join } = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = join(os.homedir(), ".config/agf/agf.db");

if (!fs.existsSync(dbPath)) {
  console.log("Database already does not exist.");
  return;
}
// Delete and recreate the database
unlinkSync(dbPath);
Database(dbPath);
console.log("Database nuked successfully.");

const os = require("os");
const { unlinkSync } = require("fs");
const { join } = require("path");
const fs = require("fs");

const dbPath = join(os.homedir(), ".config/agf/agf.db");

if (!fs.existsSync(dbPath)) {
  console.log("Database already does not exist.");
  return;
}
unlinkSync(dbPath);
console.log("Database deleted successfully.");

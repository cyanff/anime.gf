const Database = require("better-sqlite3");
const os = require("os");
const { join } = require("path");
const fs = require("fs");
const { app } = require("electron");

const cwd = process.cwd();

// Seed db
const dbPath = join(os.homedir(), ".config/agf/agf.db");
const db = new Database(dbPath);
const statement = fs.readFileSync(join(cwd, "/scripts/seed.sql"), { encoding: "utf-8" });
try {
  db.exec(statement);
} catch (e) {
  console.log("Error seeding database.");
  console.error(e);
  app.exit(1);
}
console.log("Database seeded successfully.");

// Seed blob storage data
const src = join(cwd, "/scripts/blob");
const dest = join(os.homedir(), ".config/agf/blob");

copyFolder(src, dest);
function copyFolder(src, dest) {
  // Create destination folder if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  // Read the contents of the source folder
  fs.readdirSync(src).forEach((file) => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      // Recurse
      copyFolder(srcPath, destPath);
    } else {
      // Copy file to dest
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
console.log("Blob storage seeded successfully.");

app.exit(0);

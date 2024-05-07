const Database = require("better-sqlite3");
const os = require("os");
const { join } = require("path");
const fs = require("fs");
const { app } = require("electron");
const { dirname } = require("path");

let projectRootPath;
let userData;
let dbPath;
let db;

(async () => {
  try {
    projectRootPath = dirname(app.getAppPath());
    // When this script is ran with the `electron` cli, the app path is under `~/blah/blah/Electron/`
    // we want it to be `~/blah/blah/agf/`
    userData = join(dirname(app.getPath("userData")), "agf");
    dbPath = join(userData, "agf.db");
    db = new Database(dbPath);
    const statement = fs.readFileSync(join(projectRootPath, "/scripts/seed.sql"), { encoding: "utf-8" });

    // Seed blob storage data
    const src = join(projectRootPath, "/scripts/blob");
    const dest = join(userData, "/blob");
    copyFolder(src, dest);

    // Seed database
    db.exec(statement);
  } catch (e) {
    console.log("Error seeding database.");
    console.error(e);
  } finally {
    console.log("Database seeded successfully.");
    app.exit();
  }
})();

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

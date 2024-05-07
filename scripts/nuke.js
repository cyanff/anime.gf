const { app } = require("electron");
const { join, dirname } = require("path");
const fs = require("fs").promises;

(async () => {
  try {
    const userData = join(dirname(app.getPath("userData")), "agf");
    const dbPath = join(userData, "agf.db");
    const blobPath = join(userData, "blob");

    if (!(await attainable(dbPath))) {
      console.log("Database already does not exist.");
      console.log("Creating a new, empty database.");
      await fs.writeFile(dbPath, "");
      process.exit(0);
    }

    // Delete and recreate the database
    await fs.unlink(dbPath);
    await fs.writeFile(dbPath, "");

    // Delete the blob directory
    await fs.rm(blobPath, { recursive: true, force: true });

    console.log("Database & blob storage nuked successfully.");
  } catch (error) {
    console.error("Error nuking database and blob storage:");
    console.error(error);
  } finally {
    app.exit();
  }
})();

async function attainable(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

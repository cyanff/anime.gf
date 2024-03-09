const path = require("path");
const fs = require("fs");

// Create a new migration file process.cwd()/migrations
const migrationDir = path.join(process.cwd(), "migrations");

if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir);
}

const migrationName = process.argv[2];
const template = `-- ${migrationName}
begin transaction;
commit;
`;

// YYYYMMDDHHmmss
const timestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, "")
  .slice(0, 14);

// Create a new migration file with name: <timestamp>_<migrationName>.sql
// Write the template to the file
fs.writeFileSync(path.join(migrationDir, `${timestamp}_${migrationName}.sql`), template);

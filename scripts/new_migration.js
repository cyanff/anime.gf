const path = require("path");
const fs = require("fs");

const migrationDir = path.join(process.cwd(), "resources/migrations");

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
fs.writeFileSync(path.join(migrationDir, `${timestamp}_${migrationName}.sql`), template);

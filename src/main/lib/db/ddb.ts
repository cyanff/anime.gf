import fs from "fs/promises";
import { join } from "path";
import { fileExists } from "../utils/misc";

let ddbPath = join(process.cwd(), "ddb.json");
export async function get(): Promise<Object> {
  const dbExists = await fileExists(ddbPath);
  if (!dbExists) {
    await fs.writeFile(ddbPath, JSON.stringify({}, null, 2));
  }
  const db = await fs.readFile(ddbPath, "utf-8");
  return JSON.parse(db);
}

export async function write(ddb: Object) {
  fs.writeFile(ddbPath, JSON.stringify(ddb, null, 2));
}

export default {
  get,
  write
};

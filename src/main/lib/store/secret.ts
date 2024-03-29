import fs from "fs/promises";
import { fileExistsAndAccessible, secretsPath } from "../utils";

async function init() {
  const secretsFileExists = await fileExistsAndAccessible(secretsPath);
  if (!secretsFileExists) {
    await fs.writeFile(secretsPath, JSON.stringify({}));
  }
}

async function get(key: string): Promise<string | undefined> {
  const secrets = JSON.parse(await fs.readFile(secretsPath, "utf-8"));
  return secrets[key];
}

async function set(key: string, value: string): Promise<void> {
  const secrets = JSON.parse(await fs.readFile(secretsPath, "utf-8"));
  secrets[key] = value;
  await fs.writeFile(secretsPath, JSON.stringify(secrets));
}

export default {
  init,
  get,
  set
};

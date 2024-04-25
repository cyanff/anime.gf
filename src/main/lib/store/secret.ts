import { Result, isError } from "@shared/utils";
import fs from "fs/promises";
import { attainable, secretsPath } from "../utils";

async function init() {
  const secretsFileExists = await attainable(secretsPath);
  if (!secretsFileExists) {
    await fs.writeFile(secretsPath, JSON.stringify({}));
  }
}

async function get(k: string): Promise<Result<string, Error>> {
  try {
    const secrets = JSON.parse(await fs.readFile(secretsPath, "utf-8"));
    return { kind: "ok", value: secrets[k] };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function set(k: string, v: string): Promise<Result<void, Error>> {
  try {
    const secrets = JSON.parse(await fs.readFile(secretsPath, "utf-8"));
    secrets[k] = v;
    await fs.writeFile(secretsPath, JSON.stringify(secrets, null, 2));
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export default {
  init,
  get,
  set
};

import { config } from "@shared/config";
import { Result, Settings } from "@shared/types";
import fs from "fs/promises";
import { attainable, settingsPath } from "../utils";

async function init() {
  const settingsFileExists = await attainable(settingsPath);
  const defaultSettings: Settings = config.defaultSettings;
  if (!settingsFileExists) {
    await fs.writeFile(settingsPath, JSON.stringify(defaultSettings));
  }
}

async function get(): Promise<Result<Settings, Error>> {
  try {
    const settings = JSON.parse(await fs.readFile(settingsPath, "utf-8"));
    return { kind: "ok", value: settings };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function set(settings: any): Promise<Result<void, Error>> {
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export default {
  init,
  get,
  set
};

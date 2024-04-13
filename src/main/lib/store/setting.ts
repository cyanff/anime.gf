import fs from "fs/promises";
import { attainable, settingsPath } from "../utils";
import { Result, isError } from "@shared/utils";
import { Settings } from "@shared/types";

async function init() {
  const settingsFileExists = await attainable(settingsPath);
  const defaultSettings: Settings = {
    chat: {
      provider: "anthropic",
      model: "claude-3-haiku-20240307",
      maxReplyTokens: 256,
      temperature: 0.7,
      topP: 1,
      topK: 50,
      maxContextTokens: 2048,
      jailbreak: "",
      streaming: true
    }
  };
  if (!settingsFileExists) {
    await fs.writeFile(settingsPath, JSON.stringify(defaultSettings));
  }
}

async function get(): Promise<Result<Settings, Error>> {
  try {
    const settings = JSON.parse(await fs.readFile(settingsPath, "utf-8"));
    return { kind: "ok", value: settings };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function set(settings: any): Promise<Result<void, Error>> {
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
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

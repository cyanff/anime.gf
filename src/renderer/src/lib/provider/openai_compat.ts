import { Provider, ProviderConfig, ProviderE, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";
import { joinPaths } from "@tanstack/router";
import { XFetchConfig } from "src/main/lib/xfetch";
import { v4 } from "uuid";

interface ChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  system_fingerprint: string;
  choices: Choice[];
  usage: Usage;
}
interface Choice {
  index: number;
  message: Message;
  logprobs: null;
  finish_reason: string;
}
interface Message {
  role: "user" | "assistant";
  content: string;
}
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

async function getModels(): Promise<Result<string[], Error>> {
  const models = [];
  return { kind: "ok", value: models };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: ProviderConfig,
  onRequestSent?: (uuid: string) => void
): Promise<Result<string, Error>> {
  if (!config.url) {
    return { kind: "err", error: new Error("Using a custom OpenAI API compatible endpoint but no URL provided.") };
  }

  let key;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get(ProviderE.OPENAI_COMPAT);
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const localhostReplacedURL = config.url.replace("localhost", "127.0.0.1");
  const url = joinPaths([localhostReplacedURL, "/chat/completions"]);

  const headers = {
    Authorization: `Bearer ${key}`
  };

  // Append a system prompt if specified
  const reqMessages = config.system ? [{ role: "system", content: config.system }, ...messages] : messages;
  const body: any = {
    model: config.model,
    messages: reqMessages
  };
  if (config.maxTokens !== undefined) {
    body.max_tokens = config.maxTokens;
  }
  if (config.stop !== undefined) {
    body.stop = config.stop;
  }
  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }
  if (config.topP !== undefined) {
    body.top_p = config.topP;
  }

  const xfetchConfig: XFetchConfig = {};
  const requestUUID = v4();
  if (onRequestSent) xfetchConfig.uuid = requestUUID;
  onRequestSent?.(requestUUID);
  const completionRes = await window.api.xfetch.post(url, body, headers, xfetchConfig);
  if (completionRes.kind == "err") {
    return completionRes;
  }

  const completion = completionRes.value as ChatCompletion;
  return { kind: "ok", value: completion.choices[0].message.content };
}

async function streamChatCompletion(): Promise<any> {
  throw new Error("Not implemented");
}

export const openAICompat: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion
};

import { CompletionConfig, Provider, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";

interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

interface Choice {
  index: number;
  message: Message;
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
  return {
    kind: "ok",
    value: [
      "open-mistral-7b",
      "open-mixtral-8x7b",
      "mistral-small-latest",
      "mistral-medium-latest",
      "mistral-large-latest"
    ]
  };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: CompletionConfig
): Promise<Result<string, Error>> {
  // Get API key from either config or secret store
  let key: string;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get("mistral");
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const url = "https://api.mistral.ai/v1/chat/completions";
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${key}`
  };

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

  const completionRes = await window.api.xfetch.post(url, body, headers);
  if (completionRes.kind == "err") {
    return completionRes;
  }

  const completion = completionRes.value as ChatCompletion;
  return { kind: "ok", value: completion.choices[0].message.content };
}

async function streamChatCompletion(): Promise<any> {
  throw new Error("Not implemented");
}

async function getTextCompletion(): Promise<Result<string, Error>> {
  throw new Error("Not implemented");
}

export const mistral: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

import { Provider } from "@/lib/provider/provider";
import { Result } from "@shared/utils";
import { ProviderMessages, CompletionConfig } from "@/lib/provider/provider";

const models = ["mistralai/Mixtral-8x7B-Instruct-v0.1", "NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT"];

interface ChatCompletion {
  id: string;
  choices: Choice[];
  usage: Usage;
  created: number;
  model: string;
}
interface Choice {
  message: Message;
  finish_reason: string;
  index: number;
}
interface Message {
  content: string;
  role: string;
}
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

function getModels(): string[] {
  return [...models];
}

async function getChatCompletion(messages: ProviderMessages, config: CompletionConfig): Promise<Result<string, Error>> {
  const validationRes = validateConfig(config);
  if (validationRes.kind == "err") {
    return validationRes;
  }

  // Get API key from either config or secret store
  let key: string;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get("together_ai");
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const url = "https://api.together.xyz/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${key}`
  };
  const reqMessages = config.system ? [{ role: "system", content: config.system }, ...messages] : messages;
  const body: any = {
    model: config.model,
    messages: reqMessages
  };
  if (config.max_tokens !== undefined) {
    body.max_tokens = config.max_tokens;
  }
  if (config.stop !== undefined) {
    body.stop = config.stop;
  }
  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }
  if (config.top_p !== undefined) {
    body.top_p = config.top_p;
  }
  if (config.top_k !== undefined) {
    body.top_k = config.top_k;
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

function validateConfig(config: CompletionConfig): Result<void, Error> {
  if (!models.includes(config.model)) {
    return { kind: "err", error: new Error("Invalid model specified in CompletionConfig") };
  }
  return { kind: "ok", value: undefined };
}

export const togetherAI: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

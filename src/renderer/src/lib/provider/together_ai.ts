import { CompletionConfig, Provider, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";

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

async function getModels(): Promise<Result<string[], Error>> {
  interface Data
    extends Array<{
      // The official model name, ex: nousresearch/nous-hermes-2-mixtral-8x7b-sft
      id: string;
      object: string;
      created: number;
      type: string;
      display_name: string;
    }> {}

  const url = "https://api.together.xyz/v1/models";
  const keyRes = await window.api.secret.get("together_ai");
  if (keyRes.kind == "err") {
    return keyRes;
  }

  const key = keyRes.value;
  const headers = {
    Authorization: `Bearer ${key}`
  };

  const modelsRes = await window.api.xfetch.get(url, headers, { timeout: 5000 });
  if (modelsRes.kind == "err") {
    return modelsRes;
  }

  const data = modelsRes.value as Data;
  const models = data.filter((model) => model.type === "chat").map((model) => model.id);
  return { kind: "ok", value: models };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: CompletionConfig
): Promise<Result<string, Error>> {
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
  if (config.topK !== undefined) {
    body.top_k = config.topK;
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

export const togetherAI: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

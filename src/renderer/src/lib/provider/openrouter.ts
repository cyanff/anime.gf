import { CompletionConfig, Provider, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";

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

// TODO implement fetch
async function getModels(): Promise<Result<string[], Error>> {
  interface Data
    extends Array<{
      // The official model name, ex: nousresearch/nous-hermes-2-mixtral-8x7b-sft
      id: string;
      architecture: {
        modality: "text" | "chat" | "multimodal";
        tokenizer: string;
        instruct_type: string;
      };
    }> {}
  const url = "https://openrouter.ai/api/v1/models";
  const keyRes = await window.api.secret.get("openrouter");
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
  const data = modelsRes.value.data as Data;

  const filtered = data.filter((model) => {
    const isChat = model.architecture.modality === "chat";
    const isMultimodal = model.architecture.modality === "multimodal";
    // Open router lists many chat models as modality = text
    // This is a hacky heuristic to filter out chat models
    const isChatInName = model.id.includes("chat");
    return isChat || isMultimodal || isChatInName;
  });

  const models = filtered.map((model) => model.id);
  return { kind: "ok", value: models };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: CompletionConfig
): Promise<Result<string, Error>> {
  // Get API key from either config or secret store
  const keyRes = await window.api.secret.get("openrouter");
  if (keyRes.kind == "err") {
    return keyRes;
  }
  const key = keyRes.value;

  const url = "https://openrouter.ai/api/v1/chat/completions";
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

export const openrouter: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion
};

import { CompletionConfig, Provider, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";

interface ChatCompletion {
  id: string;
  type: "message";
  role: "assistant";
  content: Content[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: Usage;
}

interface Content {
  type: "text";
  text: string;
}

interface Usage {
  input_tokens: number;
  output_tokens: number;
}

async function getModels(): Promise<Result<string[], Error>> {
  return { kind: "ok", value: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"] };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: CompletionConfig
): Promise<Result<string, Error>> {
  // Get API key from either config or secret store
  let key: string;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get("anthropic");
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const url = "https://api.anthropic.com/v1/messages";
  const headers = {
    "x-api-key": key,
    "anthropic-version": "2023-06-01"
  };

  const body: any = {
    model: config.model,
    messages: messages,
    max_tokens: config.maxTokens || 1024
  };
  if (config.system) {
    body.system = config.system;
  }
  if (config.maxTokens !== undefined) {
    body.max_tokens = config.maxTokens;
  }
  if (config.stop !== undefined) {
    body.stop_sequences = config.stop;
  }
  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }
  if (config.topP !== undefined) {
    body.top_p = config.topP;
  }
  if (config.topK !== undefined) {
    body.top_p = config.topP;
  }

  const completionRes = await window.api.xfetch.post(url, body, headers);
  if (completionRes.kind == "err") {
    return completionRes;
  }

  const completion = completionRes.value as ChatCompletion;
  return { kind: "ok", value: completion.content[0].text };
}

async function streamChatCompletion(): Promise<any> {
  throw new Error("Not implemented");
}

async function getTextCompletion(): Promise<Result<string, Error>> {
  throw new Error("Not implemented");
}

export const anthropic: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

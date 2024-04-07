import { Provider } from "@/lib/provider/provider";
import { Result, isError } from "@shared/utils";
import { ProviderMessages, CompletionConfig } from "@/lib/provider/provider";

const models = ["gpt-3.5-turbo", "gpt-4.0-turbo-preview"];
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

function getModels(): string[] {
  return [...models];
}

/**
 * Sends a request to the OpenAI API to get a chat completion based on the provided messages and configuration.
 * @param messages - The messages to use as context for the chat completion.
 * @param config - The configuration options for the chat completion request.
 * @returns A promise that resolves to a Result containing the chat completion string if successful, or an Error if the request fails.
 */ async function getChatCompletion(
  messages: ProviderMessages,
  config: CompletionConfig
): Promise<Result<string, Error>> {
  const validationRes = validateConfig(config);
  if (validationRes.kind == "err") {
    return validationRes;
  }

  // Get API key from either config or secret store
  let key;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get("openai");
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${key}`
  };

  // Append a system prompt if specified
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

export const openAI: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

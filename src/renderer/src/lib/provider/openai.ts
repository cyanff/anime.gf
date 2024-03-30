import { Provider } from "@/lib/provider/provider";
import { Result } from "@shared/utils";
import { Messages, CompletionConfig } from "@/lib/provider/provider";

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

// TODO add system message to the messages array if specifed
async function getChatCompletion(messages: Messages, config: CompletionConfig): Promise<Result<string, Error>> {
  const keyRes = await window.api.secret.get("openai");
  if (keyRes.kind == "err") {
    return keyRes;
  }
  const url = "https://api.openai.com/v1/chat/completions";
  const headers = {
    Authorization: `Bearer ${keyRes.value}`
  };
  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: "Respond by saying hello. And nothing else"
      }
    ]
  };

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

export const openAI: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion,
  getTextCompletion
};

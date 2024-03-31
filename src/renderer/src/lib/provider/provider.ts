import { Result } from "@shared/utils";
import { openAI } from "@/lib/provider/openai";
import { anthropic } from "./anthropic";
// import mistral from "./mistral";
// import togetherAI from "./togetherAI";

export interface Provider {
  getModels(): string[];
  getChatCompletion(messages: Messages, config: CompletionConfig): Promise<Result<string, Error>>;
  streamChatCompletion(): any;
  getTextCompletion(): Promise<Result<string, Error>>;
}

export enum ProviderE {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  MISTRAL = "mistral",
  TOGETHER_AI = "together_ai"
}

export function getProvider(provider: ProviderE): Provider {
  switch (provider) {
    case ProviderE.OPENAI:
      return openAI;
    case ProviderE.ANTHROPIC:
      return anthropic;
    default:
      throw new Error("Invalid provider given to getProvider()");
  }
}

export interface Messages extends Array<{ role: string; content: string }> {}

export interface CompletionConfig {
  apiKey?: string;
  model: string;
  system?: string;
  stop?: string[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

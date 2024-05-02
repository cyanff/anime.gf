import { openAI } from "@/lib/provider/openai";
import { togetherAI } from "@/lib/provider/together_ai";
import { Result } from "@shared/types";
import { anthropic } from "./anthropic";
import { mistral } from "./mistral";
import { openAICompat } from "./openai_compat";

export interface ProviderMessage {
  role: string;
  content: string;
}

export interface CompletionConfig {
  apiKey?: string;
  model: string;
  url?: string;
  system?: string;
  stop?: string[];
  maxTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface Provider {
  getModels(): Promise<Result<string[], Error>>;
  getChatCompletion(messages: ProviderMessage[], config: CompletionConfig): Promise<Result<string, Error>>;
  streamChatCompletion(): any;
  getTextCompletion(): Promise<Result<string, Error>>;
}

export enum ProviderE {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  MISTRAL = "mistral",
  TOGETHER_AI = "together_ai",
  OPENAI_COMPAT = "openai_compat"
}
export function getProvider(provider: ProviderE): Provider {
  switch (provider) {
    case ProviderE.OPENAI:
      return openAI;
    case ProviderE.ANTHROPIC:
      return anthropic;
    case ProviderE.TOGETHER_AI:
      return togetherAI;
    case ProviderE.MISTRAL:
      return mistral;
    case ProviderE.OPENAI_COMPAT:
      return openAICompat;
    default:
      throw new Error("Invalid provider given to getProvider()");
  }
}

export interface NameAndValue {
  name: string;
  value: ProviderE;
}

/**
 * Returns an array of `NameAndValue` objects representing the available providers.
 * Each object has a `name` property with the human-readable name of the provider,
 * and a `value` property with the corresponding `ProviderE` enum value.
 * @returns {NameAndValue[]} An array of `NameAndValue` objects.
 */
export function getProvidersNameAndValue(): NameAndValue[] {
  return [
    { name: "OpenAI", value: ProviderE.OPENAI },
    { name: "Anthropic", value: ProviderE.ANTHROPIC },
    { name: "Mistral", value: ProviderE.MISTRAL },
    { name: "Together AI", value: ProviderE.TOGETHER_AI },
    { name: "OpenAI Compatible API", value: ProviderE.OPENAI_COMPAT }
  ];
}

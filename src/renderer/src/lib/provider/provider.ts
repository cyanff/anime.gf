import { Result } from "@shared/utils";
// import anthropic from "./anthropic";
// import mistral from "./mistral";
// import togetherAI from "./togetherAI";

export interface Provider {
  // getChatCompletion
  getChatCompletion(): Promise<Result<string, Error>>;
  // getTextCompletion
  getTextCompletion(): Promise<Result<string, Error>>;
}

export enum ProviderEnum {
  OPEN_AI = "OpenAI",
  ANTHROPIC = "Anthropic",
  MISTRAL = "Mistral",
  TOGETHER_AI = "TogetherAI"
}

export function getProvider(providerEnum: ProviderEnum): Provider {
  switch (providerEnum) {
    //   case ProviderEnum.OPEN_AI:
    //     return provider;
    // case ProviderEnum.ANTHROPIC:
    //   return anthropic;
    // case ProviderEnum.MISTRAL:
    //   return mistral;
    // case ProviderEnum.TOGETHER_AI:
    //   return togetherAI;
    default:
      throw new Error("Invalid provider enum");
  }
}

import { Provider } from "@/lib/provider/provider";
import { Result } from "@shared/utils";

export interface OpenAIConfig {}

async function getChatCompletion(): Promise<Result<string, Error>> {
  throw new Error("Not implemented");
}

async function getTextCompletion(): Promise<Result<string, Error>> {
  throw new Error("Not implemented");
}

export async function test() {}

export const openAI: Provider = {
  getChatCompletion,
  getTextCompletion
};

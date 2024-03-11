/**
 *  Shared tokenizer instance for the entire app
 */
import { PreTrainedTokenizer } from "@xenova/transformers";
import { LLMEnum } from "./llm";
import { EmbeddingEnum } from "./embed";


// Configure Transformers.js to use only use local tokenizer files
import("@xenova/transformers").then(({ env }) => {
  env.allowLocalModels = true;
  env.localModelPath = "./tokenizers";
});

// Global tokenizer cache
let tokenizers: Map<string, PreTrainedTokenizer> = new Map();

export async function getTokenizer(model: LLMEnum | EmbeddingEnum): Promise<PreTrainedTokenizer> {
  if (tokenizers.has(model)) {
    return tokenizers.get(model)!;
  }

  // No tokenizer found, initialize, cache, and return it
  let { AutoTokenizer } = await import("@xenova/transformers");
  let tokenizer = await AutoTokenizer.from_pretrained(model, { local_files_only: true });
  tokenizers.set(model, tokenizer);
  return tokenizer;
}

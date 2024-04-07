import { fallback } from "@/lib/tokenizer/fallback";

export interface Tokenizer {
  countTokens(str: string): number;
}

/**
 * Returns the appropriate tokenizer implementation based on the specified model.
 * If no specific tokenizer is available for the given model, the fallback tokenizer is returned.
 *
 * @param model - The name of the model to get the tokenizer for.
 * @returns The tokenizer implementation for the specified model, or the fallback tokenizer if no specific implementation is available.
 */
export function getTokenizer(model: string) {
  switch (model) {
    default:
      return fallback;
  }
}

import { Tokenizer } from "@/lib/tokenizer/provider";

function countTokens(str: string): number {
  const wordCount = str.split(" ").length;
  return Math.round(wordCount * (3 / 4));
}

export const fallback: Tokenizer = {
  countTokens
};

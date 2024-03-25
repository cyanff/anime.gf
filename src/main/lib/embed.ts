// @ts-ignore
import { pipeline } from "@xenova/transformers";

export enum EmbeddingEnum {
  GTE_SMALL = "gte_small"
}

// Initialize the pipeline once
const generateEmbedding = await pipeline("feature-extraction", EmbeddingEnum.GTE_SMALL);

/**
 * Generates an embedding given a string
 * @param body The string to the generate an embedding for
 * @returns The embedding as an array
 */
export async function embed(body: string) {
  // Generate a vector using Transformers.js
  const output = await generateEmbedding(body, {
    pooling: "mean",
    normalize: true
  });

  // Extract the embedding output
  const embedding = Array.from(output.data);

  return embedding;
}

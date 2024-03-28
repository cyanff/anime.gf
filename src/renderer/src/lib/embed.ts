const TransformersApi = Function('return import("@xenova/transformers")')();

// Initialize the pipeline once
let generateEmbedding;
async function intializePipeline() {
  const { pipeline } = await TransformersApi;
  generateEmbedding = await pipeline("feature-extraction", "Supabase/gte-small");
}
intializePipeline();

/**
 * Generates an embedding given a string
 * @param body The string to the generate an embedding for
 * @returns The embedding as an array
 */
export async function embed(body: string): Promise<number[]> {
  // Generate a vector using Transformers.js
  const output = await generateEmbedding(body, {
    pooling: "mean",
    normalize: true
  });

  // Extract the embedding output
  const embedding = Array.from(output.data) as number[];

  return embedding;
}

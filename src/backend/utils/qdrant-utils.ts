import { QdrantClient } from "@qdrant/js-client-rest";

let qdrantClient: QdrantClient;
/**
 * Initializes the Qdrant client running locally
 */
export function initalizeQdrantClient() {
  qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });
}
export { qdrantClient };

/**
 * Creates a collection with the specified ID
 * @param id - The ID of the collection
 */
export function createCollection(id: number) {
  qdrantClient.createCollection(`${id}`, {
    vectors: {
      size: 384,
      distance: "Cosine"
    },
    optimizers_config: {
      memmap_threshold: 20000
    },
    hnsw_config: {
      on_disk: true
    }
  });
}

/**
 * Searches a collection in Qdrant based on the provided parameters
 * @param id - The ID of the collection to search
 * @param vector - The vector to search for
 * @param limit - The maximum number of results to return
 * @returns A promise that resolves to the search result
 */
export async function searchCollection(id: number, vector: number[], limit: number) {
  let searchResult = await qdrantClient.search(`${id}`, {
    vector: vector,
    limit: limit
  });

  return searchResult;
}

/**
 * Deletes a collection with the specified ID
 * @param id - The ID of the collection to delete
 */
export function deleteCollection(id: number) {
  qdrantClient.deleteCollection(`${id}`);
}

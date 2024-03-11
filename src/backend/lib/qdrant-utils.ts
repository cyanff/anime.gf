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
 * Deletes a collection with the specified ID
 * @param id - The ID of the collection to delete
 */
export function deleteCollection(id: number) {
  qdrantClient.deleteCollection(`${id}`);
}

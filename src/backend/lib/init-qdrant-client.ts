import { QdrantClient } from "@qdrant/js-client-rest";

let qdrantClient: QdrantClient;
/**
 * Initializes the Qdrant client running locally
 */
export function initalizeQdrantClient() {
  qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });
}
export { qdrantClient };

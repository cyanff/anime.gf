import { QdrantClient } from "@qdrant/js-client-rest";

export async function createCollection() {
  // initialize client
  const client = new QdrantClient({ host: "localhost", port: 6333 });

  // create collection with cosine distance and hsnw indexes enabled
  client.createCollection("{collection_name}", {
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

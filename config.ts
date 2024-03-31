import { deepFreeze } from "@shared/utils";

// todo seperate mutable and immutable global configs
export const config = deepFreeze({
  vss: {
    LIMIT: 5
  },

  CONTEXT_TOKEN_LIMIT: 1024,
  CHUNK_TOKEN_LIMIT: 512
});

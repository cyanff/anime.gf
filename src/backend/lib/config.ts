import { deepFreeze } from "./utils";

/**
 * Global, fixed compile configurations
 */

// LLM Configs
///////////////////////////////////////////////////////////////
// The number tokens the llm should be passed from the chat history
const CONTEXT_TOKEN_LIMIT = 512;
// The token limit of the embedding chunk
const CHUNK_TOKEN_LIMIT = 128;
// The number of search results to query
const SEARCH_LIMIT = 3;
// How many times to attempt to get a valid JSON completion
const JSON_ATTEMPTS = 3;
const JSON_ATTEMPTS_DELAY = 3000;
///////////////////////////////////////////////////////////////

// Job Configs
///////////////////////////////////////////////////////////////
const jobs = deepFreeze({
  reply: {
    ATTEMPTS: 3,
    CHUNK_JOB_EVERY_N_REPLIES: 5
  },
  chunk: {
    ATTEMPTS: 1
  },
  sentiment: {
    ATTEMPTS: 1
  }
});

// Server Configs
///////////////////////////////////////////////////////////////
const SERVER_PORT = 4000;
const HEARTBEAT_INTERVAL = 30000;
///////////////////////////////////////////////////////////////

export default {
  CONTEXT_TOKEN_LIMIT,
  CHUNK_TOKEN_LIMIT,
  SEARCH_LIMIT,
  JSON_ATTEMPTS,
  JSON_ATTEMPTS_DELAY,
  HEARTBEAT_INTERVAL,
  SERVER_PORT,
};

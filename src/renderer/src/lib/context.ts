import { insertData, searchCollection } from "./db/qdrant";
import { embed } from "./embed";
import config from "../../../config";
import queries from "@/lib/queries";

export interface Persona {
  display_name: string;
}

export interface Character {
  display_name: string;
  system_prompt: string;
}

export interface Messages {
  content: string | null;
  inserted_at: string;
  sender_type: "user" | "character";
}

export interface RelevantContext {
  id: string | number;
  version: number;
  score: number;
  payload?: Record<string, any> | null;
  vector?:
    | Record<string, unknown>
    | number[]
    | { [key: string]: number[] | { indices: number[]; values: number[] } | undefined }
    | null;
}

export interface RawChunk {
  chat_id: number;
  msg: string;
  sender_type: string;
  inserted_at: string;
  updated_at: string;
  num_tokens: number;
  embedded: boolean;
}

export interface ChatContext {
  persona: Persona;
  character: Character;
  contextWindow: Messages[];
  relevantContext: RelevantContext[];
}

export async function getContext(chatID: number): Promise<ChatContext> {
  //await chunk(chatID);
  const contextWindow = await queries.getLatestMessages(chatID, config.CONTEXT_TOKEN_LIMIT);
  const persona = await queries.getPersona(chatID);
  const character = await queries.getCharacter(chatID);
  // const relevantContext = await getRelevantContext(chatID, contextWindow);
  let relevantContext = [];

  const chatContext: ChatContext = {
    persona: {
      display_name: persona.display_name
    },
    character: {
      display_name: character.display_name,
      system_prompt: character.system_prompt
    },
    contextWindow: contextWindow,
    relevantContext: relevantContext
  };

  return chatContext;
}

/**
 * Retrieves a chunk of data for a given chat ID, processes it, and inserts the processed data into the database.
 * @param chatID - The ID of the chat.
 * @returns A Promise that resolves when the chunk is processed and inserted into the database.
 */
export async function chunk(chatID: number) {
  const rawChunk = await queries.getUnembeddedChunk(chatID, config.CONTEXT_TOKEN_LIMIT, config.CHUNK_TOKEN_LIMIT);

  if (rawChunk.length === 0) {
    return;
  }

  // TODO: format raw chunk for LLM declarative summarization before embedding
  const processedChunk = "";
  const processedChunkEmbeddings = await embed(processedChunk);
  insertData(chatID, processedChunkEmbeddings, { chunk: rawChunk });
}


/**
 * Retrieves the relevant context for the chat.
 * @param chatID - The ID of the chat.
 * @param contextWindow - An array of context window messages.
 * @returns A promise that resolves to the relevant context.
 */
async function getRelevantContext(chatID: number, contextWindow: Messages[]): Promise<RelevantContext[]> {
  let embedding = await embed("PLACEHOLDER");
  const limit = config.vss.LIMIT;
  let relevantContext = await searchCollection(chatID, embedding, limit);
  return relevantContext;
}

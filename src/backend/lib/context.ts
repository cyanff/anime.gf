import { insertData, searchCollection } from "../utils/qdrant-utils";
import { embed } from "./embed";
import { Database, Tables } from "./types_db";
import { queryData, getLatestMessages, getUnembeddedChunk } from "../utils/sqlite-utils";
import config from "./config";
export interface Username {
  username: string;
}

export interface CharacterInfo {
  displayName: string;
  sysPrompt: string;
  metadata: Tables<"companions">["metadata"];
}

export interface ContextWindowMessage {
  content: string | null;
  inserted_at: string;
  sender_type: Database["public"]["Enums"]["sender_type_enum"];
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
  username: Username;
  characterInfo: CharacterInfo;
  contextWindow: ContextWindowMessage[];
  relevantContext: RelevantContext[];
}

export async function getContext(chatID: number): Promise<ChatContext> {
  await chunk(chatID);
  const contextWindow = await getContextWindow(chatID);
  const username = await getUsername(chatID);
  const characterInfo = await getCharacterInfo(chatID);
  const relevantContext = await getRelevantContext(chatID, contextWindow);

  const chatContext: ChatContext = {
    username: {
      username: username
    },
    characterInfo: {
      displayName: characterInfo.display_name,
      sysPrompt: characterInfo.sys_prompt,
      metadata: characterInfo.metadata
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
  const rawChunk: RawChunk[] = await getUnembeddedChunk(config.CONTEXT_TOKEN_LIMIT, config.CHUNK_TOKEN_LIMIT, chatID);

  // Check if rawChunk is empty
  if (rawChunk.length === 0) {
    console.log("Raw chunk is empty, skipping processing");
    return;
  }

  // TODO: format raw chunk for LLM declarative summarization before embedding
  const processedChunk = "";
  const processedChunkEmbeddings = await embed(processedChunk);
  insertData(chatID, processedChunkEmbeddings, {"chunk": rawChunk});
}

/**
 * Get the context window messages for a chat
 * @param chatID The chat to get the context window messages for
 * @returns An array of context window messages
 */
async function getContextWindow(chatID: number) {
  const contextWindow: any = await getLatestMessages(chatID, config.CONTEXT_TOKEN_LIMIT);

  // We only need these fields from each message
  const stripped = contextWindow.map((message) => {
    return {
      content: message.content,
      inserted_at: message.inserted_at,
      sender_type: message.sender_type
    };
  });

  return stripped;
}

async function getUsername(chatID: number) {}

async function getCharacterInfo(chatID: number) {}

/**
 * Retrieves the relevant context for the chat.
 * @param chatID - The ID of the chat.
 * @param contextWindow - An array of context window messages.
 * @returns A promise that resolves to the relevant context.
 */
async function getRelevantContext(chatID: number, contextWindow: ContextWindowMessage[]) {
  // Generate context window embeddings
  let contextWindowString = concatenateMessageContent(contextWindow);
  let contextWindowEmbeddings = await embed(contextWindowString);

  // Search for relevant context
  let relevantContext = await searchCollection(chatID, contextWindowEmbeddings, config.SEARCH_LIMIT);

  return relevantContext;
}

/**
 * Concatenates the content property from each message object into a single string
 *
 * @param messages - Array of messages
 * @returns String containing the concatenated messages
 */
export function concatenateMessageContent(messages: any[]): string {
  let messageString = "";
  if (messages) {
    messages.forEach((message) => {
      messageString += ` ${message.content}`;
    });
  }
  return `${messageString}`;
}

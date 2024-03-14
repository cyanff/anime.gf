import { searchCollection } from "../utils/qdrant-utils";
import { embed } from "./embed";
import { Database, Tables } from "./types_db";

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
  payload?: Record<string, unknown> | null;
  vector?: Record<string, unknown> | number[] | { [key: string]: number[] | { indices: number[]; values: number[]; } | undefined; } | null;
}

export interface ChatContext {
  username: Username;
  characterInfo: CharacterInfo;
  contextWindow: ContextWindowMessage[];
  relevantContext: RelevantContext[];
}

export async function getContext(chatID: number): Promise<ChatContext> {
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
 * Get the context window messages for a chat
 * @param chatID The chat to get the context window messages for
 * @returns An array of context window messages
 */
async function getContextWindow(chatID: number) {
  //   const { data: contextWindow, error: contextWindowErr } = await supabaseService.rpc("latest_messages_within_limit", {
  //     token_limit: config.CTX_TOKENS,
  //     m_chat_id: chatID
  //   });

  // We only need these fields from each message
  const stripped = contextWindow
    .map((message) => {
      return {
        content: message.content,
        inserted_at: message.inserted_at,
        sender_type: message.sender_type
      };
    })
    // The messages are ordered from newest to oldest, we need the opposite for the prompt
    .reverse();

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
 * Concatenates the content property from each context window message into a single string
 *
 * @param contextWindow - Array of context window messages
 * @returns String containing the concatenated messages
 */
export function concatenateMessageContent(contextWindow: ContextWindowMessage[]): string {
  let messageString = "";
  if (contextWindow) {
    contextWindow.forEach((message) => {
      messageString += ` ${message.content}`;
    });
  }
  return `${messageString}`;
}

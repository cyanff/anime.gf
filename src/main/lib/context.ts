/*
  Manages the *context* used at inference time.
  A context includes:
  - The system prompt
  - The array of messages (chat history)
*/

// In:
// - global config
//   - global user prompt template
// - chat history
// - persona
// - character card
//   - system prompt
//   - ...
// - chat template
// */

// // TODO:
// // clean abstraction for different chat templates
// // chatml, alpaca, etc
// // each model has its own template

// // completion apis
// // - chat
// // - text

// interface Params {
//   chatHistory: ChatHistory;
//   persona: Persona;
//   characterCard: CharacterCard;
// }

// function renderPrompt(param: Params) {}

// import { insertData, searchCollection } from "./db/qdrant";
// import { embed } from "./embed";
// import { queryData, getLatestMessages, getUnembeddedChunk } from "./db/sqlite";
// import config from "../../../config";

// export interface UserInfo {
//   name: string;
// }

// export interface CharacterInfo {
//   name: string;
//   prompt: string;
// }

// export interface Messages {
//   content: string | null;
//   inserted_at: string;
//   sender_type: "user" | "character";
// }

// export interface RelevantContext {
//   id: string | number;
//   version: number;
//   score: number;
//   payload?: Record<string, any> | null;
//   vector?:
//     | Record<string, unknown>
//     | number[]
//     | { [key: string]: number[] | { indices: number[]; values: number[] } | undefined }
//     | null;
// }

// export interface RawChunk {
//   chat_id: number;
//   msg: string;
//   sender_type: string;
//   inserted_at: string;
//   updated_at: string;
//   num_tokens: number;
//   embedded: boolean;
// }

// export interface ChatContext {
//   userInfo: UserInfo;
//   characterInfo: CharacterInfo;
//   contextWindow: Messages[];
//   relevantContext: RelevantContext[];
// }

// export async function getContext(chatID: number): Promise<ChatContext> {
//   await chunk(chatID);
//   const contextWindow = await getContextWindow(chatID);
//   const userInfo = await getUserInfo(chatID);
//   const characterInfo = await getCharacterInfo(chatID);
//   const relevantContext = await getRelevantContext(chatID, contextWindow);

//   const chatContext: ChatContext = {
//     userInfo: {
//       name: userInfo.name
//     },
//     characterInfo: {
//       name: characterInfo.name,
//       prompt: characterInfo.prompt
//     },
//     contextWindow: contextWindow,
//     relevantContext: relevantContext
//   };

//   return chatContext;
// }

// /**
//  * Retrieves a chunk of data for a given chat ID, processes it, and inserts the processed data into the database.
//  * @param chatID - The ID of the chat.
//  * @returns A Promise that resolves when the chunk is processed and inserted into the database.
//  */
// export async function chunk(chatID: number) {
//   const rawChunk = await getUnembeddedChunk(config.CONTEXT_TOKEN_LIMIT, config.CHUNK_TOKEN_LIMIT, chatID);

//   if (rawChunk.length === 0) {
//     return;
//   }

//   // TODO: format raw chunk for LLM declarative summarization before embedding
//   const processedChunk = "";
//   const processedChunkEmbeddings = await embed(processedChunk);
//   insertData(chatID, processedChunkEmbeddings, { chunk: rawChunk });
// }

// /**
//  * Retrieves the context window messages for a given chat ID.
//  * @param chatID - The ID of the chat.
//  * @returns A promise that resolves to an array of ContextWindowMessage objects.
//  */
// async function getContextWindow(chatID: number): Promise<Messages[]> {
//   const contextWindow = await getLatestMessages(chatID, config.CONTEXT_TOKEN_LIMIT);

//   // We only need these fields from each message
//   const stripped = contextWindow.map((message) => {
//     return {
//       content: message.content,
//       inserted_at: message.inserted_at,
//       sender_type: message.sender_type
//     };
//   });

//   return stripped;
// }

// /**
//  * Retrieves the user information for a given chat ID.
//  * @param chatID - The ID of the chat.
//  * @returns A Promise that resolves to the user's persona.
//  */
// async function getUserInfo(chatID: number): Promise<UserInfo> {
//   const userInfo = (await queryData("chat", "persona", chatID)) as UserInfo;
//   return userInfo[0].persona;
// }

// /**
//  * Retrieves character information based on the provided chat ID.
//  * @param chatID - The ID of the chat.
//  * @returns A promise that resolves to the character information.
//  */
// async function getCharacterInfo(chatID: number): Promise<CharacterInfo> {
//   const characterInfo = (await queryData("character", "display_name, sys_prompt, metadata", chatID)) as CharacterInfo;
//   return characterInfo[0];
// }

// /**
//  * Retrieves the relevant context for the chat.
//  * @param chatID - The ID of the chat.
//  * @param contextWindow - An array of context window messages.
//  * @returns A promise that resolves to the relevant context.
//  */
// async function getRelevantContext(chatID: number, contextWindow: Messages[]): Promise<RelevantContext[]> {
//   let embedding = await embed("PLACEHOLDER");
//   const limit = config.vss.LIMIT;
//   let relevantContext = await searchCollection(chatID, embedding, limit);
//   return relevantContext;
// }

/*
  Dynamically manages the message[] context window used at inference time.
  A context includes:
  - The system prompt
  - The array of messages 
*/

import { InferenceMessage, Persona } from "@/lib/types";
import { CardData } from "@shared/types";
import Handlebars from "handlebars";
import { Result, deepFreeze, isError } from "@shared/utils";

type PromptVariant = "xml" | "markdown";

interface PromptParams {
  persona: Persona;
  cardData: CardData;
  characterMemory: string;
  jailbreak: string;
  variant: PromptVariant;
}

interface Context {
  system?: string;
  messages: InferenceMessage[];
}

function getContext(params: PromptParams): Context {
  const messages = params.messages;

  if (!messages || messages.length === 0) {
    throw new Error("Message cannot be empty, null, or undefined.");
  }
  // Many inference providers enforces the following constraints:
  // messages MUST alternate between user / character / user / character
  // messages MUST start with a user message

  // However, since all chats starts with a character greeting
  // We must check if the first message is from the character or from the user
  // If the first message is from the character, the system prompt string will be inserted as a user message
  // IF the first message is from the user, the system prompt string will be a system message as usual

  if (messages[0].sender === "user") {
    const system = renderSystemPrompt(promptParams);
    return { system, messages };
  } else if (messages[0].sender === "character") {
    messages.unshift({ sender: "user", content: renderSystemPrompt(promptParams) });
  } else {
    throw new Error("All messages must have a sender type of 'user' or 'character'");
  }
}

/**
 * Renders the system prompt template using the provided prompt parameters.
 *
 * @param params - The prompt parameters, including the card data, persona, character memory, and jailbreak settings.
 * @returns The rendered system prompt string.
 */
function renderSystemPrompt(params: PromptParams): string {
  const source = getTemplateSource(params.variant);
  const ctx = {
    card: params.cardData,
    persona: params.persona,
    characterMemory: params.characterMemory,
    jailbreak: params.jailbreak
  };
  const template = Handlebars.compile(source);
  const systemPrompt = template(ctx);
  return systemPrompt;
}

function getTemplateSource(variant: PromptVariant) {
  console.log("variant: ", variant);

  switch (variant) {
    case "xml":
      throw new Error("Not implemented");
    case "markdown":
      return `
### Instruction
You are now roleplaying as {{card.character.name}}. 
You are in a chat with {{persona.name}}.
Remember, you are {{persona.name}}, not yourself.

### Character Info
Character Name: {{card.character.name}}
{{card.character.description}}}

### World Info
{{card.world.description}}

### User Info
User's name: {{card.user.name}}

### Character Memory
{{characterMemory}}

### Messages Examples
{{card.character.msg_examples}}

{{jailbreak}}
      `.trim();
    default:
      throw new Error("Invalid prompt variant");
  }
}

export const context = {
  renderSystemPrompt
};
deepFreeze(context);

// import { insertData, searchCollection } from "./db/qdrant";
// import { embed } from "./embed";
// import config from "../../../config";
// import queries from "@/lib/queries";

// export interface Persona {
//   display_name: string;
// }

// export interface Character {
//   display_name: string;
//   system_prompt: string;
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
//   persona: Persona;
//   character: Character;
//   contextWindow: Messages[];
//   relevantContext: RelevantContext[];
// }

// export async function getContext(chatID: number): Promise<ChatContext> {
//   //await chunk(chatID);
//   const contextWindow = await queries.getLatestMessages(chatID, config.CONTEXT_TOKEN_LIMIT);
//   const persona = await queries.getPersona(chatID);
//   const character = await queries.getCharacter(chatID);
//   // const relevantContext = await getRelevantContext(chatID, contextWindow);
//   let relevantContext = [];

//   const chatContext: ChatContext = {
//     persona: {
//       display_name: persona.display_name
//     },
//     character: {
//       display_name: character.display_name,
//       system_prompt: character.system_prompt
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
//   const rawChunk = await queries.getUnembeddedChunk(chatID, config.CONTEXT_TOKEN_LIMIT, config.CHUNK_TOKEN_LIMIT);

//   if (rawChunk.length === 0) {
//     return;
//   }

//   // TODO: format raw chunk for LLM declarative summarization before embedding
//   const processedChunk = "";
//   const processedChunkEmbeddings = await embed(processedChunk);
//   insertData(chatID, processedChunkEmbeddings, { chunk: rawChunk });
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

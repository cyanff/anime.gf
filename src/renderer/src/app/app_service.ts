import { Result, isError } from "@shared/utils";
import { Persona, Message } from "@/lib/types";
import { Card } from "@shared/types";

export interface ChatCard {
  chat_id: number;
  last_message: string;
  name: string;
  avatar: string;
}

// TODO, pagination
async function getChatCards(): Promise<Result<ChatCard[], Error>> {
  const query = `
  SELECT
  c.id AS chat_id,
  (SELECT m.text
   FROM messages m
   WHERE m.chat_id = c.id AND m.sender_type = 'character'
   ORDER BY m.inserted_at DESC
   LIMIT 1) AS last_message,
  ca.fileName
FROM
  chats c
      JOIN
  cards as ca ON ca.id = c.id
ORDER BY
  COALESCE(c.updated_at, c.inserted_at) DESC
LIMIT 20;
`.trim();

  try {
    interface Row {
      chat_id: number;
      last_message: string;
      fileName: string;
    }
    const rows = (await window.api.sqlite.all(query)) as Row[];
    const chatCards = await Promise.all(
      rows.map(async (row) => {
        const res = await window.api.blob.cards.get(row.fileName);
        if (res.kind == "err") {
          throw res.error;
        }
        return {
          chat_id: row.chat_id,
          last_message: row.last_message,
          name: "test",
          avatar: res.value.avatar
        };
      })
    );
    return { kind: "ok", value: chatCards };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getPersona(chatID: number): Promise<Result<Persona, Error>> {
  const query = `
  SELECT id, name, metadata
  FROM personas
  WHERE personas.id = (SELECT persona_id FROM chats WHERE chats.id = ${chatID});
  `.trim();

  try {
    const row = (await window.api.sqlite.get(query)) as Persona;
    return { kind: "ok", value: row };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getChatHistory(chatID: number, startID?: number, limit: number = 25): Promise<Result<Message[], Error>> {
  const query = `
  SELECT text as message,  sender_type as sender, inserted_at as timestamp
  FROM messages
  WHERE ${startID ? `id <= ${startID} AND chat_id = ${chatID}` : `chat_id = ${chatID}`} 
  ORDER BY inserted_at DESC
  LIMIT ${limit};
  `.trim();

  try {
    const rows = (await window.api.sqlite.all(query)) as Message[];
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getCard(chatID: number): Promise<Result<Card, Error>> {
  try {
    const query = `
  SELECT cards.fileName
  FROM chats
           JOIN cards ON chats.card_id = cards.id
  WHERE chats.id = ${chatID};
  `.trim();
    const row = (await window.api.sqlite.get(query)) as { fileName: string };
    const res = await window.api.blob.cards.get(row.fileName);
    if (res.kind == "err") {
      throw res.error;
    }
    return { kind: "ok", value: res.value };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function insertMessage(chatID: number, message: string, sender_type: "user" | "character") {
  try {
    const query = `
    INSERT INTO messages (chat_id, content, sender_type, sender_name, num_tokens, is_embedded) 
    VALUES (?, ?, ?, ?, ?, ?)`;

    const rows = await window.api.sqlite.run(query, [chatID, message, sender_type]);
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getLatestMessages(chatID: number, contextTokenLimit: number): Promise<Result<Message[], Error>> {
  const query = `
  WITH Latest1kMessages AS (
      SELECT * FROM messages WHERE chat_id = ? ORDER BY id ASC LIMIT 1000
  ),
  MessagesWithRunningTotal AS (
      SELECT *, (SELECT SUM(num_tokens) FROM Latest1kMessages WHERE id <= m.id) AS running_total
      FROM Latest1kMessages m
  )
  SELECT l.content, l.sender_type, l.inserted_at
  FROM MessagesWithRunningTotal as l
  WHERE running_total < ?
  `;

  try {
    const rows = (await window.api.sqlite.all(query)) as Message[];
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getUnembeddedChunk(
  chatID: number,
  contextTokenLimit: number,
  chunkTokenLimit: number
): Promise<Result<Message[], Error>> {
  const query = `
  WITH UnembeddedMessages AS (
    SELECT * FROM messages WHERE is_embedded = false AND chat_id = ? ORDER BY id DESC
  ),
  MessagesWithRunningTotal AS (
    SELECT *, (SELECT SUM(token_count) FROM UnembeddedMessages WHERE id <= m.id) AS running_total
    FROM UnembeddedMessages m
  ),
  ChunkMessages AS (
    SELECT * FROM MessagesWithRunningTotal WHERE running_total <= ?
  ),
  MessagesWithChunkTotal AS (
    SELECT *, (SELECT SUM(token_count) FROM ChunkMessages WHERE id <= m.id) AS chunk_total
    FROM ChunkMessages m
  )
  SELECT * FROM MessagesWithChunkTotal WHERE chunk_total <= ?
  `;

  try {
    const rows = (await window.api.sqlite.all(query, [chatID, contextTokenLimit, chunkTokenLimit])) as Message[];
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

// import { getContext, ChatContext } from "./context";
// import Mustache from "mustache";

// export async function getResponse(chatID) {
//   let context, prompt, response;

//   try {
//     // Gather the necessary context
//     context = await getContext(chatID);
//   } catch (err) {
//     console.error(`Failed to get context for chat ID ${chatID}: ${(err as Error).message}`);
//   }

//   try {
//     // Construct the prompt
//     prompt = await constructPrompt(context);
//   } catch (err) {
//     console.error(`Failed to construct prompt: ${(err as Error).message}`);
//   }

//   try {
//     // Call the LLM
//     response = await getCompletion(prompt);
//     console.log(`RESPONSE: ${JSON.stringify(response, null, 2)}`);
//   } catch (err) {
//     console.error(`Failed to get completion from LLM: ${(err as Error).message}`);
//   }

//   return response;
// }

// /**
//  * Construct a prompt to be sent to the LLM.
//  * @param tokenizer The tokenizer used to apply the chat template
//  * @param context An object containing all the context needed to construct the prompt
//  * @returns The constructed prompt as a string
//  */
// async function constructPrompt(context: ChatContext): Promise<any[]> {
//   const template = context.character.system_prompt;
//   const sysPrompt = Mustache.render(template, context);

//   const contextWindow = context.contextWindow.map((message) => {
//     return {
//       role: message.sender_type,
//       content: message.content || ""
//     };
//   });

//   // Parse each chunk of relevant context
//   let relevantContext = context.relevantContext.map((chunk) => {
//     const payload = chunk.payload;
//     if (!payload) {
//       return [];
//     }
//     // Parse each message from each chunk
//     const messages = payload.map((message: any) => {
//       // TODO: implement conversion of timestamp to natural language before returning
//       return {
//         role: message.sender_type,
//         content: message.content // + " timestamp: " + message.inserted_at
//       };
//     });
//     return messages;
//   });
//   relevantContext = relevantContext.flat();

//   const prompt = [{ role: "system", content: sysPrompt }, ...relevantContext, ...contextWindow];

//   console.log(`________________________________________________________________________________`);
//   console.log(`PROMPT: ${JSON.stringify(prompt, null, 2)}`);
//   console.log(`________________________________________________________________________________`);

//   return prompt;
// }

export const service = {
  getChatCards,
  getPersona,
  getChatHistory,
  getCard,
  insertMessage,
  getLatestMessages,
  getUnembeddedChunk
};

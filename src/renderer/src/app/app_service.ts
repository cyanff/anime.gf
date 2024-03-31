import { Result, isError } from "@shared/utils";
import silly from "@shared/silly";
import { CharacterCard } from "@shared/silly";

// todo split this up into multiple files
// this should probably be named page_queries or something
// organize queries by groups
// page on their page dependent

export namespace I {
  export interface ChatCards
    extends Array<{
      chat_id: number;
      last_message: string;
      name: string;
    }> {}

  export interface Persona {
    name: string;
    avatar?: string;
    metadata?: any;
  }

  export interface ChatHistory
    extends Array<{
      sender: "user" | "character";
      message: string;
      timestamp: string;
    }> {}

  export interface Messages
    extends Array<{
      sender: "user" | "character";
      message: string;
      timestamp: string;
    }> {}
}

// TODO, pagination
async function getChatCards(): Promise<Result<I.ChatCards, Error>> {
  const query = `
  SELECT
  c.id AS chat_id,
  (SELECT m.text
   FROM messages m
   WHERE m.chat_id = c.id AND m.sender_type = 'character'
   ORDER BY m.inserted_at DESC
   LIMIT 1) AS last_message,
  ch.card AS card
FROM
  chats c
      JOIN
  characters ch ON c.character_id = ch.id
ORDER BY
  COALESCE(c.updated_at, c.inserted_at) DESC
LIMIT 20;
`.trim();

  try {
    const rows = await window.api.sqlite.all(query);
    const chatCards = await Promise.all(
      rows.map(async (row: any) => {
        const res: Result<Buffer, Error> = await window.api.blob.cards.get(row.card);
        if (res.kind == "err") {
          throw res.error;
        }
        const parsed = silly.read(res.value);

        return {
          chat_id: row.chat_id,
          last_message: row.last_message,
          name: parsed.data.name
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

async function getPersona(chatID: number): Promise<Result<I.Persona, Error>> {
  const query = `
  SELECT id, name, metadata
  FROM personas
  WHERE personas.id = (SELECT persona_id FROM chats WHERE chats.id = ${chatID});
  `.trim();

  try {
    const row = (await window.api.sqlite.get(query)) as I.Persona;
    return { kind: "ok", value: row };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getChatHistory(
  chatID: number,
  startID?: number,
  limit: number = 25
): Promise<Result<I.ChatHistory, Error>> {
  const query = `
  SELECT text as message,  sender_type as sender, inserted_at as timestamp
  FROM messages
  WHERE ${startID ? `id <= ${startID} AND chat_id = ${chatID}` : `chat_id = ${chatID}`} 
  ORDER BY inserted_at DESC
  LIMIT ${limit};
  `.trim();

  try {
    const rows = (await window.api.sqlite.all(query)) as I.ChatHistory;
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getCharacterCard(chatID: number): Promise<Result<CharacterCard, Error>> {
  try {
    const query = `
  SELECT characters.card
  FROM chats
           JOIN characters ON chats.character_id = characters.id
  WHERE chats.id = ${chatID};
  `.trim();

    const row = (await window.api.sqlite.get(query)) as { card: string };

    const res = await window.api.blob.cards.get(row.card);
    if (res.kind == "err") {
      throw res.error;
    }
    return { kind: "ok", value: silly.read(res.value) };
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

async function getLatestMessages(chatID: number, contextTokenLimit: number): Promise<Result<I.Messages, Error>> {
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
    const rows = (await window.api.sqlite.all(query)) as I.Messages;
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
): Promise<Result<I.Messages, Error>> {
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
    const rows = (await window.api.sqlite.all(query, [chatID, contextTokenLimit, chunkTokenLimit])) as I.Messages;
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

export const service = {
  getChatCards,
  getPersona,
  getChatHistory,
  getCharacterCard,
  insertMessage,
  getLatestMessages,
  getUnembeddedChunk
};

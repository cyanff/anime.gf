import { Result, isError } from "@shared/utils";
import silly from "@shared/silly";
import { CardV2 } from "@shared/silly";

export interface ChatCards
  extends Array<{
    chat_id: number;
    last_message: string;
    name: string;
  }> {}

// TODO, pagination
async function getChatCards(): Promise<Result<ChatCards, Error>> {
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

export interface Persona {
  name: string;
  avatar?: string;
  metadata?: any;
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

export interface ChatHistory
  extends Array<{
    sender: "user" | "character";
    message: string;
    timestamp: string;
  }> {}

async function getChatHistory(
  chatID: number,
  startID?: number,
  limit: number = 25
): Promise<Result<ChatHistory, Error>> {
  const query = `
  SELECT text as message,  sender_type as sender, inserted_at as timestamp
  FROM messages
  WHERE ${startID ? `id <= ${startID} AND chat_id = ${chatID}` : `chat_id = ${chatID}`} 
  ORDER BY inserted_at DESC
  LIMIT ${limit};
  `.trim();

  try {
    const rows = (await window.api.sqlite.all(query)) as ChatHistory;
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getCharacterCard(chatID: number): Promise<Result<CardV2, Error>> {
  try {
    const query = `
  SELECT characters.card
  FROM chats
           JOIN characters ON chats.character_id = characters.id
  WHERE chats.id = ${chatID};
  `.trim();

    const row = (await window.api.sqlite.get(query)) as { card: string };
    console.log("Row:", row);

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

export default {
  getChatCards,
  getPersona,
  getChatHistory,
  getCharacterCard,
  insertMessage
};

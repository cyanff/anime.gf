import { CoreMessage } from "@/lib/types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { Result, isError } from "@shared/utils";

export interface RecentChat {
  chat_id: number;
  last_message: string;
  name: string;
  avatarURI?: string;
}

// TODO, pagination
async function getRecentChats(): Promise<Result<RecentChat[], Error>> {
  const query = `
  SELECT
  c.id AS chat_id,
  (SELECT m.text
   FROM messages m
   WHERE m.chat_id = c.id AND m.sender_type = 'character'
   ORDER BY m.id DESC
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
    interface QueryResult {
      chat_id: number;
      last_message: string;
      fileName: string;
    }
    const rows = (await window.api.sqlite.all(query)) as QueryResult[];
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
          avatarURI: res.value.avatarURI
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

async function getPersona(chatID: number): Promise<Result<PersonaBundle, Error>> {
  interface QueryResult {
    name: string;
    description: string;
  }

  const query = `
  SELECT name, description
  FROM personas
  WHERE personas.id = (SELECT persona_id FROM chats WHERE chats.id = ${chatID});
  `.trim();

  try {
    const row = (await window.api.sqlite.get(query)) as QueryResult;
    const res = await window.api.blob.personas.get(row.name);
    if (res.kind == "err") {
      throw res.error;
    }
    const personaBundle = {
      data: {
        name: row.name,
        description: row.description
      },
      avatarURI: res.value.avatarURI
    };

    return { kind: "ok", value: personaBundle };
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
): Promise<Result<CoreMessage[], Error>> {
  const query = `
  SELECT text as message,  sender_type as sender, inserted_at as timestamp
  FROM messages
  WHERE ${startID ? `id <= ${startID} AND chat_id = ${chatID}` : `chat_id = ${chatID}`} 
  ORDER BY id
  LIMIT ${limit};
  `.trim();

  try {
    const rows = (await window.api.sqlite.all(query)) as CoreMessage[];
    return { kind: "ok", value: rows };
  } catch (e) {
    isError(e);
    console.error("Error:", e);
    return { kind: "err", error: e };
  }
}

async function getCard(chatID: number): Promise<Result<CardBundle, Error>> {
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

async function insertMessagePair(
  chatID: number,
  userMessage: string,
  characterMessage: string
): Promise<Result<void, Error>> {
  const queries: string[] = [];
  const params: any[][] = [];

  const userMessageQuery = `
INSERT INTO messages (chat_id, text, sender_type)
VALUES (?, ?, 'user');
  `.trim();
  const userMessageParams = [chatID, userMessage];
  const characterMessageQuery = `
INSERT INTO messages (chat_id, text, sender_type)
VALUES (?, ?, 'character');
  `.trim();
  const characterMessageParams = [chatID, characterMessage];

  queries.push(userMessageQuery, characterMessageQuery);
  params.push(userMessageParams, characterMessageParams);

  try {
    await window.api.sqlite.runAsTransaction(queries, params);
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export const service = {
  getChatCards: getRecentChats,
  getPersonaBundle: getPersona,
  getChatHistory,
  getCardBundle: getCard,
  insertMessagePair
};

import { deepFreeze } from "@shared/utils";
import { CoreMessage, UIMessage } from "@shared/types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { Result, isError } from "@shared/utils";

async function deleteMessage(messageID: number): Promise<void> {
  const query = `
  DELETE FROM messages WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [messageID]);
}

async function deleteChat(chatID: number): Promise<void> {
  const query = `
  DELETE FROM chats WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [chatID]);
}

/**
 * Resets a chat by deleting all messages in the chat, except for the first message.
 *
 * @param chatID - The ID of the chat to reset.
 * @returns A Promise that resolves when the chat has been reset.
 */
async function resetChat(chatID: number): Promise<void> {
  const query = `
DELETE FROM messages
WHERE chat_id = ?
  AND id != (
    SELECT id
    FROM messages
    WHERE chat_id = ?
    ORDER BY id
    LIMIT 1
  );
  `.trim();

  await window.api.sqlite.run(query, [chatID, chatID]);
}

export interface ChatSearchItem {
  id: number;
  characterName: string;
  characterAvatarURI: string;
  lastMessage: string;
}

async function getChatSearchItems(): Promise<ChatSearchItem[]> {
  interface QueryResult {
    id: number;
    lastMessage: string;
    dirName: string;
  }
  const query = `
  SELECT
    c.id,
    (SELECT m.text
     FROM messages m
     WHERE m.chat_id = c.id AND m.sender = 'character'
     ORDER BY m.id DESC
     LIMIT 1) AS lastMessage,
    ca.dirName
FROM
    chats c
        JOIN
    cards as ca ON ca.id = c.id
ORDER BY c.id DESC
  `.trim();

  const rows = (await window.api.sqlite.all(query)) as QueryResult[];
  const ret = await Promise.all(
    rows.map(async (row) => {
      const res = await window.api.blob.cards.get(row.dirName);
      if (res.kind === "err") {
        throw res.error;
      }
      const cardBundle = res.value;
      return {
        id: row.id,
        characterName: cardBundle.data.character.name,
        characterAvatarURI: cardBundle.avatarURI || "",
        lastMessage: row.lastMessage
      };
    })
  );
  return ret;
}
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
   WHERE m.chat_id = c.id AND m.sender = 'character'
   ORDER BY m.id DESC
   LIMIT 1) AS last_message,
  ca.dirName
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
      dirName: string;
    }
    const rows = (await window.api.sqlite.all(query)) as QueryResult[];
    const chatCards = await Promise.all(
      rows.map(async (row) => {
        const res = await window.api.blob.cards.get(row.dirName);
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
    return { kind: "err", error: e };
  }
}

async function getPersonaBundle(chatID: number): Promise<Result<PersonaBundle, Error>> {
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
    return { kind: "err", error: e };
  }
}

async function getChatHistory(
  chatID: number,
  startID?: number,
  limit: number = 25
): Promise<Result<UIMessage[], Error>> {
  interface MessageQueryResult {
    id: number;
    text: string;
    sender: "user" | "character";
    is_regenerated: number;
    prime_candidate_id?: number;
    inserted_at: string;
  }

  const messageQuery = `
  SELECT id, text, sender, prime_candidate_id, inserted_at
  FROM messages
  WHERE ${startID ? `id <= ${startID} AND chat_id = ${chatID}` : `chat_id = ${chatID}`} 
  ORDER BY id
  LIMIT ${limit};
  `.trim();

  try {
    const rows = (await window.api.sqlite.all(messageQuery)) as MessageQueryResult[];

    const ret = await Promise.all(
      rows.map(async (row) => {
        // For each message, fetch all candidates
        const candidateQuery = `
      SELECT id, text
      FROM message_candidates
      WHERE message_id = ${row.id};
      `.trim();
        const candidates = (await window.api.sqlite.all(candidateQuery)) as { id: number; text: string }[];
        return {
          id: row.id,
          sender: row.sender,
          text: row.text,
          prime_candidate_id: row.prime_candidate_id,
          inserted_at: row.inserted_at,
          candidates
        };
      })
    );

    return { kind: "ok", value: ret };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function getCardBundle(chatID: number): Promise<Result<CardBundle, Error>> {
  try {
    const query = `
  SELECT cards.dirName
  FROM chats
           JOIN cards ON chats.card_id = cards.id
  WHERE chats.id = ${chatID};
  `.trim();
    const row = (await window.api.sqlite.get(query)) as { dirName: string };
    const res = await window.api.blob.cards.get(row.dirName);
    if (res.kind == "err") {
      throw res.error;
    }
    return { kind: "ok", value: res.value };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function getCardBundles(): Promise<Result<CardBundle[], Error>> {
  try {
    const query = `
      SELECT cards.dirName
      FROM cards
    `.trim();
    const rows = (await window.api.sqlite.all(query)) as { dirName: string }[];
    const cardBundles: CardBundle[] = [];
    for (const row of rows) {
      const res = await window.api.blob.cards.get(row.dirName);
      if (res.kind == "err") {
        throw res.error;
      }
      cardBundles.push(res.value);
    }
    return { kind: "ok", value: cardBundles };
  } catch (e) {
    isError(e);
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
INSERT INTO messages (chat_id, text, sender)
VALUES (?, ?, 'user');
  `.trim();
  const userMessageParams = [chatID, userMessage];
  const characterMessageQuery = `
INSERT INTO messages (chat_id, text, sender)
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

async function updateMessage(messageID: number, text: string): Promise<void> {
  const query = `
  UPDATE messages
  SET text = ?
  WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [text, messageID]);
}

/**
 * Fetches a limited number of messages from the database starting from a given message ID for the specified chat.
 *
 * @param chatID - The ID of the chat to fetch messages for.
 * @param limit - The maximum number of messages to fetch.
 * @param messageID - The ID of the message to start fetching from. If not provided, the most recent messages will be fetched.
 * @returns An array of `Message` objects containing the fetched messages.
 */
async function getMessagesStartingFrom(chatID: number, limit: number, messageID?: number): Promise<CoreMessage[]> {
  let query: string;
  if (messageID === undefined) {
    query = `
    SELECT * FROM messages
    WHERE chat_id = ${chatID}
    ORDER BY id desc
    LIMIT ${limit}
    `.trim();
  } else {
    query = `
    SELECT * FROM messages
    WHERE chat_id = ${chatID} AND id < ${messageID}
    ORDER BY id desc
    LIMIT ${limit}
    `.trim();
  }

  return (await window.api.sqlite.all(query)) as CoreMessage[];
}

async function getLatestUserMessageStartingFrom(chatID: number, messageID: number): Promise<string> {
  const query = `
  SELECT text FROM messages
  WHERE chat_id = ${chatID} AND id < ${messageID} AND sender = 'user'
  ORDER BY id DESC
  LIMIT 1;
  `.trim();

  const row = (await window.api.sqlite.get(query)) as { text: string };
  return row.text;
}

export const queries = {
  deleteChat,
  resetChat,
  getChatSearchItems,
  getRecentChats,
  getPersonaBundle,
  getChatHistory,
  getCardBundle,
  getCardBundles,
  insertMessagePair,
  updateMessage,
  getMessagesStartingFrom,
  getLatestUserMessageStartingFrom,
  deleteMessage
};

deepFreeze(queries);

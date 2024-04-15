import { deepFreeze } from "@shared/utils";
import { ContextMessage, UIMessage } from "@shared/types";
import { CardBundle, PersonaBundle } from "@shared/types";
import { Result, isError } from "@shared/utils";

async function deleteMessage(messageID: number): Promise<void> {
  const query = `
  DELETE FROM messages WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [messageID]);
}

async function createChat(personaId: number, cardId: number): Promise<Result<void, Error>> {
  try {
    const query = `
      INSERT INTO chats (persona_id, card_id)
      VALUES (?, ?);
    `.trim();
    const params = [personaId, cardId];
    await window.api.sqlite.run(query, params);
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
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
  chats.id AS chat_id,
  (SELECT messages.text 
   FROM messages 
   WHERE messages.chat_id = chats.id
   ORDER BY messages.inserted_at DESC
   LIMIT 1) AS last_message,
  cards.dirName AS card_dirName
FROM 
  chats
  JOIN cards ON chats.card_id = cards.id
ORDER BY 
  chats.inserted_at DESC
LIMIT 20;
`.trim();

  try {
    interface QueryResult {
      chat_id: number;
      last_message: string;
      card_dirName: string;
    }
    const rows = (await window.api.sqlite.all(query)) as QueryResult[];
    const chatCards = await Promise.all(
      rows.map(async (row) => {
        const res = await window.api.blob.cards.get(row.card_dirName);
        if (res.kind == "err") {
          throw res.error;
        }
        return {
          chat_id: row.chat_id,
          last_message: row.last_message,
          name: res.value.data.character.name,
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

async function getChatHistory(chatID: number, limit: number = 10): Promise<Result<UIMessage[], Error>> {
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
    WHERE chat_id = ${chatID}
    ORDER BY id DESC
    LIMIT ${limit};
    `;

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

    return { kind: "ok", value: ret.reverse() };
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
      SELECT cards.id, cards.dirName
      FROM cards
    `.trim();
    const rows = (await window.api.sqlite.all(query)) as { id: number; dirName: string }[];
    const cardBundles: CardBundle[] = [];
    for (const row of rows) {
      const res = await window.api.blob.cards.get(row.dirName);
      if (res.kind == "err") {
        throw res.error;
      }
      const cardBundle: CardBundle = {
        id: row.id,
        data: res.value.data,
        avatarURI: res.value.avatarURI,
        bannerURI: res.value.bannerURI
      };
      cardBundles.push(cardBundle);
    }
    return { kind: "ok", value: cardBundles };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function insertMessage(
  chatID: number,
  message: string,
  sender: "user" | "character"
): Promise<Result<void, Error>> {
  const query = `
    INSERT INTO messages (chat_id, text, sender)
    VALUES (?, ?, ?);
  `.trim();
  const params = [chatID, message, sender];

  try {
    await window.api.sqlite.run(query, params);
    return { kind: "ok", value: undefined };
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

async function updateMessageText(messageID: number, text: string): Promise<void> {
  const query = `
  UPDATE messages
  SET text = ?
  WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [text, messageID]);
}

/**
 * Fetches a limited number of messages from the database starting from a given message ID for the specified chat.
 * If there is a prime candidate associated with a message, the prime candidate's text will be fetched instead of the message's text.
 *
 * @param chatID - The ID of the chat to fetch messages for.
 * @param limit - The maximum number of messages to fetch.
 * @param messageID - The ID of the message to start fetching from. If not provided, the most recent messages will be fetched.
 * @returns An array of `Message` objects containing the fetched messages.
 */
async function getContextMessagesStartingFrom(
  chatID: number,
  limit: number,
  messageID?: number
): Promise<ContextMessage[]> {
  interface QueryResult {
    id: number;
    text: string;
    sender: "user" | "character";
    prime_candidate_id: number | null;
  }
  interface CandidateQueryResult {
    text: string;
  }

  let query: string;
  // If messageID is not provided, fetch the most recent messages.
  if (!messageID || messageID <= 0) {
    query = `
    SELECT id, text, sender, prime_candidate_id FROM messages
    WHERE chat_id = ${chatID}
    ORDER BY id desc
    LIMIT ${limit}
    `;
  } else {
    query = `
    SELECT id, text, sender, prime_candidate_id FROM messages
    WHERE chat_id = ${chatID} AND id < ${messageID}
    ORDER BY id desc
    LIMIT ${limit}
    `;
  }
  const res = (await window.api.sqlite.all(query)) as QueryResult[];
  const ret = await Promise.all(
    res.map(async (row) => {
      // Query for the candidates of the messagea
      const candidateQuery = `
      SELECT text FROM message_candidates
      WHERE id = ${row.prime_candidate_id}
      `;
      const candidateRes = (await window.api.sqlite.all(candidateQuery)) as CandidateQueryResult[];

      if (candidateRes.length === 0) {
        return {
          id: row.id,
          text: row.text,
          sender: row.sender
        };
      } else {
        return {
          id: row.id,
          text: candidateRes[0].text,
          sender: row.sender
        };
      }
    })
  );
  return ret;
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

async function insertCandidateMessage(messageID: number, text: string): Promise<number> {
  const query = `
  INSERT INTO message_candidates (message_id, text)
  VALUES (?, ?);
  `.trim();

  const res = await window.api.sqlite.run(query, [messageID, text]);

  return res.lastInsertRowid as number;
}

async function setCandidateMessageAsPrime(messageID: number, candidateID: number): Promise<void> {
  const query = `
  UPDATE messages
  SET prime_candidate_id = ?
  WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [candidateID, messageID]);
}

async function updateCandidateMessage(candidateID: number, text: string): Promise<void> {
  const query = `
  UPDATE message_candidates
  SET text = ?
  WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [text, candidateID]);
}

async function updateMessagePrimeCandidate(messageID: number, candidateID: number | null): Promise<void> {
  const query = `
  UPDATE messages
  SET prime_candidate_id = ?
  WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [candidateID, messageID]);
}

async function resetChatToMessage(chatID: number, messageID: number): Promise<void> {
  const query = `
  DELETE FROM messages
  WHERE chat_id = ? AND id > ?;
  `;
  await window.api.sqlite.run(query, [chatID, messageID]);
}

export const queries = {
  createChat,
  deleteChat,
  resetChat,
  getMostRecentChat,
  getChatSearchItems,
  getRecentChats,
  getPersonaBundle,
  getChatHistory,
  getCardBundle,
  getCardBundles,
  insertMessage,
  insertMessagePair,
  updateMessageText,
  getContextMessagesStartingFrom,
  getLatestUserMessageStartingFrom,
  deleteMessage,
  insertCandidateMessage,
  setCandidateMessageAsPrime,
  updateCandidateMessage,
  updateMessagePrimeCandidate,
  resetChatToMessage
};

deepFreeze(queries);

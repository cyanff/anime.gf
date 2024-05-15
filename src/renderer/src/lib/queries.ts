import { Chat, Message, MessageCandidate, Persona } from "@shared/db_types";
import { Result, UICardBundle, UIPersonaBundle } from "@shared/types";
import { deepFreeze, isError } from "@shared/utils";
import { RunResult } from "better-sqlite3";

async function deleteMessage(messageID: number): Promise<void> {
  const query = `
  DELETE FROM messages WHERE id = ?;`;

  await window.api.sqlite.run(query, [messageID]);
}

async function createChat(personaID: number, cardID: number): Promise<Result<RunResult, Error>> {
  try {
    const query = `
      INSERT INTO chats (persona_id, card_id)
      VALUES (?, ?);`;
    const params = [personaID, cardID];
    const res = await window.api.sqlite.run(query, params);
    return { kind: "ok", value: res };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function deleteChat(chatID: number): Promise<void> {
  const query = `
  DELETE FROM chats WHERE id = ?;`;

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
  );`;

  await window.api.sqlite.run(query, [chatID, chatID]);
}

export interface ChatSearchItem {
  id: number;
  characterName: string;
  characterAvatarURI: string;
  lastMessage: string;
}

async function getAllChatSearchItems(): Promise<ChatSearchItem[]> {
  interface QueryResult {
    id: number;
    lastMessage: string;
    cardID: number;
  }
  const query = `
  SELECT
    c.id,
    (SELECT m.text
     FROM messages m
     WHERE m.chat_id = c.id AND m.sender = 'character'
     ORDER BY m.id DESC
     LIMIT 1) AS lastMessage,
    ca.id as cardID
FROM
    chats c
        JOIN
    cards as ca ON ca.id = c.card_id
ORDER BY c.id DESC`;

  const rows = (await window.api.sqlite.all(query)) as QueryResult[];

  const ret: ChatSearchItem[] = [];
  for (const row of rows) {
    const res = await window.api.blob.cards.get(row.cardID);
    if (res.kind === "err") {
      console.error("Error fetching card bundle", res.error);
      continue;
    }
    const cardBundle = res.value;
    ret.push({
      id: row.id,
      characterName: cardBundle.data.character.name,
      characterAvatarURI: cardBundle.avatarURI || "",
      lastMessage: row.lastMessage
    });
  }

  return ret;
}

export interface RecentChatOk {
  kind: "ok";
  value: {
    chat_id: number;
    last_message: string;
    name: string;
    avatarURI?: string;
  };
}

export interface RecentChatErr {
  kind: "err";
  value: {
    chat_id: number;
    dir_name: string;
  };
  error: Error;
}
export type RecentChatResult = RecentChatOk | RecentChatErr;
// TODO, pagination
async function getRecentChatResults(): Promise<Result<RecentChatResult[], Error>> {
  const query = `
  SELECT 
  chats.id AS chat_id,
  (SELECT messages.text 
   FROM messages 
   WHERE messages.chat_id = chats.id
   ORDER BY messages.inserted_at DESC
   LIMIT 1) AS last_message,
  cards.dir_name AS card_dir_name,
  cards.id AS cardID 
FROM 
  chats
  JOIN cards ON chats.card_id = cards.id
ORDER BY 
  chats.inserted_at DESC
LIMIT 20;`;

  try {
    interface QueryResult {
      chat_id: number;
      last_message: string;
      card_dir_name: string;
      cardID: number;
    }
    const rows = (await window.api.sqlite.all(query)) as QueryResult[];
    const recentChatResults: RecentChatResult[] = await Promise.all(
      rows.map(async (row) => {
        const res = await window.api.blob.cards.get(row.cardID);
        console.log(res);
        if (res.kind === "err") {
          return {
            kind: "err",
            value: {
              chat_id: row.chat_id,
              dir_name: row.card_dir_name
            },
            error: res.error
          };
        }
        return {
          kind: "ok",
          value: {
            chat_id: row.chat_id,
            last_message: row.last_message,
            name: res.value.data.character.name,
            avatarURI: res.value.avatarURI
          }
        };
      })
    );
    return { kind: "ok", value: recentChatResults };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getMostRecentChat(): Promise<Result<number | undefined, Error>> {
  const query = `
  SELECT *
  FROM 
    chats
  ORDER BY 
    chats.inserted_at DESC
  LIMIT 1;`;

  try {
    const rows = (await window.api.sqlite.all(query)) as Chat[];
    if (rows.length === 0) {
      return { kind: "ok", value: undefined };
    }
    if (rows.length > 1) {
      console.error("More than one chat found when only one was expected.");
    }
    return { kind: "ok", value: rows[0].id };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getPersonaBundle(chatID: number): Promise<Result<UIPersonaBundle, Error>> {
  const query = `
  SELECT * 
  FROM personas
  WHERE personas.id = (SELECT persona_id FROM chats WHERE chats.id = ${chatID});`;

  try {
    const row = (await window.api.sqlite.get(query)) as Persona;
    const res = await window.api.blob.personas.get(row.dir_name);
    if (res.kind == "err") {
      throw res.error;
    }
    const personaBundle = {
      data: {
        ...row
      },
      avatarURI: res.value.avatarURI
    };

    return { kind: "ok", value: personaBundle };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function getAllExtantPersonaBundles(): Promise<Result<UIPersonaBundle[], Error>> {
  const query = "SELECT * FROM personas WHERE is_deleted = 0;";

  try {
    const rows = (await window.api.sqlite.all(query)) as Persona[];
    const personaBundles = await Promise.all(
      rows.map(async (row) => {
        const res = await window.api.blob.personas.get(row.dir_name);
        let avatarURI;

        if (res.kind == "ok") {
          avatarURI = res.value.avatarURI;
        } else {
          avatarURI = "";
        }
        return {
          data: {
            ...row
          },
          avatarURI
        };
      })
    );
    return { kind: "ok", value: personaBundles };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export interface MessageWithCandidates extends Message {
  candidates: MessageCandidate[];
}
export interface MessageHistory extends Array<MessageWithCandidates> {}
async function getChatHistory(chatID: number, limit: number = 10): Promise<Result<MessageHistory, Error>> {
  const messageQuery = `
    SELECT * 
    FROM messages
    WHERE chat_id = ${chatID}
    ORDER BY id DESC
    LIMIT ${limit};
    `;
  try {
    const rows = (await window.api.sqlite.all(messageQuery)) as Message[];
    const ret = await Promise.all(
      rows.map(async (row) => {
        // For each message, fetch all candidates
        const candidateQuery = `
      SELECT * 
      FROM message_candidates
      WHERE message_id = ${row.id};`;
        const candidates = (await window.api.sqlite.all(candidateQuery)) as MessageCandidate[];
        return {
          ...row,
          candidates
        };
      })
    );
    return { kind: "ok", value: ret.reverse() };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getCardBundle(chatID: number): Promise<Result<UICardBundle, Error>> {
  try {
    const query = `
  SELECT cards.id
  FROM chats
           JOIN cards ON chats.card_id = cards.id
  WHERE chats.id = ${chatID};`;
    const row = (await window.api.sqlite.get(query)) as { id: number };
    const res = await window.api.blob.cards.get(row.id);
    if (res.kind == "err") {
      throw res.error;
    }
    return { kind: "ok", value: res.value };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function getAllExtantCardBundles(): Promise<Result<UICardBundle[], Error>> {
  try {
    const query = `
      SELECT cards.id
      FROM cards
      WHERE cards.is_deleted = 0;`;
    const rows = (await window.api.sqlite.all(query)) as { id: number }[];
    const cardBundles: UICardBundle[] = [];
    for (const row of rows) {
      const res = await window.api.blob.cards.get(row.id);
      if (res.kind == "err") {
        console.error("Error fetching a card bundle", res.error);
        continue;
      }
      cardBundles.push(res.value);
    }
    return { kind: "ok", value: cardBundles };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function getAllDeletedCardBundles(): Promise<Result<UICardBundle[], Error>> {
  try {
    const query = `
      SELECT cards.id
      FROM cards
      WHERE cards.is_deleted = 1;`;
    const rows = (await window.api.sqlite.all(query)) as { id: number }[];
    const cardBundles: UICardBundle[] = [];
    for (const row of rows) {
      const res = await window.api.blob.cards.get(row.id);
      if (res.kind == "err") {
        console.error("Error fetching a card bundle", res.error);
        continue;
      }
      cardBundles.push(res.value);
    }
    return { kind: "ok", value: cardBundles };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function softDeleteCard(cardID: number): Promise<Result<void, Error>> {
  try {
    const query = `
    UPDATE cards SET is_deleted = 1 WHERE id = ?;
    `;
    await window.api.sqlite.run(query, [cardID]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function permaDeleteCard(cardID: number): Promise<Result<void, Error>> {
  try {
    const query = `
      DELETE FROM cards
      WHERE id = ?
    `;
    await window.api.sqlite.run(query, [cardID]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

async function restoreCard(cardID: number): Promise<Result<void, Error>> {
  try {
    const query = `
    UPDATE cards SET is_deleted = 0 WHERE id = ?;
    `;
    await window.api.sqlite.run(query, [cardID]);
    return { kind: "ok", value: undefined };
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
    VALUES (?, ?, ?);`;
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
VALUES (?, ?, 'user');`;
  const userMessageParams = [chatID, userMessage];
  const characterMessageQuery = `
INSERT INTO messages (chat_id, text, sender)
VALUES (?, ?, 'character');`;
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
  WHERE id = ?;`;

  await window.api.sqlite.run(query, [text, messageID]);
}

export interface ContextMessage extends Pick<Message, "id" | "sender" | "text"> {}
/**
 * Fetches a limited number of messages from the database starting from a given message ID for the specified chat.
 * If there is a prime candidate associated with a message, the prime candidate's text will be fetched instead of the message's text.
 *
 * @param chatID - The ID of the chat to fetch messages for.
 * @param limit - The maximum number of messages to fetch.
 * @param fromMessageID - The ID of the message to start fetching from. If not provided, the most recent messages will be fetched.
 * @returns An array of `Message` objects containing the fetched messages.
 */
async function getContextMessagesStartingFrom(
  chatID: number,
  limit: number,
  fromMessageID?: number
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
  if (!fromMessageID || fromMessageID <= 0) {
    query = `
    SELECT id, text, sender, prime_candidate_id FROM messages
    WHERE chat_id = ${chatID}
    ORDER BY id desc
    LIMIT ${limit}
    `;
  } else {
    query = `
    SELECT id, text, sender, prime_candidate_id FROM messages
    WHERE chat_id = ${chatID} AND id < ${fromMessageID}
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

async function getLatestUserMessageStartingFrom(
  chatID: number,
  messageID: number
): Promise<Result<Message | undefined, Error>> {
  const query = `
  SELECT * FROM messages
  WHERE chat_id = ${chatID} AND id < ${messageID} AND sender = 'user'
  ORDER BY id DESC
  LIMIT 1;`;

  const rows = (await window.api.sqlite.all(query)) as Message[];
  if (rows.length === 0) {
    return { kind: "ok", value: undefined };
  }
  return { kind: "ok", value: rows[0] };
}

async function insertCandidateMessage(messageID: number, text: string): Promise<number> {
  const query = `
  INSERT INTO message_candidates (message_id, text)
  VALUES (?, ?);`;

  const res = await window.api.sqlite.run(query, [messageID, text]);

  return res.lastInsertRowid as number;
}

async function setCandidateMessageAsPrime(messageID: number, candidateID: number): Promise<void> {
  const query = `
  UPDATE messages
  SET prime_candidate_id = ?
  WHERE id = ?;`;

  await window.api.sqlite.run(query, [candidateID, messageID]);
}

async function updateCandidateMessage(candidateID: number, text: string): Promise<void> {
  const query = `
  UPDATE message_candidates
  SET text = ?
  WHERE id = ?;`;

  await window.api.sqlite.run(query, [text, candidateID]);
}

async function updateMessagePrimeCandidate(messageID: number, candidateID: number | null): Promise<void> {
  const query = `
  UPDATE messages
  SET prime_candidate_id = ?
  WHERE id = ?;`;

  await window.api.sqlite.run(query, [candidateID, messageID]);
}

async function resetChatToMessage(chatID: number, messageID: number): Promise<void> {
  const query = `
  DELETE FROM messages
  WHERE chat_id = ? AND id > ?;
  `;
  await window.api.sqlite.run(query, [chatID, messageID]);
}

async function getCardDir(cardID: number): Promise<Result<string, Error>> {
  const query = `
  SELECT dir_name FROM cards WHERE id = ?;`;
  try {
    const row = (await window.api.sqlite.get(query, [cardID])) as { dir_name: string };
    return { kind: "ok", value: row.dir_name };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function deletePersona(bundle: UIPersonaBundle): Promise<Result<void, Error>> {
  const query = `
    UPDATE personas SET is_deleted = 1, is_default = 0 WHERE id = ?;
    `;
  try {
    await window.api.sqlite.run(query, [bundle.data.id]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function checkChatExists(chatID: number): Promise<Result<boolean, Error>> {
  const query = `SELECT EXISTS(SELECT 1 FROM chats WHERE id = ?) AS chat_exists;`;

  try {
    const row = (await window.api.sqlite.get(query, [chatID])) as { chat_exists: number };
    return { kind: "ok", value: row.chat_exists === 1 };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export const queries = {
  createChat,
  deleteChat,
  resetChat,
  getAllChatSearchItems,
  getRecentChatResults,
  getMostRecentChat,
  getPersonaBundle,
  getChatHistory,
  getCardBundle,
  getAllExtantCardBundles,
  getAllDeletedCardBundles,
  softDeleteCard,
  permaDeleteCard,
  restoreCard,
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
  resetChatToMessage,
  getAllExtantPersonaBundles,
  getCardDir,
  deletePersona,
  checkChatExists
};

deepFreeze(queries);

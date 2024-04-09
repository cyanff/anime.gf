import { deepFreeze } from "@shared/utils";

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
    fileName: string;
  }
  const query = `
  SELECT
    c.id,
    (SELECT m.text
     FROM messages m
     WHERE m.chat_id = c.id AND m.sender_type = 'character'
     ORDER BY m.id DESC
     LIMIT 1) AS lastMessage,
    ca.fileName
FROM
    chats c
        JOIN
    cards as ca ON ca.id = c.id
ORDER BY c.id DESC
  `.trim();

  const rows = (await window.api.sqlite.all(query)) as QueryResult[];
  const ret = await Promise.all(
    rows.map(async (row) => {
      const res = await window.api.blob.cards.get(row.fileName);
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

export const queries = {
  deleteChat,
  resetChat,
  getChatSearchItems
};

deepFreeze(queries);

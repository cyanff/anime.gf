import { deepFreeze } from "@shared/utils";

async function deleteChatWithID(chatID: number): Promise<void> {
  const query = `
  DELETE FROM chats WHERE id = ?;
  `.trim();

  await window.api.sqlite.run(query, [chatID]);
}

export const queries = {
  deleteChatWithID
};
deepFreeze(queries);

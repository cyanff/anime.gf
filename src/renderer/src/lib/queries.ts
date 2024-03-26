import { Result, isError } from "@shared/utils";

export interface GetChatCards {
  chat_id: number;
  last_message: string;
  display_name: string;
  avatar_url: string;
}
async function getChatCards(): Promise<Result<GetChatCards[], Error>> {
  const query = `
SELECT 
    c.id as chat_id,
    m.content as last_message,
    ch.display_name,
    ch.avatar_url
FROM 
    chats c
JOIN 
    characters ch ON c.character_id = ch.id
JOIN 
    messages m ON m.chat_id = c.id
WHERE 
    m.inserted_at = (
        SELECT 
            MAX(inserted_at) 
        FROM 
            messages 
        WHERE 
            chat_id = c.id)
`.trim();

  try {
    const chatCards = await window.api.sqlite.all(query);
    return { kind: "ok", value: chatCards };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export default {
  getChatCards
};

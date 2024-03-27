import { Result, isError } from "@shared/utils";
import silly from "@shared/silly";

export interface ChatCard {
  chat_id: number;
  last_message: string;
  name: string;
  //avatar: string;
}
async function getChatCards(): Promise<Result<ChatCard[], Error>> {
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
        const parsed = JSON.parse(silly.read(res.value));

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

export default {
  getChatCards
};

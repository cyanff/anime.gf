import { Result, isError } from "@shared/utils";
import silly from "@shared/silly";

export interface GetChatCards {
  chat_id: number;
  last_message: string;
  name: string;
  //avatar: string;
}
async function getChatCards(): Promise<Result<GetChatCards[], Error>> {
  const query = `
SELECT 
    c.id as chat_id,
    m.text as last_message,
    ch.card as card
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
    const rows = await window.api.sqlite.all(query);

    const row = rows[0] as any;
    console.log("Row:", row);

    const card = row.card;
    const res: Result<Buffer, Error> = await window.api.blob.cards.get(card);
    if (res.kind == "err") {
      return res;
    }
    const buffer = res.value;

    const parsed = silly.read(buffer);
    console.log("Parsed:", parsed);

    return { kind: "ok", value: {} as any };
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
}

export default {
  getChatCards
};

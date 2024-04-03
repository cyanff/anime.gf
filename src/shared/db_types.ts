export interface Persona {
  id: number;
  name: string;
  avatar?: string;
  description?: string;
  inserted_at: string;
  updated_at?: string;
}

export interface Character {
  id: number;
  fileName: string;
  inserted_at: string;
  updated_at?: string;
}

export interface Chat {
  id: number;
  persona_id: number;
  card_id: number;
  inserted_at: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  chat_id: number;
  text?: string;
  sender_type: "user" | "character";
  num_tokens: number;
  is_embedded: boolean;
  inserted_at: string;
  updated_at?: string;
}

export interface Persona {
  id: number;
  name: string;
  avatar?: string;
  metadata?: any;
  inserted_at: string;
  updated_at?: string;
}

export interface Character {
  id: number;
  card: string;
  hash: string;
  inserted_at: string;
  updated_at?: string;
}

export interface Chat {
  id: number;
  persona_id: number;
  character_id: number;
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

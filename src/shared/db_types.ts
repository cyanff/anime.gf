export interface Persona {
  id: number;
  name: string;
  description: string;
  dir_name: string;
  is_deleted: number;
  is_default: number;
  inserted_at: string;
  updated_at?: string;
}

export interface Card {
  id: number;
  dir_name: string;
  is_deleted: number;
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
  text: string;
  sender: "user" | "character";
  is_embedded: number;
  prime_candidate_id?: number;
  inserted_at: string;
  updated_at?: string;
}

export interface MessageCandidate {
  id: number;
  message_id: number;
  text: string;
  inserted_at: string;
  updated_at?: string;
}

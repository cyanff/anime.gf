// Global types

export interface ChatCards
  extends Array<{
    chat_id: number;
    last_message: string;
    name: string;
  }> {}

export interface Persona {
  name: string;
  avatar?: string;
  metadata?: any;
}

export interface ChatHistory
  extends Array<{
    sender: "user" | "character";
    message: string;
    timestamp: string;
  }> {}

export interface Messages
  extends Array<{
    sender: "user" | "character";
    message: string;
    timestamp: string;
  }> {}

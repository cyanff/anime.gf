export interface Persona {
  name: string;
  avatar?: string;
  metadata?: any;
}

export interface Message {
  sender: "user" | "character";
  message: string;
  timestamp: string;
}

export interface Persona {
  name: string;
  avatar?: string;
  metadata?: any;
}

// Refactor DB so that these are the same
export interface UIMessage {
  sender: "user" | "character";
  message: string;
  timestamp: string;
}

export interface InferenceMessage {
  role: "user" | "assistant";
  content: string;
}

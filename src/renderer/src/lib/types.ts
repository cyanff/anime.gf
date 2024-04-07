export interface CoreMessage {
  sender: "user" | "character";
  message: string;
  timestamp: string;
}

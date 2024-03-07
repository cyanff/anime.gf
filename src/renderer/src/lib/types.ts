export interface ChatMetadata {
  chatID: string;
  userUsername: string;
  userAvatarURL: string | null;
  companionDisplayName: string;
  companionAvatarURL: string;
  companionAboutMe: string;
}

// Represent a message to be rendered
export interface UIMessage {
  id: string;
  username: string;
  avatarURL: string | null;
  content: string | null;
  timestamp: string;
}

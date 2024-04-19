import { deepFreeze } from "@shared/utils";

export const config = {
  persona: {
    nameMaxChars: 128,
    descriptionMaxChars: 768
  },
  card: {
    nameMaxChars: 128,
    descriptionMaxChars: 768,
    greetingMaxChars: 256,
    msgExamplesMaxChars: 512,
    taglineMaxChars: 128,
    tagsMaxCount: 8,
    tagsMaxChars: 32
  },
  defaultSettings: {
    chat: {
      provider: "anthropic",
      model: "claude-3-haiku-20240307",
      maxReplyTokens: 256,
      maxContextTokens: 2048,
      temperature: 0.7,
      topP: 1,
      topK: 50,
      streaming: true,
      jailbreak: ""
    }
  }
};
deepFreeze(config);

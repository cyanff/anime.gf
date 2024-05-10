import { ProviderE } from "@/lib/provider/provider";
import { Settings } from "@shared/types";
import { deepFreeze } from "@shared/utils";

const defaultSettings: Settings = {
  chat: {
    provider: "anthropic" as ProviderE,
    model: "claude-3-haiku-20240307",
    maxReplyTokens: 256,
    maxContextTokens: 4096,
    temperature: 0.7,
    topP: 1,
    topK: 50,
    streaming: true,
    jailbreak: ""
  },
  advanced: {
    closeToTray: true
  }
};
export const config = {
  requestTimeout: 20000,
  persona: {
    nameMinChars: 1,
    nameMaxChars: 128,

    descriptionMinChars: 0,
    descriptionMaxChars: 1024
  },
  card: {
    nameMinChars: 1,
    nameMaxChars: 128,

    handleMinChars: 1,
    handleMaxChars: 32,

    descriptionMinChars: 0,
    descriptionMaxChars: 524288,

    greetingMinChars: 1,
    greetingMaxChars: 2048,

    altGreetingsMinCount: 0,
    altGreetingsMaxCount: 64,

    msgExamplesMinChars: 0,
    msgExamplesMaxChars: 8192,

    titleMinChars: 1,
    titleMaxChars: 128,

    tagLineMinChars: 0,
    taglineMaxChars: 256,

    tagsMinCount: 0,
    tagsMaxCount: 16,

    tagMinChars: 1,
    tagMaxChars: 32,

    notesMinChars: 0,
    notesMaxChars: 4096,

    maxFileSizeBytes: 5e7
  },
  defaultSettings: defaultSettings
};

deepFreeze(config);

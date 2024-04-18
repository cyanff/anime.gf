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
  }
};
deepFreeze(config);

/*
  During development, you often have to run adhoc snippets to test if things are working as expected.
  Put those snippets here so that you could trigger them using ctrl+k.
*/
// export interface CompletionConfig {
//   apiKey?: string;
//   model: string;
//   url?: string;
//   system?: string;
//   stop?: string[];
//   maxTokens: number;
//   temperature?: number;
//   topP?: number;
//   topK?: number;
// }

import { cardTagSchema, cardTagsSchema } from "@shared/schema/schema";

export async function handleA() {
  const tag = "test";
  const tags = [tag];

  console.log(cardTagsSchema.safeParse(tags));
}

export async function handleB() {}

export async function handleC() {}

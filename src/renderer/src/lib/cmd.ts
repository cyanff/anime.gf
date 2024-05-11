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

import { render } from "@/lib/macros";
import { CardData, PersonaData } from "@shared/types";

export async function handleA() {
  // replace {{user}} and {{char}}
  const cardData = { character: { name: "John" } } as CardData;
  const personaData = { name: "Jane" } as PersonaData;

  const res = render("Hello {{user}}, you are roleplaying as {{char}}", {
    cardData: cardData,
    personaData: personaData
  });
  console.log(res);
}

export async function handleB() {}

export async function handleC() {}

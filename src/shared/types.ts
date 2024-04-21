import { ProviderE } from "@/lib/provider/provider";
import { config } from "@shared/config";
import { Message, Persona } from "@shared/db_types";
import { z } from "zod";

// Card
// =====================================
// data.json inside the card's directory
export interface CardData {
  spec: string;
  spec_version: string;
  character: Character;
  world: World;
  meta: {
    title: string;
    created_at: string;
    updated_at?: string;
    creator: {
      card: string;
      character: string;
      world: string;
    };
    notes?: string;
    tagline: string;
    tags: string[];
  };
}

export interface Character {
  name: string;
  description: string;
  greeting: string;
  alt_greetings?: string[];
  msg_examples: string;
}
export interface World {
  description: string;
}
// Contents of the card's directory
export interface CardBundle {
  id: number;
  data: CardData;
  avatarURI: string;
  bannerURI: string;
}

export interface CardBundleWithoutID {
  data: CardData;
  avatarURI: string;
  bannerURI: string;
}

// =====================================

// Persona
// =====================================
/* Todo refactor this
  PersonaData should be
  {
    name: string;
    description: string;
  }
*/
export interface PersonaData extends Persona {}

// Contents of the persona's directory
export interface PersonaBundleWithoutData {
  avatarURI: string;
}

export interface PersonaBundle extends PersonaBundleWithoutData {
  data: PersonaData;
}
// =====================================

export interface UIMessageCandidate {
  id: number;
  text: string;
}

export interface UIMessage extends Pick<Message, "id" | "sender" | "text" | "prime_candidate_id" | "inserted_at"> {
  candidates: UIMessageCandidate[];
}
export interface ContextMessage extends Pick<Message, "id" | "sender" | "text"> {}

// Settings from settings.json
export interface Settings {
  chat: {
    provider: ProviderE;
    model: string;
    temperature: number;
    topP: number;
    topK: number;
    maxReplyTokens: number;
    maxContextTokens: number;
    jailbreak: string;
    streaming: boolean;
  };
}

// ===========================================
export const personaFormSchema = z.object({
  name: z.string().max(config.persona.nameMaxChars),
  description: z.string().max(config.persona.descriptionMaxChars),
  isDefault: z.boolean(),
  avatarURI: z.string().optional(),
  // TODO: to be implemented
  bannerURI: z.string().optional()
});
export type PersonaFormData = z.infer<typeof personaFormSchema>;

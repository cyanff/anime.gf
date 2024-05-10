import { ProviderE } from "@/lib/provider/provider";
import { config } from "@shared/config";
import { Persona } from "@shared/db_types";
import { z } from "zod";
import { supportedImageExts } from "./utils";

// Card Schema
// The core representation expected by all parts of the app.
// =====================================
const greetingSchema = z.string().min(config.card.greetingMinChars).max(config.card.greetingMaxChars);
const characterSchema = z.object({
  name: z
    .string()
    .min(config.card.nameMinChars)
    .max(config.card.nameMaxChars)
    .regex(/^[a-zA-Z0-9 -]*$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  handle: z
    .string()
    .min(config.card.handleMinChars)
    .max(config.card.handleMaxChars)
    .regex(/^[a-zA-Z0-9_-]*$/, "Handle can only contain letters, numbers, and dashes")
    .optional(),
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars),
  greeting: greetingSchema,
  alt_greetings: z.array(greetingSchema).min(config.card.altGreetingsMinCount).max(config.card.altGreetingsMaxCount),
  msg_examples: z.string().min(config.card.msgExamplesMinChars).max(config.card.msgExamplesMaxChars)
});

const worldSchema = z.object({
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars)
});

const cardTagSchema = z
  .string()
  .min(config.card.tagMinChars)
  .max(config.card.tagMaxChars)
  .regex(/^[a-z0-9-\s]+$/, "Tag must be lowercase alphanumeric with dash and spaces allowed.");

export const cardTagsSchema = z.array(cardTagSchema).min(config.card.tagsMinCount).max(config.card.tagsMaxCount);

const metaSchema = z.object({
  title: z.string().min(config.card.titleMinChars).max(config.card.titleMaxChars),
  notes: z.string().min(config.card.notesMinChars).max(config.card.notesMaxChars),
  tagline: z.string().min(config.card.tagLineMinChars).max(config.card.taglineMaxChars),
  tags: cardTagsSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
  creator: z.object({
    card: z.string().min(0).max(config.persona.nameMaxChars),
    character: z.string().min(0).max(config.persona.nameMaxChars),
    world: z.string().min(0).max(config.persona.nameMaxChars)
  })
});

export const cardSchema = z.object({
  spec: z.literal("anime.gf"),
  spec_version: z.literal("1.0"),
  character: characterSchema,
  world: worldSchema,
  meta: metaSchema
});
export type CardData = z.infer<typeof cardSchema>;

// Forms
// ===========================================
export const personaFormSchema = z.object({
  name: z
    .string()
    .min(config.persona.nameMinChars)
    .max(config.persona.nameMaxChars)
    .regex(/^[a-zA-Z0-9 -]*$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  description: z.string().max(config.persona.descriptionMaxChars),
  isDefault: z.boolean(),
  avatarURI: z.string().optional(),
  // TODO: implement persona banners
  bannerURI: z.string().optional()
});
export type PersonaFormData = z.infer<typeof personaFormSchema>;

// Card Form Schema
// Used for validating the form data before creating a card
// Some fields are more lenient, some extra fields added (e.g. avatarURI, bannerURI)
const characterFormSchema = z.object({
  name: z
    .string()
    .min(config.card.nameMinChars)
    .max(config.card.nameMaxChars)
    .regex(/^[a-zA-Z0-9 -]*$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  handle: z
    .string()
    .min(config.card.handleMinChars)
    .max(config.card.handleMaxChars)
    .regex(/^[a-zA-Z0-9_-]*$/, "Handle can only contain letters, numbers, and dashes")
    .optional(),

  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars),
  greeting: z.string().min(config.card.greetingMinChars).max(config.card.greetingMaxChars),
  msg_examples: z.string().min(config.card.msgExamplesMinChars).max(config.card.msgExamplesMaxChars),
  avatarURI: z.string().optional(),
  bannerURI: z.string().optional()
});

const worldFormSchema = z.object({
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars)
});
const metaFormSchema = z.object({
  title: z.string().min(config.card.titleMinChars).max(config.card.titleMaxChars),
  notes: z.string().min(config.card.notesMinChars).max(config.card.notesMaxChars),
  tagline: z.string().min(config.card.tagLineMinChars).max(config.card.taglineMaxChars),
  // TODO: this should be z.array(z.string()) instead, this is hacky
  // Change this when you polish tag support
  // Use React Aria https://react-spectrum.adobe.com/react-aria/TagGroup.html
  tags: z
    .string()
    .min(1)
    .max(256)
    .regex(/^(\w+)(,\s*\w+)*$/, "Tags must be a comma separated list of words without spaces.")
});

export const cardFormSchema = z.object({
  character: characterFormSchema,
  world: worldFormSchema,
  meta: metaFormSchema
});

// Contents of the card's directory
// =====================================
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

// Persona
// =====================================
export interface PersonaData extends Persona {}
// Contents of the persona's directory
export interface PersonaBundleWithoutData {
  avatarURI: string;
}
export interface PersonaBundle extends PersonaBundleWithoutData {
  data: PersonaData;
}

// Settings from settings.json
// =====================================
export interface Settings {
  chat: {
    provider: ProviderE;
    model: string;
    url?: string;
    temperature: number;
    topP: number;
    topK: number;
    maxReplyTokens: number;
    maxContextTokens: number;
    jailbreak: string;
    streaming: boolean;
  };
  advanced: {
    closeToTray: boolean;
  };
}

export type CardFormData = z.infer<typeof cardFormSchema>;

export type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };

export type ImageExt = (typeof supportedImageExts)[number];
export type supportedCardExts = (typeof supportedImageExts)[number];

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
    .regex(
      /^[\p{L}\p{N}_ -]+$/u,
      "Invalid input. Only Unicode letters, numbers, spaces, hyphens, and underscores are allowed."
    ),
  handle: z
    .string()
    .min(config.card.handleMinChars)
    .max(config.card.handleMaxChars)
    .regex(/^[a-zA-Z0-9_-]*$/, "Handle can only contain letters, numbers, and dashes")
    .optional(),
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars),
  greeting: greetingSchema,
  alt_greetings: z.array(greetingSchema).min(config.card.altGreetingsMinCount).max(config.card.altGreetingsMaxCount),
  msg_examples: z.string().min(config.card.msgExamplesMinChars).max(config.card.msgExamplesMaxChars),
  system_prompt: z.string().min(config.card.systemPromptMinChars).max(config.card.systemPromptMaxChars),
  jailbreak: z.string().min(config.card.jailbreakMinChars).max(config.card.jailbreakMaxChars)
});

const worldSchema = z.object({
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars)
});

export const cardTagSchema = z
  .string()
  .min(config.card.tagMinChars)
  .max(config.card.tagMaxChars)
  .regex(/^[a-z0-9-\s]+$/, "Tag must be lowercase alphanumeric with dash and spaces allowed.");

const cardTagsSchema = z.array(cardTagSchema).min(config.card.tagsMinCount).max(config.card.tagsMaxCount);

const metaSchema = z.object({
  title: z.string().min(config.card.titleMinChars).max(config.card.titleMaxChars),
  notes: z.string().min(config.card.notesMinChars).max(config.card.notesMaxChars),
  tagline: z.string().min(config.card.tagLineMinChars).max(config.card.taglineMaxChars),
  tags: cardTagsSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().or(z.literal("")).optional(),
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

// =========================================================
//  Card Storage
// =========================================================

export interface UICardBundle {
  id: string;
  data: CardData;
  avatarURI: string;
  bannerURI: string;
}

export interface PlatformCardBundle {
  data: CardData;
  avatarBuffer?: Buffer;
  bannerBuffer?: Buffer;
}

export interface RawPlatformCardBundle {
  data: object;
  avatarBuffer?: Buffer;
  bannerBuffer?: Buffer;
}

// =========================================================
//  Persona Storage
// =========================================================
// Contents of the persona directory
export interface PersonaBundle {
  avatarURI: string;
}

export interface PersonaData extends Persona {}

export interface UIPersonaBundle extends PersonaBundle {
  data: PersonaData;
}

// =========================================================
//  Settings Store
// =========================================================
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

export type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };
export type ImageExt = (typeof supportedImageExts)[number];
export type supportedCardExts = (typeof supportedImageExts)[number];
export type PathLike = string | Buffer | URL;

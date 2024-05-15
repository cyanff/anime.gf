import { config } from "@shared/config";
import { ZodSchema, z } from "zod";

// =========================================================
//  Card Schema
// =========================================================
// Helper function to conditionally add .default() based on min
const conditionalDefault = (schema: ZodSchema, min: number, defaultVal: any): any => {
  return min === 0 ? schema.default(defaultVal) : schema;
};
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
  handle: conditionalDefault(
    z
      .string()
      .min(config.card.handleMinChars)
      .max(config.card.handleMaxChars)
      .regex(/^[a-zA-Z0-9_-]*$/, "Handle can only contain letters, numbers, and dashes"),
    config.card.handleMinChars,
    ""
  ),
  description: conditionalDefault(
    z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars),
    config.card.descriptionMinChars,
    ""
  ),
  greeting: greetingSchema,
  alt_greetings: conditionalDefault(
    z.array(greetingSchema).min(config.card.altGreetingsMinCount).max(config.card.altGreetingsMaxCount),
    config.card.altGreetingsMinCount,
    []
  ),
  msg_examples: conditionalDefault(
    z.string().min(config.card.msgExamplesMinChars).max(config.card.msgExamplesMaxChars),
    config.card.msgExamplesMinChars,
    ""
  ),
  system_prompt: conditionalDefault(
    z.string().min(config.card.systemPromptMinChars).max(config.card.systemPromptMaxChars),
    config.card.systemPromptMinChars,
    ""
  ),
  jailbreak: conditionalDefault(
    z.string().min(config.card.jailbreakMinChars).max(config.card.jailbreakMaxChars),
    config.card.jailbreakMinChars,
    ""
  )
});
const worldSchema = z.object({
  description: conditionalDefault(
    z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars),
    config.card.descriptionMinChars,
    ""
  )
});

export const cardTagSchema = z
  .string()
  .min(config.card.tagMinChars)
  .max(config.card.tagMaxChars)
  .regex(/^[a-z0-9-\s]+$/, "Tag must be lowercase alphanumeric with dash and spaces allowed.");
export const cardTagsSchema = conditionalDefault(
  z.array(cardTagSchema).min(config.card.tagsMinCount).max(config.card.tagsMaxCount),
  config.card.tagsMinCount,
  []
);
const metaSchema = z.object({
  title: z.string().min(config.card.titleMinChars).max(config.card.titleMaxChars),
  notes: conditionalDefault(
    z.string().min(config.card.notesMinChars).max(config.card.notesMaxChars),
    config.card.notesMinChars,
    ""
  ),
  tagline: conditionalDefault(
    z.string().min(config.card.tagLineMinChars).max(config.card.taglineMaxChars),
    config.card.tagLineMinChars,
    ""
  ),
  tags: cardTagsSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().or(z.literal("")).optional(),
  creator: z.object({
    card: conditionalDefault(z.string().min(0).max(config.persona.nameMaxChars), 0, ""),
    character: conditionalDefault(z.string().min(0).max(config.persona.nameMaxChars), 0, ""),
    world: conditionalDefault(z.string().min(0).max(config.persona.nameMaxChars), 0, "")
  })
});

export const cardSchema = z.object({
  spec: z.literal("anime.gf"),
  spec_version: z.literal("1.0"),
  character: characterSchema,
  world: worldSchema,
  meta: metaSchema
});

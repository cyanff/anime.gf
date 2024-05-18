import { config } from "@shared/config";
import { z } from "zod";

// =========================================================
//  Card
// =========================================================
const characterFormSchema = z.object({
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
  greeting: z.string().min(config.card.greetingMinChars).max(config.card.greetingMaxChars),
  msg_examples: z.string().min(config.card.msgExamplesMinChars).max(config.card.msgExamplesMaxChars),
  avatarFilePath: z.string().optional(),
  bannerFilePath: z.string().optional()
});
const worldFormSchema = z.object({
  description: z.string().min(config.card.descriptionMinChars).max(config.card.descriptionMaxChars)
});
const metaFormSchema = z.object({
  title: z
    .string()
    .min(config.card.titleMinChars)
    .max(config.card.titleMaxChars)
    .regex(
      /^[\p{L}\p{N}_ -]+$/u,
      "Invalid input. Only Unicode letters, numbers, spaces, hyphens, and underscores are allowed."
    ),
  notes: z.string().min(config.card.notesMinChars).max(config.card.notesMaxChars),
  tagline: z.string().min(config.card.tagLineMinChars).max(config.card.taglineMaxChars),
  // TODO: this should be z.array(z.string()) instead, this is hacky
  // Change this when you polish tag support
  // Use React Aria https://react-spectrum.adobe.com/react-aria/TagGroup.html
  // Tags are a list of strings, all lowercase, alphanumeric, with dashes and spaces allowed.
  tags: z
    .string()
    .min(1)
    .max(512)
    .regex(/^[a-z0-9-\s]+$/, "Tag must be lowercase alphanumeric with dash and spaces allowed.")
});

export const cardFormSchema = z.object({
  character: characterFormSchema,
  world: worldFormSchema,
  meta: metaFormSchema
});

// =========================================================
//  Persona
// =========================================================
export const personaFormSchema = z.object({
  name: z
    .string()
    .min(config.persona.nameMinChars)
    .max(config.persona.nameMaxChars)
    .regex(/^[a-zA-Z0-9 -]*$/, "Name can only contain letters, numbers, spaces, and hyphens"),
  description: z.string().max(config.persona.descriptionMaxChars),
  isDefault: z.boolean(),
  avatarURI: z.string().optional(),
  bannerURI: z.string().optional()
});

import { cardSchema, personaSchema } from "@shared/schema/schema";
import { z } from "zod";

export const SQLiteRunSchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional()
});

export const SQLiteAllSchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional()
});

export const SQLiteGetSchema = z.object({
  query: z.string(),
  params: z.array(z.any()).optional()
});

export const SQLiteRunAsTransactionSchema = z.object({
  queries: z.array(z.string()),
  params: z.array(z.array(z.any())).optional()
});

export const CreateCardBundleSchema = z.object({
  data: cardSchema,
  bannerFilePath: z.string().optional(),
  avatarFilePath: z.string().optional()
});

export const UpdateCardBundleSchema = z.object({
  id: z.number(),
  data: cardSchema,
  bannerFilePath: z.string().optional(),
  avatarFilePath: z.string().optional()
});

export const CreatePersonaBundleSchema = z.object({
  data: personaSchema,
  bannerFilePath: z.string().optional(),
  avatarFilePath: z.string().optional()
});

export const UpdatePersonaBundleSchema = z.object({
  id: z.number(),
  data: personaSchema,
  bannerFilePath: z.string().optional(),
  avatarFilePath: z.string().optional()
});

export const XFetchConfigSchema = z.object({
  timeout: z.number().optional(),
  uuid: z.string().optional()
});

export const XFetchRequestSchema = z.object({
  url: z.string(),
  body: z.object({}).optional(),
  headers: z.record(z.string()).optional(),
  config: XFetchConfigSchema.optional()
});

import { ProviderE } from "@/lib/provider/provider";
import { Persona } from "@shared/db_types";
import { Sharp } from "sharp";
import { z } from "zod";
import { cardSchema } from "./schema/schema";
import { supportedImageExts } from "./utils";

export type CardData = z.infer<typeof cardSchema>;
export type InputCardData = z.input<typeof cardSchema>;

// =========================================================
//  Card Storage
// =========================================================
export interface UICardBundle {
  id: number;
  data: CardData;
  avatarURI: string;
  bannerURI: string;
}

export interface PlatformCardBundle {
  data: CardData;
  avatarSharp?: Sharp;
  bannerSharp?: Sharp;
}

export interface RawPlatformCardBundle {
  data: object;
  avatarBuffer?: Buffer;
  bannerBuffer?: Buffer;
}

// =========================================================
//  Persona Storage
// =========================================================
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

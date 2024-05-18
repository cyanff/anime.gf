import { ProviderE } from "@/lib/provider/provider";
import { Sharp } from "sharp";
import { z } from "zod";
import { cardFormSchema, personaFormSchema } from "./schema/form";
import { XFetchConfigSchema } from "./schema/ipc";
import { cardSchema, personaSchema } from "./schema/schema";
import { supportedImageExts } from "./utils";

export type CardData = z.infer<typeof cardSchema>;
export type InputCardData = z.input<typeof cardSchema>;
export type PersonaData = z.infer<typeof personaSchema>;

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
export interface UIPersonaBundle {
  id: number;
  data: PersonaData;
  avatarURI: string;
  isDefault: boolean;
}

export interface PlatformPersonaBundle {
  data: PersonaData;
  avatarSharp?: Sharp;
  bannerSharp?: Sharp;
}

export interface RawPlatformPersonaBundle {
  data: object;
  avatarBuffer?: Buffer;
  bannerBuffer?: Buffer;
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
export type XFetchConfig = z.infer<typeof XFetchConfigSchema>;
export type CardFormData = z.infer<typeof cardFormSchema>;
export type PersonaFormData = z.infer<typeof personaFormSchema>;

import { config } from "@shared/config";
import { cardSchema } from "@shared/schema/schema";
import { PlatformCardBundle, RawPlatformCardBundle, Result } from "@shared/types";
import { sharpFormatToExt, supportedImageExts } from "@shared/utils";
import sharp from "sharp";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export const sillyCardSchema = z.object({
  spec: z.literal("chara_card_v2"),
  spec_version: z.literal("2.0"),
  data: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    description: z.string(),
    personality: z.string(),
    scenario: z.string(),
    first_mes: z.string(),
    mes_example: z.string(),
    creator_notes: z.string(),
    system_prompt: z.string(),
    post_history_instructions: z.string(),
    alternate_greetings: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    creator: z.string().optional()
  })
});
export type SillyCardData = z.infer<typeof sillyCardSchema>;

export interface ValidationOptions {
  coerce?: boolean;
}

export async function validate(
  cardBundle: RawPlatformCardBundle,
  options: ValidationOptions = { coerce: true }
): Promise<Result<PlatformCardBundle, Error>> {
  try {
    const { data, avatarBuffer, bannerBuffer } = cardBundle;

    const dataValidationRes = cardSchema.safeParse(data);
    if (!dataValidationRes.success) {
      const hrError = fromError(dataValidationRes.error);
      return { kind: "err", error: new Error(`Card data failed validation: ${hrError}`) };
    }

    let avatarSharp = avatarBuffer ? sharp(avatarBuffer, { animated: true }) : undefined;
    if (avatarSharp) {
      const metadata = await avatarSharp.metadata();
      const ext = sharpFormatToExt(metadata.format);
      const isSupportedExt = supportedImageExts.includes(ext || "");
      const isCorrectSize = metadata.width === config.card.avatarWidth && metadata.height === config.card.avatarHeight;
      const isCorrectFileSize = metadata.size ? metadata.size < config.card.avatarMaxFileSizeBytes : false;

      if (!isCorrectFileSize) {
        return {
          kind: "err",
          error: new Error(`Avatar image must be less than ${config.card.avatarMaxFileSizeBytes / 1e6}MB.`)
        };
      }

      if (options.coerce) {
        if (!isCorrectSize) {
          avatarSharp = avatarSharp.resize(config.card.avatarWidth, config.card.avatarHeight);
        }
        if (!isSupportedExt) {
          console.log("Converting avatar to PNG");
          avatarSharp = avatarSharp.toFormat("png");
          console.log(JSON.stringify(avatarSharp, null, 2));
        }
      } else {
        if (!isCorrectSize) {
          return {
            kind: "err",
            error: new Error(`Avatar image must be ${config.card.avatarWidth}x${config.card.avatarHeight} pixels.`)
          };
        }
        if (!isSupportedExt) {
          return {
            kind: "err",
            error: new Error(`Avatar image must be one of the following file types: ${supportedImageExts.join(", ")}`)
          };
        }
      }
    }

    let bannerSharp = bannerBuffer ? sharp(bannerBuffer) : undefined;
    if (bannerSharp) {
      const metadata = await bannerSharp.metadata();
      const ext = sharpFormatToExt(metadata.format);
      const isSupportedExt = supportedImageExts.includes(ext || "");
      const isCorrectSize = metadata.width === config.card.bannerWidth && metadata.height === config.card.bannerHeight;
      const isCorrectFileSize = metadata.size ? metadata.size < config.card.bannerMaxFileSizeBytes : false;

      if (!isCorrectFileSize) {
        return {
          kind: "err",
          error: new Error(`Banner image must be less than ${config.card.bannerMaxFileSizeBytes / 1e6}MB.`)
        };
      }

      if (options.coerce) {
        if (!isCorrectSize) {
          bannerSharp = bannerSharp.resize(config.card.bannerWidth, config.card.bannerHeight);
        }
        if (!isSupportedExt) {
          bannerSharp = bannerSharp.toFormat("png");
        }
      } else {
        if (!isCorrectSize) {
          return {
            kind: "err",
            error: new Error(`Banner image must be ${config.card.bannerWidth}x${config.card.bannerHeight} pixels.`)
          };
        }
        if (!isSupportedExt) {
          return {
            kind: "err",
            error: new Error(`Banner image must be one of the following file types: ${supportedImageExts.join(", ")}`)
          };
        }
      }
    }

    return { kind: "ok", value: { data: dataValidationRes.data, avatarSharp, bannerSharp } };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

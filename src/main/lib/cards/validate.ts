import { config } from "@shared/config";
import { cardSchema } from "@shared/schema/schema";
import { PlatformCardBundle, RawPlatformCardBundle, Result } from "@shared/types";
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

// TODO, validate image buffer is in supportedFileExts
// If not, convert to supported file ext
// TODO: auto resize image to correct size
export async function validate(cardBundle: RawPlatformCardBundle): Promise<Result<PlatformCardBundle, Error>> {
  const { data, avatarBuffer, bannerBuffer } = cardBundle;

  const dataValidationRes = cardSchema.safeParse(data);

  if (!dataValidationRes.success) {
    const hrError = fromError(dataValidationRes.error);
    return { kind: "err", error: new Error(`Card data failed validation: ${hrError}`) };
  }

  let avatarSharp: sharp.Sharp | undefined;
  if (avatarBuffer) {
    avatarSharp = sharp(avatarBuffer);
    const avatarMetadata = await avatarSharp.metadata();
    if (avatarMetadata.width !== config.card.avatarWidth || avatarMetadata.height !== config.card.avatarHeight) {
      return {
        kind: "err",
        error: new Error(`Avatar image must be ${config.card.avatarWidth}x${config.card.avatarHeight} pixels.`)
      };
    }
    if (avatarBuffer.length > config.card.avatarMaxFileSizeBytes) {
      return {
        kind: "err",
        error: new Error(`Avatar image must be less than ${config.card.avatarMaxFileSizeBytes / 1e6}MB.`)
      };
    }
  }

  let bannerSharp: sharp.Sharp | undefined;
  if (bannerBuffer) {
    bannerSharp = sharp(bannerBuffer);
    const bannerMetadata = await bannerSharp.metadata();
    if (bannerMetadata.width !== config.card.bannerWidth || bannerMetadata.height !== config.card.bannerHeight) {
      return {
        kind: "err",
        error: new Error(`Banner image must be ${config.card.bannerWidth}x${config.card.bannerHeight} pixels.`)
      };
    }
    if (bannerBuffer.length > config.card.bannerMaxFileSizeBytes) {
      return {
        kind: "err",
        error: new Error(`Banner image must be less than ${config.card.bannerMaxFileSizeBytes / 1e6}MB.`)
      };
    }
  }

  return { kind: "ok", value: { data: dataValidationRes.data, avatarSharp, bannerSharp } };
}

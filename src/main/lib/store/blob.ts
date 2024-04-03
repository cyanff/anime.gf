// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.

import fs from "fs/promises";
import { fileExistsAndAccessible } from "../utils";
import path from "path";
import { Result, isError } from "@shared/utils";
import { blobPath, cardsPath } from "../utils";
import { Card } from "@shared/types";
import JSZip from "jszip";

async function init() {
  const blobDirExists = await fileExistsAndAccessible(blobPath);
  if (!blobDirExists) {
    await fs.mkdir(blobPath);
  }

  const cardsDirExists = await fileExistsAndAccessible(cardsPath);
  if (!cardsDirExists) {
    await fs.mkdir(cardsPath);
  }
}

export namespace cards {
  /**
   * Gets card data from a card zip file given a file name (not including file extension).
   *
   * Looks for a zip file with the given name in the cardsPath.
   * The following files are expected to be in the zip:
   * - card.json
   * - avatar.png
   * - banner.png
   *
   * @param name The name of the card to get.
   * @returns A result object containing the CardData if successful, else error.
   *
   */
  export async function get(name: string): Promise<Result<Card, Error>> {
    const zipPath = path.join(cardsPath, `${name}.zip`);
    const zipExists = await fileExistsAndAccessible(zipPath);
    if (!zipExists) {
      return { kind: "err", error: new Error(`Card "${name}" not found`) };
    }
    const zip = await JSZip.loadAsync(await fs.readFile(zipPath));

    const cardFile = zip.file("card.json");
    if (!cardFile) {
      return { kind: "err", error: new Error(`card.json not found in "${name}.zip"`) };
    }
    const card = JSON.parse(await cardFile.async("text"));

    const avatarFile = zip.file("avatar.png");
    if (!avatarFile) {
      return { kind: "err", error: new Error(`avatar.png not found in "${name}.zip"`) };
    }
    const avatar = await avatarFile.async("base64");

    const bannerFile = zip.file("banner.png");
    if (!bannerFile) {
      return { kind: "err", error: new Error(`banner.png not found in "${name}.zip"`) };
    }
    const banner = await bannerFile.async("base64");

    return {
      kind: "ok",
      value: {
        card,
        avatar,
        banner
      }
    };
  }
}

export default {
  init,
  cards
};

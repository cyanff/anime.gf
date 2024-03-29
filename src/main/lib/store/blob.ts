// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.

import fs from "fs/promises";
import { fileExistsAndAccessible } from "../utils";
import path from "path";
import { Result, isError } from "@shared/utils";
import { blobPath, cardsPath } from "../utils";

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
   * Get a card's file Buffer given a it's file name (with file extension)
   * @param card The card's name with file extension
   * @returns A Result object with the card's buffer or an error
   * @example
   * const bufferRes = await get("card1.png");
   */
  export async function get(card: string): Promise<Result<Buffer, Error>> {
    try {
      return { kind: "ok", value: await fs.readFile(path.join(cardsPath, card)) };
    } catch (e) {
      isError(e);
      return { kind: "err", error: e };
    }
  }
}

export default {
  init,
  cards
};

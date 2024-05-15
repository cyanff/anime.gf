/**
 * Blob storage manages all non structured data.
 * This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.
 */

import fsp from "fs/promises";
import path from "path";
import { cards } from "../cards/cards";
import { personas } from "../personas";
import { attainable, blobRootPath, cardsRootPath, copyFolder, resourcesPath } from "../utils";

async function init() {
  const blobDirExists = await attainable(blobRootPath);
  if (!blobDirExists) {
    await fsp.mkdir(blobRootPath);
  }

  const cardsDirExists = await attainable(cardsRootPath);
  // Copy unpackedPath/blob/cards to cardsRootPath
  if (!cardsDirExists) {
    await fsp.mkdir(cardsRootPath);
    copyFolder(path.join(resourcesPath, "blob/cards"), cardsRootPath);
  }
}

export default {
  init,
  cards,
  personas
};

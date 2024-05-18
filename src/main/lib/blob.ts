import { deepFreeze } from "@shared/utils";
import fsp from "fs/promises";
import path from "path";
import { attainable, blobRootPath, cardsRootPath, copyFolder, resourcesPath } from "./utils";
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

export const blob = {
  init
};
deepFreeze(blob);

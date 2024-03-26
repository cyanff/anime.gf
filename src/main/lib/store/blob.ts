// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.

import fs from "fs/promises";
import { fileExistsAndAccessible } from "../utils/misc";
import path from "path";
import { app } from "electron";

export async function init() {
  const blobPath = path.join(app.getPath("userData"), "blob");
  const blobFolderExists = await fileExistsAndAccessible(blobPath);
  if (!blobFolderExists) {
    await fs.mkdir(blobPath);
  }

  const cardsPath = path.join(blobPath, "cards");
  const cardsFolderExists = await fileExistsAndAccessible(cardsPath);
  if (!cardsFolderExists) {
    await fs.mkdir(cardsPath);
  }
}

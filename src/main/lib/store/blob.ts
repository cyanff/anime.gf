// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.

import { CardBundle, CardBundleWithoutID, PersonaBundleWithoutData } from "@shared/types";
import { Result, isError } from "@shared/utils";
import fs from "fs/promises";
import path from "path";
import { attainable, blobPath, cardsPath, personasPath } from "../utils";
import { nativeImage } from "electron";

async function init() {
  const blobDirExists = await attainable(blobPath);
  if (!blobDirExists) {
    await fs.mkdir(blobPath);
  }

  const cardsDirExists = await attainable(cardsPath);
  if (!cardsDirExists) {
    await fs.mkdir(cardsPath);
  }
}

/**
  * Retrieves an image from the specified path.
  * @param path - The path to the image file.
  * @returns A promise that resolves to a Result object containing the image or an error.
  */
export namespace image {
  export async function get(path: string): Promise<Result<any, Error>> {
    const image = nativeImage.createFromPath(path);
    return { kind: "ok", value: image };
  }
}

export namespace cards {
  /**
   * Gets card data under the appData/blob/cards directory given a card dir name.
   *
   * Looks for a directory with the given name in the cardsPath.
   * The following files are expected to be in the directory:
   * - card.json
   * - avatar.png
   * - banner.png
   *
   * @param name The name of the card directory to get.
   * @returns A result object containing the CardResources if successful, else error.
   *
   */
  export async function get(name: string): Promise<Result<CardBundleWithoutID, Error>> {
    const dirPath = path.join(cardsPath, name);
    if (!(await attainable(dirPath))) {
      return { kind: "err", error: new Error(`Card folder "${name}" not found`) };
    }

    const dataFilePath = path.join(dirPath, "data.json");
    if (!(await attainable(dataFilePath))) {
      return { kind: "err", error: new Error(`data.json not found in "${name}" folder`) };
    }

    let data;
    try {
      data = JSON.parse(await fs.readFile(dataFilePath, "utf8"));
    } catch (e) {
      isError(e);
      return { kind: "err", error: e };
    }

    const uriPrefix = "agf:///cards/";
    const avatarFilePath = path.join(dirPath, "avatar.png");
    const avatarFileExists = await attainable(avatarFilePath);
    const avatarURI = avatarFileExists ? uriPrefix + name + "/avatar.png" : "";
    const bannerFilePath = path.join(dirPath, "banner.png");
    const bannerFileExists = await attainable(bannerFilePath);
    const bannerURI = bannerFileExists ? uriPrefix + name + "/banner.png" : "";

    return {
      kind: "ok",
      value: {
        data: data,
        avatarURI,
        bannerURI
      }
    };
  }
}

export namespace personas {
  export async function get(name: string): Promise<Result<PersonaBundleWithoutData, Error>> {
    const dirPath = path.join(personasPath, name);
    if (!(await attainable(dirPath))) {
      return { kind: "err", error: new Error(`Persona folder "${name}" not found`) };
    }
    const uriPrefix = "agf:///personas/";
    const avatarFilePath = path.join(dirPath, "avatar.png");
    const avatarFileExists = await attainable(avatarFilePath);
    const avatarURI = avatarFileExists ? uriPrefix + name + "/avatar.png" : "";
    return {
      kind: "ok",
      value: {
        avatarURI
      }
    };
  }

  export async function rename(currentName: string, newName: string): Promise<Result<undefined, Error>> {
    const currentDir = path.join(personasPath, currentName);
    if (!(await attainable(currentDir))) {
      return { kind: "err", error: new Error(`Persona folder "${currentName}" not found or inaccessible`) };
    }

    const newDir = path.join(personasPath, newName);
    try {
      await fs.rename(currentDir, newDir);
    } catch (e) {
      isError(e);
      return { kind: "err", error: e };
    }
    return { kind: "ok", value: undefined };
  }
}

export default {
  init,
  image,
  cards,
  personas
};

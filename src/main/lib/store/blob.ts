// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.

import { CardBundle, PersonaBundleWithoutData } from "@shared/types";
import { Result, isError } from "@shared/utils";
import fs from "fs/promises";
import path from "path";
import { attainable, blobPath, cardsPath, personasPath } from "../utils";

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
  export async function get(name: string): Promise<Result<CardBundle, Error>> {
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
}

export default {
  init,
  cards,
  personas
};

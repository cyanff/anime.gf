// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.
import { CardBundleWithoutID, CardData, PersonaBundleWithoutData } from "@shared/types";
import { Result, isError, isValidName, toPathEscapedStr } from "@shared/utils";
import fs from "fs";
import fsp from "fs/promises";
import archiver from "archiver";
import { app, dialog, nativeImage } from "electron";
import path, { parse } from "path";
import { attainable, blobPath, cardsPath, extractZipToDir, personasPath } from "../utils";
import JSZip from "jszip";
import crypto from "crypto";
import sqlite from "./sqlite";

async function init() {
  const blobDirExists = await attainable(blobPath);
  if (!blobDirExists) {
    await fsp.mkdir(blobPath);
  }

  const cardsDirExists = await attainable(cardsPath);
  if (!cardsDirExists) {
    await fsp.mkdir(cardsPath);
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

// =====================================================================
// Cards Blob Storage
// =====================================================================
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
      data = JSON.parse(await fsp.readFile(dataFilePath, "utf8"));
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

  /**
   * Given a card directory name, zips the directory, and display a save dialog to save the zip file.
   * @param name The name of the card directory to export
   */
  export async function exportToZip(name: string) {
    const cardDirPath = path.join(cardsPath, name);
    if (!(await attainable(cardDirPath))) {
      throw new Error(`Card folder "${name}" not found`);
    }

    // Show the user a dialog to select the save location
    const dialogDefaultPath = path.join(app.getPath("desktop"), `${name}.zip`);
    const zipFilePath = await dialog.showSaveDialog({
      defaultPath: dialogDefaultPath,
      filters: [{ name: "Zip Files", extensions: ["zip"] }]
    });

    if (zipFilePath.canceled || !zipFilePath.filePath) {
      return;
    }

    // Zip the card directory
    try {
      const output = fs.createWriteStream(zipFilePath.filePath);
      const archive = archiver("zip", {
        // Sets the compression level.
        zlib: { level: 5 }
      });
      archive.pipe(output);
      archive.directory(cardDirPath, false);
      await archive.finalize();
    } catch (e) {
      isError(e);
      throw e;
    }
  }

  async function _validateAndGetCardData(zip: string): Promise<Result<CardData, Error>> {
    const zipData = await fs.promises.readFile(zip);
    const jszip = await JSZip.loadAsync(zipData);

    const dataJSONFile = jszip.file("data.json");
    if (!dataJSONFile) {
      return { kind: "err", error: new Error("data.json not found in card's zip") };
    }

    const dataJSONContent = await dataJSONFile.async("string");

    let parsedData: CardData;
    try {
      parsedData = JSON.parse(dataJSONContent);
    } catch (e) {
      return { kind: "err", error: new Error("data.json is not valid JSON and could not be parsed.") };
    }

    if (parsedData.spec !== "anime.gf") {
      return { kind: "err", error: new Error("data.json card spec is not conformant to anime.gf.") };
    }

    return { kind: "ok", value: parsedData };
  }

  export async function importFromZip(zip: string): Promise<Result<void, Error>> {
    if (!(await attainable(zip))) {
      return { kind: "err", error: new Error(`Zip file "${zip}" not accessible.`) };
    }

    const validateRes = await _validateAndGetCardData(zip);
    if (validateRes.kind === "err") {
      return validateRes;
    }

    const charName = validateRes.value.character.name;
    if (!isValidName(charName)) {
      return {
        kind: "err",
        error: new Error(
          `Character name "${charName}" is invalid. Names must only include alphanumeric symbols, spaces, and hyphens.`
        )
      };
    }

    const pathEscapedCharName = toPathEscapedStr(charName);
    const cardDirName = `${pathEscapedCharName}-${crypto.randomUUID()}`;
    const cardDirPath = path.join(cardsPath, cardDirName);

    // Extract the zip to the card directory
    await fsp.mkdir(cardDirPath);
    const extractRes = await extractZipToDir(zip, cardDirPath);
    if (extractRes.kind === "err") {
      return extractRes;
    }

    // Insert the card into the database
    try {
      const query = `INSERT INTO cards (dirName) VALUES (?);`;
      sqlite.run(query, [cardDirName]);

      return { kind: "ok", value: undefined };
    } catch (e) {
      // Clean up the card directory if the query fails
      await fsp.rmdir(cardDirPath, { recursive: true });
      return { kind: "err", error: new Error(`Failed to insert card "${cardDirName}" into the database.`) };
    }
  }
}

// =====================================================================
// Personas Blob Storage
// =====================================================================
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
      await fsp.rename(currentDir, newDir);
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

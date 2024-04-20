// Blob storage manages all non structured data.
// This includes silly tavern cards, images, audio, base weights, lora adapters, and other binary data.
import { CardBundleWithoutID, CardData, PersonaBundleWithoutData } from "@shared/types";
import { Result, isError, isValidFileName, toPathEscapedStr } from "@shared/utils";
import archiver from "archiver";
import crypto from "crypto";
import { app, dialog, nativeImage } from "electron";
import fs from "fs";
import fsp from "fs/promises";
import JSZip from "jszip";
import path from "path";
import { attainable, blobPath, cardsPath, personasPath, extractZipToDir } from "../utils";
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

    // TODO: Promise.all() to fetch both URIs asynchronously
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
   * @returns A void Result object
   */
  export async function exportToZip(name: string): Promise<Result<void, Error>> {
    const cardDirPath = path.join(cardsPath, name);
    if (!(await attainable(cardDirPath))) {
      return { kind: "err", error: new Error(`Card folder "${name}" not found`) };
    }

    // Show the user a dialog to select the save location
    const dialogDefaultPath = path.join(app.getPath("desktop"), `${name}.zip`);
    const zipFilePath = await dialog.showSaveDialog({
      defaultPath: dialogDefaultPath,
      filters: [{ name: "Zip Files", extensions: ["zip"] }]
    });

    if (zipFilePath.canceled || !zipFilePath.filePath) {
      return { kind: "ok", value: undefined };
    }

    // Zip the card directory
    try {
      const output = fs.createWriteStream(zipFilePath.filePath);
      const archive = archiver("zip", {
        zlib: { level: 5 }
      });
      archive.pipe(output);
      archive.directory(cardDirPath, false);
      await archive.finalize();
      return { kind: "ok", value: undefined };
    } catch (e) {
      isError(e);
      return { kind: "err", error: e };
    }
  }

  /**
   * Validates the contents of a zip file and extracts the card's data.json
   *
   * @param zip - The path to the zip file containing the card data.
   * @returns A `Result` containing the parsed card data or an error if the zip file is invalid.
   */
  async function _validateAndGetCardData(zip: string): Promise<Result<CardData, Error>> {
    const zipData = await fs.promises.readFile(zip);
    const jszip = await JSZip.loadAsync(zipData);

    // Validates that the zip contains a data.json
    const dataJSONFile = jszip.file("data.json");
    if (!dataJSONFile) {
      return { kind: "err", error: new Error("data.json not found in card's zip") };
    }

    // Validates that data.json is valid JSON
    const dataJSONContent = await dataJSONFile.async("string");
    let parsedData: CardData;
    try {
      parsedData = JSON.parse(dataJSONContent);
    } catch (e) {
      return { kind: "err", error: new Error("data.json is not valid JSON and could not be parsed.") };
    }

    // Validates that the data.json conforms to the anime.gf spec
    if (parsedData.spec !== "anime.gf") {
      return { kind: "err", error: new Error("data.json card spec is not conformant to anime.gf.") };
    }
    return { kind: "ok", value: parsedData };
  }

  /**
   * Imports a card from a zip file and inserts it into the database.
   *
   * @param zip - The path to the zip file containing the card data.
   * @returns A `Result` object indicating success or failure, and an optional error.
   */
  export async function importFromZip(zip: string): Promise<Result<void, Error>> {
    if (!(await attainable(zip))) {
      return { kind: "err", error: new Error(`Zip file "${zip}" not accessible.`) };
    }

    const validateRes = await _validateAndGetCardData(zip);
    if (validateRes.kind === "err") {
      return validateRes;
    }

    // Validate the character name
    const charName = validateRes.value.character.name;
    if (!isValidFileName(charName)) {
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

    // Insert an entry for the card into the database
    try {
      const query = `INSERT INTO cards (dir_name) VALUES (?);`;
      sqlite.run(query, [cardDirName]);
      return { kind: "ok", value: undefined };
    } catch (e) {
      // Roll back on error
      await fsp.rm(cardDirPath, { recursive: true });
      return { kind: "err", error: e };
    }
  }

  /**
   * Saves the card data, banner image, and avatar image to the file system.
   * @param cardData - The data of the card to be saved.
   * @param bannerImage - The path to the banner image file, or null if no banner image is provided.
   * @param avatarImage - The path to the avatar image file, or null if no avatar image is provided.
   * @returns A promise that resolves to a Result object containing the path to the saved directory on success, or an error on failure.
   */
  export async function post(
    cardData: CardData,
    bannerImage: string | null,
    avatarImage: string | null
  ): Promise<Result<undefined, Error>> {
    
    const pathEscapedCharName = toPathEscapedStr(cardData.character.name);
    const cardDirName = `${pathEscapedCharName}-${crypto.randomUUID()}`;
    const cardDirPath = path.join(cardsPath, cardDirName);

    await fsp.mkdir(cardDirPath, { recursive: true });

    await fsp.writeFile(path.join(cardDirPath, "data.json"), JSON.stringify(cardData));

    if (avatarImage) {
      await fsp.copyFile(avatarImage, path.join(cardDirPath, "avatar.png"));
    }
    if (bannerImage) {
      await fsp.copyFile(bannerImage, path.join(cardDirPath, "banner.png"));
    }

    // Insert an entry for the card into the database
    try {
      const query = `INSERT INTO cards (dir_name) VALUES (?);`;
      sqlite.run(query, [cardDirName]);

      return { kind: "ok", value: undefined };
    } catch (e) {
      // Roll back on error
      await fsp.rm(cardDirPath, { recursive: true });
      return { kind: "err", error: e };
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

  /**
   * Renames a persona folder with the given current name to the new name.
   *
   * @param currentName - The current name of the persona folder.
   * @param newName - The new name to rename the persona folder to.
   * @returns A `Result` object indicating whether the operation was successful or not.
   */
  export async function rename(currentName: string, newName: string): Promise<Result<void, Error>> {
    const currentDir = path.join(personasPath, currentName);
    if (!(await attainable(currentDir))) {
      return { kind: "err", error: new Error(`Persona folder "${currentName}" not found or inaccessible`) };
    }

    if (!isValidFileName) {
      return {
        kind: "err",
        error: new Error(`Persona folder "${newName}" has an invalid name. 
      File and directory names must only contain alphanumeric characters, spaces and hyphens.`)
      };
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

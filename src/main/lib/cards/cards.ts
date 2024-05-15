import { config } from "@shared/config";
import { md } from "@shared/md";
import { CardData, PathLike, PlatformCardBundle, Result, UICardBundle, cardTagSchema } from "@shared/types";
import { deepFreeze, isValidFileName, spacesToHyphens } from "@shared/utils";
import archiver from "archiver";
import { app, dialog } from "electron";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import tEXt from "png-chunk-text";
import extract from "png-chunks-extract";
import { v4 } from "uuid";
import { fromError } from "zod-validation-error";
import sqlite from "../store/sqlite";
import { attainable, cardsRootPath, downloadImageBuffer, extractZipToDir, pathLikeToBuffer } from "../utils";
import { SillyCardData, sillyCardSchema, validate } from "./validate";

// FIXME: Add proper transaction handling with support for rolling back *any* state as well as db state.
// Ex: rollback file creation, db insertions, etc.
// Wrap better-sqlite3

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
export async function get(name: string): Promise<Result<PlatformCardBundle, Error>> {
  const dirPath = path.join(cardsRootPath, name);
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
    return { kind: "err", error: e };
  }

  // TODO: Promise.all() to fetch both URIs asynchronously
  // TODO: extract
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
 * Posts a card to the storage.
 * @param cardData - The data of the card to be posted.
 * @param bannerFilePath - The path to the banner image, or null if no banner image is provided.
 * @param avatarFilePath - The path to the avatar image, or null if no avatar image is provided.
 * @returns A promise that resolves to a Result object indicating the success or failure of the operation.
 */
export async function create(
  cardData: CardData,
  bannerFilePath: string | null,
  avatarFilePath: string | null
): Promise<Result<undefined, Error>> {
  const pathEscapedCharName = spacesToHyphens(cardData.character.name);
  const cardDirName = `${pathEscapedCharName}-${v4}`;
  const cardDirPath = path.join(cardsRootPath, cardDirName);
  await fsp.mkdir(cardDirPath, { recursive: true });
  await fsp.writeFile(path.join(cardDirPath, "data.json"), JSON.stringify(cardData));

  if (avatarFilePath) {
    await fsp.copyFile(avatarFilePath, path.join(cardDirPath, "avatar.png"));
  }
  if (bannerFilePath) {
    await fsp.copyFile(bannerFilePath, path.join(cardDirPath, "banner.png"));
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
 * Updates the card data and images in the card directory.
 */
export async function update(
  cardID: number,
  cardData: CardData,
  bannerFilePath: string | null,
  avatarFilePath: string | null
): Promise<Result<undefined, Error>> {
  // Retrieve the dir_name of the card from the database using the id
  const query = `SELECT dir_name FROM cards WHERE id =?;`;
  const row = sqlite.get(query, [cardID]) as { dir_name: string };

  // Construct the path to the card directory
  const cardDirPath = path.join(cardsRootPath, row.dir_name);

  // Write the updated card data to the data.json file
  await fsp.writeFile(path.join(cardDirPath, "data.json"), JSON.stringify(cardData));

  // If a new avatar image is provided, copy it to the card directory
  if (avatarFilePath) {
    await fsp.copyFile(avatarFilePath, path.join(cardDirPath, "avatar.png"));
  }

  // If a new banner image is provided, copy it to the card directory
  if (bannerFilePath) {
    await fsp.copyFile(bannerFilePath, path.join(cardDirPath, "banner.png"));
  }

  return { kind: "ok", value: undefined };
}

export async function del(cardID: number): Promise<Result<undefined, Error>> {
  // Retrieve the dir_name of the card from the database using the id
  const query = `SELECT dir_name FROM cards WHERE id =?;`;
  const row = sqlite.get(query, [cardID]) as { dir_name: string };

  // Construct the path to the card directory
  const cardDirPath = path.join(cardsRootPath, row.dir_name);

  try {
    // Delete the card directory
    await fs.promises.rm(cardDirPath, { recursive: true });
    return { kind: "ok", value: undefined };
  } catch (error) {
    return { kind: "err", error: error };
  }
}

async function import_(filePath: string): Promise<Result<void, Error>> {
  if (!(await attainable(filePath))) {
    return { kind: "err", error: new Error(`File "${filePath}" not accessible.`) };
  }
  const ext = path.extname(filePath).toLowerCase();

  const stats = await fsp.stat(filePath);
  if (stats.size > config.card.maxFileSizeBytes) {
    return {
      kind: "err",
      error: new Error(
        `File is too large. Max size is ${config.card.maxFileSizeBytes / 1e6}MB. File is ${stats.size / 1e6}MB.`
      )
    };
  }

  switch (ext) {
    case ".zip":
      return await _agfImport(filePath);
    case ".json":
    case ".png":
      return await _sillyImport(filePath);
    default:
      return { kind: "err", error: new Error(`Unsupported file type: ${ext}`) };
  }
}

async function _sillyImport(filePath: string): Promise<Result<void, Error>> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".json" && ext !== ".png") {
    return { kind: "err", error: new Error("Invalid file type for SillyTavern card. Must be .json or .png.") };
  }

  // Read silly tavern data based on it's file type
  const isPNG = ext === ".png";
  let data: string;
  if (isPNG) {
    const dataRes = await _pngToCharacterData(filePath);
    if (dataRes.kind === "err") {
      return dataRes;
    }
    data = dataRes.value;
  } else {
    data = await fsp.readFile(filePath, "utf8");
  }
  // Parse and convert to AGF card
  const parseRes = sillyCardSchema.safeParse(JSON.parse(data));
  if (!parseRes.success) {
    const hrError = fromError(parseRes.error);
    return { kind: "err", error: new Error(`Invalid SillyTavern card: ${hrError}`) };
  }
  const sillyCard: SillyCardData = parseRes.data;
  const agfCard = await _sillyCardToAGFCard(sillyCard);

  const cardDirRes = await _nameToCardDir(agfCard.character.name);
  if (cardDirRes.kind === "err") return cardDirRes;
  const { dirName, dirPath } = cardDirRes.value;

  // Get avatar path
  let avatarPath: PathLike | undefined;
  if (isPNG) {
    avatarPath = filePath;
  } else {
    if (sillyCard.data.avatar && sillyCard.data.avatar !== "none") {
      const bufferRes = await downloadImageBuffer(sillyCard.data.avatar);
      if (bufferRes.kind === "ok") {
        avatarPath = bufferRes.value;
      }
    }
  }

  // Validate
  const validationRes = await validate(agfCard, avatarPath);
  if (validationRes.kind === "err") {
    return validationRes;
  }

  // Save
  try {
    await fsp.mkdir(dirPath);
    await fsp.writeFile(path.join(dirPath, "data.json"), JSON.stringify(agfCard, null, 2));
    if (avatarPath) {
      const bufferRes = await pathLikeToBuffer(avatarPath);
      if (bufferRes.kind === "ok") {
        await fsp.writeFile(path.join(dirPath, "avatar.png"), bufferRes.value);
      }
    }
    const query = `INSERT INTO cards (dir_name) VALUES (?);`;
    sqlite.run(query, [dirName]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    await fsp.rm(dirPath, { recursive: true });
    return { kind: "err", error: e };
  }
}

async function _sillyCardToAGFCard(sillyCard: SillyCardData): Promise<CardData> {
  // Convert all possible tags, filter out invalid ones, and limit to max count
  const cleanedTags = sillyCard.data.tags
    .map((tag) => tag.toLowerCase().trim())
    .filter((tag) => {
      const res = cardTagSchema.safeParse(tag);
      return res.success;
    })
    .slice(0, config.card.tagsMaxCount);
  const cleanedName = sillyCard.data.name.replace(/[^\p{L}\p{N}_ -]/gu, "_").substring(0, config.card.nameMaxChars);
  const creatorName = sillyCard.data.creator?.substring(0, config.card.nameMaxChars) || "";
  const cleanedCreatorName = creatorName.replace(/[^\p{L}\p{N}_ -]/gu, "_");

  const notes = sillyCard.data.creator_notes;
  const trimmedCreatorNotes = notes.substring(0, config.card.notesMaxChars);
  const trimmedTagline = md.strip(notes, {}).substring(0, config.card.taglineMaxChars);

  const description = [sillyCard.data.description, sillyCard.data.personality, sillyCard.data.scenario].join("\n");
  const trimmedDescription = description.substring(0, config.card.descriptionMaxChars);

  const trimmedGreeting = sillyCard.data.first_mes.substring(0, config.card.greetingMaxChars);

  const trimmedAltGreetings =
    sillyCard.data.alternate_greetings?.map((greeting) => greeting.substring(0, config.card.greetingMaxChars)) || [];
  const trimmeMsgExamples = sillyCard.data.mes_example.substring(0, config.card.msgExamplesMaxChars);
  const trimmedSystemPrompt = sillyCard.data.system_prompt.substring(0, config.card.systemPromptMaxChars);
  const trimmedPostHistoryInstructions = sillyCard.data.post_history_instructions.substring(
    0,
    config.card.jailbreakMaxChars
  );

  const agfCard: CardData = {
    spec: "anime.gf",
    spec_version: "1.0",
    character: {
      name: cleanedName,
      description: trimmedDescription,
      greeting: trimmedGreeting,
      alt_greetings: trimmedAltGreetings,
      msg_examples: trimmeMsgExamples,
      system_prompt: trimmedSystemPrompt,
      jailbreak: trimmedPostHistoryInstructions
    },
    world: {
      description: ""
    },
    meta: {
      title: cleanedName,
      notes: trimmedCreatorNotes,
      tagline: trimmedTagline,
      tags: cleanedTags,
      created_at: new Date().toISOString(),
      creator: {
        card: cleanedCreatorName,
        character: cleanedCreatorName,
        world: ""
      }
    }
  };

  return agfCard;
}

async function _pngToCharacterData(pngPath: string): Promise<Result<any, Error>> {
  try {
    const buffer = await fsp.readFile(pngPath);
    const texts = extract(buffer)
      .filter((chunk) => chunk.name === "tEXt")
      .map((chunk) => tEXt.decode(chunk.data));

    if (!texts) {
      return { kind: "err", error: new Error("No tEXt chunks found in PNG") };
    }
    const base64 = texts.find((text) => text.keyword.toLowerCase() === "chara")?.text;
    if (!base64) {
      return { kind: "err", error: new Error("No 'chara' tEXt chunk found in PNG") };
    }
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    return { kind: "ok", value: decoded };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function _agfImport(zipPath: string): Promise<Result<void, Error>> {
  const validationRes = await validateZIP(zipPath);
  if (validationRes.kind === "err") {
  }

  const cardDirRes = await _nameToCardDir(validateRes.data.character.name);
  if (cardDirRes.kind === "err") {
    return cardDirRes;
  }
  const { dirName, dirPath } = cardDirRes.value;

  try {
    await fsp.mkdir(dirPath);
    const extractRes = await extractZipToDir(zipPath, dirPath);
    if (extractRes.kind === "err") {
      return extractRes;
    }
    const query = `INSERT INTO cards (dir_name) VALUES (?);`;
    sqlite.run(query, [dirName]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    await fsp.rm(dirPath, { recursive: true });
    return { kind: "err", error: e };
  }
}

async function _nameToCardDir(name: string): Promise<Result<{ dirName: string; dirPath: string }, Error>> {
  if (!isValidFileName(name)) {
    return {
      kind: "err",
      error: new Error(
        `Character name "${name}" is invalid. Names must only include alphanumeric symbols, spaces, and hyphens.`
      )
    };
  }
  const pathEscapedCharName = spacesToHyphens(name);
  const dirName = `${pathEscapedCharName}-${v4()}`;
  const dirPath = path.join(cardsRootPath, dirName);
  return { kind: "ok", value: { dirName, dirPath } };
}

async function export_(name: string) {
  const cardDirPath = path.join(cardsRootPath, name);
  if (!(await attainable(cardDirPath))) {
    return { kind: "err", error: new Error(`Card folder "${name}" not found`) };
  }

  // Show user a dialog to select the save location
  const dialogDefaultPath = path.join(app.getPath("desktop"), `${name}.zip`);
  const zipFilePath = await dialog.showSaveDialog({
    defaultPath: dialogDefaultPath,
    filters: [{ name: "Zip Files", extensions: ["zip"] }]
  });

  if (zipFilePath.canceled || !zipFilePath.filePath) {
    return { kind: "err", error: new Error("Export canceled by user.") };
  }

  // Zip up the card directory
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
    return { kind: "err", error: e };
  }
}

export const cards = {
  import_,
  export_,
  get,
  create,
  update,
  del
};
deepFreeze(cards);

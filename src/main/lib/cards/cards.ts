import { config } from "@shared/config";
import { CardData, Result, UICardBundle } from "@shared/types";
import { deepFreeze, supportedImageExts } from "@shared/utils";
import { app, dialog } from "electron";
import fsp from "fs/promises";
import path from "path";
import { fromError } from "zod-validation-error";
import sqlite from "../sqlite";
import { attainable, cardsRootPath, downloadImageBuffer } from "../utils";
import { SillyCardData, parse, sillyCardSchema } from "./parse";
import { readData, readDir, readFilePathCardBundle, readZIP } from "./read";
import { _pngToCharacterData, _sillyCardToAGFCard, getDBCardFromID } from "./utils";
import { del, writeDir, writeZIP } from "./write";

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
export async function get(id: number): Promise<Result<UICardBundle, Error>> {
  const query = `SELECT dir_name FROM cards WHERE id = ?;`;
  let cardDirname: string;

  try {
    const row = sqlite.get(query, [id]) as { dir_name: string };
    cardDirname = row.dir_name;
  } catch (e) {
    return { kind: "err", error: e };
  }

  const dataRes = await readData(cardDirname);
  if (dataRes.kind === "err") return dataRes;

  const [avatarURI, bannerURI] = await Promise.all([
    _getImageURI(cardDirname, "avatar"),
    _getImageURI(cardDirname, "banner")
  ]);

  return {
    kind: "ok",
    value: {
      id,
      data: dataRes.value,
      avatarURI,
      bannerURI
    }
  };
}

async function _getImageURI(cardDirname: string, imageName: string): Promise<string> {
  const uriPrefix = "agf:///cards/";
  for (const ext of supportedImageExts) {
    const imagePath = path.join(cardsRootPath, `${cardDirname}/${imageName}.${ext}`);
    try {
      if (await attainable(imagePath)) {
        return `${uriPrefix}${cardDirname}/${imageName}.${ext}`;
      }
    } catch (e) {
      continue;
    }
  }
  return "";
}

/**
 * Writes a card to storage
 */
export async function create(
  data: CardData,
  bannerFilePath?: string,
  avatarFilePath?: string
): Promise<Result<void, Error>> {
  const rawCardBundleRes = await readFilePathCardBundle(data, bannerFilePath, avatarFilePath);
  if (rawCardBundleRes.kind === "err") return rawCardBundleRes;
  const rawCardbundle = rawCardBundleRes.value;

  const validationRes = await parse(rawCardbundle);
  if (validationRes.kind === "err") return validationRes;
  const cardBundle = validationRes.value;

  return await writeDir(cardBundle);
}

/**
 * Updates the card data and images in the card directory.
 */
export async function update(
  id: number,
  data: CardData,
  bannerFilePath?: string,
  avatarFilePath?: string
): Promise<Result<void, Error>> {
  const rawCardBundleRes = await readFilePathCardBundle(data, bannerFilePath, avatarFilePath);
  if (rawCardBundleRes.kind === "err") return rawCardBundleRes;
  const rawCardbundle = rawCardBundleRes.value;

  const validationRes = await parse(rawCardbundle);
  if (validationRes.kind === "err") return validationRes;
  const cardBundle = validationRes.value;

  // Delete the old card directory
  const delRes = await del(id);
  if (delRes.kind === "err") return delRes;

  return await writeDir(cardBundle);
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
    return { kind: "err", error: new Error(`Invalid SillyTavern card: ${fromError(parseRes.error)}`) };
  }
  const sillyCard: SillyCardData = parseRes.data;
  const agfCard = await _sillyCardToAGFCard(sillyCard);

  // Get avatar buffer from either the PNG or avatar field
  let avatarBuffer: Buffer | undefined;
  if (isPNG) {
    try {
      avatarBuffer = await fsp.readFile(filePath);
    } catch (e) {
      // Skip
    }
  } else {
    if (sillyCard.data.avatar && sillyCard.data.avatar !== "none") {
      const bufferRes = await downloadImageBuffer(sillyCard.data.avatar);
      if (bufferRes.kind === "ok") {
        avatarBuffer = bufferRes.value;
      }
    }
  }

  // Validate
  const rawCardBundle = {
    data: agfCard,
    avatarBuffer
  };
  const cardBundleRes = await parse(rawCardBundle);
  if (cardBundleRes.kind === "err") {
    return cardBundleRes;
  }
  const cardBundle = cardBundleRes.value;
  return await writeDir(cardBundle);
}

async function _agfImport(zipPath: string): Promise<Result<void, Error>> {
  const rawCardBundleRes = await readZIP(zipPath);
  if (rawCardBundleRes.kind === "err") return rawCardBundleRes;
  const rawCardBundle = rawCardBundleRes.value;

  const cardBundleRes = await parse(rawCardBundle);
  if (cardBundleRes.kind === "err") return cardBundleRes;
  const cardBundle = cardBundleRes.value;
  return await writeDir(cardBundle);
}

async function export_(id: number): Promise<Result<void, Error>> {
  const cardRes = await getDBCardFromID(id);
  if (cardRes.kind === "err") return cardRes;
  const card = cardRes.value;

  // Show user a dialog to select the save location
  const dialogDefaultPath = path.join(app.getPath("desktop"), `${card.dir_name}.zip`);
  const zipFilePath = await dialog.showSaveDialog({
    defaultPath: dialogDefaultPath,
    filters: [{ name: "Zip Files", extensions: ["zip"] }]
  });

  if (zipFilePath.canceled || !zipFilePath.filePath) {
    return { kind: "err", error: new Error("Export canceled by user.") };
  }

  const rawCardBundleRes = await readDir(card.dir_name);
  if (rawCardBundleRes.kind === "err") return rawCardBundleRes;
  const rawCardBundle = rawCardBundleRes.value;

  const cardBundleRes = await parse(rawCardBundle);
  if (cardBundleRes.kind === "err") return cardBundleRes;
  const cardBundle = cardBundleRes.value;

  return await writeZIP(cardBundle, zipFilePath.filePath);
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

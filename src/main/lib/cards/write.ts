import { PlatformCardBundle, Result } from "@shared/types";
import { isValidFileName, sharpFormatToExt, spacesToHyphens } from "@shared/utils";
import archiver from "archiver";
import fs from "fs";
import fsp from "fs/promises";
import { join } from "path";
import { v4 } from "uuid";
import sqlite from "../store/sqlite";
import { cardsRootPath } from "../utils";
import { getDBCardFromID } from "./utils";

export async function writeDir(cardBundle: PlatformCardBundle, dirName?: string): Promise<Result<void, Error>> {
  const { data, avatarSharp, bannerSharp } = cardBundle;

  if (!dirName) {
    const dirNameRes = await nameToDirName(data.character.name);
    if (dirNameRes.kind === "err") return dirNameRes;
    dirName = dirNameRes.value;
  }
  const dirPath = join(cardsRootPath, dirName);

  let cardRowID: number | undefined;
  try {
    await fsp.mkdir(dirPath, { recursive: true });
    await fsp.writeFile(join(dirPath, "data.json"), JSON.stringify(data, null, 2));

    if (avatarSharp) {
      const ext = sharpFormatToExt((await avatarSharp.metadata()).format);
      if (!ext) return { kind: "err", error: new Error("Avatar image format is not supported.") };
      await avatarSharp.toFile(join(dirPath, `avatar.${ext}`));
    }
    if (bannerSharp) {
      const ext = sharpFormatToExt((await bannerSharp.metadata()).format);
      if (!ext) return { kind: "err", error: new Error("Banner image format is not supported.") };
      await bannerSharp.toFile(join(dirPath, `banner.${ext}`));
    }
    const query = `INSERT INTO cards (dir_name) VALUES (?);`;
    cardRowID = sqlite.run(query, [dirName]).lastInsertRowid as number;
    return { kind: "ok", value: undefined };
  } catch (e) {
    // Rollback
    const delRes = await del(cardRowID, dirPath);
    if (delRes.kind === "err") console.error("Error during rollback:", delRes.error);
    return { kind: "err", error: e };
  }
}

export async function del(id?: number, dirPath?: string): Promise<Result<void, Error>> {
  try {
    if (id) {
      const rollbackQuery = `DELETE FROM cards WHERE id = ?;`;
      sqlite.run(rollbackQuery, [id]);
      if (!dirPath) {
        const cardRes = await getDBCardFromID(id);
        if (cardRes.kind === "err") return cardRes;
        const card = cardRes.value;
        dirPath = join(cardsRootPath, card.dir_name);
      }
    }
    if (dirPath) {
      await fsp.rm(dirPath, { recursive: true });
    }
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export async function writeZIP(cardBundle: PlatformCardBundle, zipPath: string): Promise<Result<void, Error>> {
  try {
    const { data, avatarSharp, bannerSharp } = cardBundle;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 5 }
    });

    archive.pipe(output);

    // Add data.json
    archive.append(JSON.stringify(data, null, 2), { name: "data.json" });

    if (avatarSharp) {
      const ext = sharpFormatToExt((await avatarSharp.metadata()).format);
      if (!ext) return { kind: "err", error: new Error("Avatar image format is not supported.") };
      const avatarBuffer = await avatarSharp.toBuffer();
      archive.append(avatarBuffer, { name: `avatar.${ext}` });
    }

    if (bannerSharp) {
      const ext = sharpFormatToExt((await bannerSharp.metadata()).format);
      if (!ext) return { kind: "err", error: new Error("Banner image format is not supported.") };
      const bannerBuffer = await bannerSharp.toBuffer();
      archive.append(bannerBuffer, { name: `banner.${ext}` });
    }

    await archive.finalize();
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

async function nameToDirName(name: string): Promise<Result<string, Error>> {
  if (!isValidFileName(name)) {
    return {
      kind: "err",
      error: new Error(
        `Character name "${name}" is invalid. Names must only include alphanumeric symbols, spaces, and hyphens.`
      )
    };
  }
  const pathEscapedName = spacesToHyphens(name);
  const dirName = `${pathEscapedName}-${v4()}`;
  return { kind: "ok", value: dirName };
}

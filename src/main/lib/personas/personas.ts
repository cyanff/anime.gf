import { PersonaFormData } from "@shared/schema/form";
import { PersonaBundle, Result } from "@shared/types";
import { deepFreeze, isError, isValidFileName, spacesToHyphens } from "@shared/utils";
import fsp from "fs/promises";
import path from "path";
import { v4 } from "uuid";
import sqlite from "../sqlite";
import { attainable, personasRootPath } from "../utils";

async function get(name: string): Promise<Result<PersonaBundle, Error>> {
  const dirPath = path.join(personasRootPath, name);
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

// FIXME: Rollback handling is not correct here
// Implement proper rollback with better-sqlite transaction
// https://chat.openai.com/share/553c75a2-8057-4c82-ab9e-85092bebc2bd
async function post(data: PersonaFormData): Promise<Result<void, Error>> {
  const name = data.name;
  const description = data.description;
  const avatarURI = data.avatarURI;
  const isDefault = data.isDefault;

  if (!isValidFileName(name)) {
    return {
      kind: "err",
      error: new Error(
        `Persona has an invalid name. Names must only include alphanumeric symbols, spaces, and hyphens.`
      )
    };
  }

  const pathEscapedName = spacesToHyphens(name);
  const personaDirName = `${pathEscapedName}-${v4()}`;
  const personaDirPath = path.join(personasRootPath, personaDirName);
  try {
    await fsp.mkdir(personaDirPath, { recursive: true });
    if (avatarURI) {
      const fileEXT = path.extname(avatarURI);
      await fsp.copyFile(avatarURI, path.join(personaDirPath, `avatar${fileEXT}`));
    }

    // If the new persona will be set as default, unset the current default persona
    if (isDefault) {
      const clearDefaultsRes = await _clearDefaults();
      if (clearDefaultsRes.kind === "err") {
        return clearDefaultsRes;
      }
    }

    const query = `INSERT INTO personas (name, description, dir_name, is_default) VALUES (?, ?, ?, ?);`;
    sqlite.run(query, [name, description, personaDirName, isDefault ? 1 : 0]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    // Rollback
    await fsp.rm(personaDirPath, { recursive: true });
    return { kind: "err", error: e };
  }
}

async function _clearDefaults(): Promise<Result<void, Error>> {
  try {
    const query = `UPDATE personas SET is_default = 0 WHERE 1=1`;
    sqlite.run(query);
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

/**
 * Renames a persona folder with the given current name to the new name.
 *
 * @param currentName - The current name of the persona folder.
 * @param newName - The new name to rename the persona folder to.
 * @returns A `Result` object indicating whether the operation was successful or not.
 */
async function _rename(currentName: string, newName: string): Promise<Result<void, Error>> {
  const currentDir = path.join(personasRootPath, currentName);
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
  const newDir = path.join(personasRootPath, newName);
  try {
    await fsp.rename(currentDir, newDir);
  } catch (e) {
    isError(e);
    return { kind: "err", error: e };
  }
  return { kind: "ok", value: undefined };
}

async function put(id: number, data: PersonaFormData): Promise<Result<void, Error>> {
  const { name, description, avatarURI, isDefault } = data;

  const nameAndDirNameQuery = `SELECT name, dir_name FROM personas WHERE id = ?;`;
  const res = sqlite.get(nameAndDirNameQuery, [id]) as { name: string; dir_name: string };

  const oldName = res.name;
  const oldDirName = res.dir_name;
  const newDirName = `${spacesToHyphens(name)}-${v4()}`;
  const isNameDifferent = name !== oldName;

  if (!isValidFileName(name)) {
    return {
      kind: "err",
      error: new Error(
        `Persona has an invalid name. Names must only include alphanumeric symbols, spaces, and hyphens.`
      )
    };
  }

  // If new name is different from old name, rename the persona folder
  if (isNameDifferent) {
    const renameRes = await _rename(oldDirName, newDirName);
    if (renameRes.kind === "err") {
      return renameRes;
    }
  }

  const personaDirPath = isNameDifferent
    ? path.join(personasRootPath, newDirName)
    : path.join(personasRootPath, oldDirName);

  const personaDirName = isNameDifferent ? newDirName : oldDirName;

  // Override avatar.{jpg, jpeg, or png} with the new avatar
  if (avatarURI) {
    const avatarFiles = await fsp.readdir(personaDirPath);
    for (const file of avatarFiles) {
      if (file.startsWith("avatar.") && [".jpg", ".jpeg", ".png"].includes(path.extname(file))) {
        await fsp.unlink(path.join(personaDirPath, file));
      }
    }
    const fileEXT = path.extname(avatarURI);
    await fsp.copyFile(avatarURI, path.join(personaDirPath, `avatar${fileEXT}`));
  }

  const updatePersonaQuery = `UPDATE personas SET name = ?, description = ?, dir_name = ?, is_default = ? WHERE id = ?;`;
  try {
    // Clear existing defaults
    if (isDefault) {
      const clearDefaultsRes = await _clearDefaults();
      if (clearDefaultsRes.kind === "err") {
        return clearDefaultsRes;
      }
    }
    sqlite.run(updatePersonaQuery, [name, description, personaDirName, isDefault ? 1 : 0, id]);
    return { kind: "ok", value: undefined };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export const personas = {
  get,
  post,
  put
};

deepFreeze(personas);

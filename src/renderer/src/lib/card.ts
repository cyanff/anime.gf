/**
 * Handles card import / export
 */

import { queries } from "@/lib/queries";
import { Result } from "@shared/types";
import { deepFreeze, getFileExtension } from "@shared/utils";

async function importFromFileList(files: FileList): Promise<Result<void, Error>[]> {
  const numFiles = files.length;
  if (numFiles === 0) {
    return [];
  }

  const results: Result<void, Error>[] = [];
  for (let i = 0; i < numFiles; i++) {
    const file = files[i];
    const ext = getFileExtension(file.name);
    // Reject non-zip files
    if (ext !== "zip") {
      results.push({ kind: "err", error: new Error(`${file.name} is not a ZIP file`) });
      continue;
    }
    // Reject files larger than 50MB
    if (file.size > 5e7) {
      results.push({ kind: "err", error: new Error(`${file.name} is too large`) });
      continue;
    }
    const res = await window.api.blob.cards.importFromZip(file.path);
    results.push(res);
  }

  return results;
}

async function exportToZip(id: number): Promise<Result<void, Error>> {
  const cardDirRes = await queries.getCardDir(id);
  if (cardDirRes.kind === "err") {
    return cardDirRes;
  }
  const exportRes = await window.api.blob.cards.exportToZip(cardDirRes.value);
  return exportRes;
}

export const card = {
  importFromFileList,
  exportToZip
};
deepFreeze(card);

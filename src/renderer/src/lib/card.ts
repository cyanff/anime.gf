/**
 * Handles card import / export
 */

import { queries } from "@/lib/queries";
import { Result } from "@shared/types";
import { deepFreeze } from "@shared/utils";

async function importFromFileList(files: FileList): Promise<Result<void, Error>[]> {
  const numFiles = files.length;
  if (numFiles === 0) {
    return [];
  }

  const results: Result<void, Error>[] = [];
  for (let i = 0; i < numFiles; i++) {
    const file = files[i];
    const res = await window.api.blob.cards.import_(file.path);
    results.push(res);
  }

  return results;
}

async function exportToZip(id: number): Promise<Result<void, Error>> {
  const cardDirRes = await queries.getCardDir(id);
  if (cardDirRes.kind === "err") {
    return cardDirRes;
  }
  const exportRes = await window.api.blob.cards.export_(cardDirRes.value);
  return exportRes;
}
export const supportedCardExts = ["zip", "json", "png"];

export const card = {
  importFromFileList,
  exportToZip
};
deepFreeze(card);

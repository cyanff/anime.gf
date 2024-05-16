/**
 * Handles card import / export
 */

import { queries } from "@/lib/queries";
import { Result, UICardBundle } from "@shared/types";
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

export const card = {
  importFromFileList
};
deepFreeze(card);

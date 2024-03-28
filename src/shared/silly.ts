import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import PNGtext from "png-chunk-text";
import { Buffer } from "buffer";

// TODO: make this non blocking
// TODO: card spec interface here
// TODO: read should return a card spec object

export interface CardV2 {
  spec: "chara_card_v2";
  spec_version: "2.0";
  data: {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes: string;
    system_prompt: string;
    post_history_instructions: string;
    alternate_greetings: Array<string>;
    character_book?: CharacterBook;
    tags: Array<string>;
    creator: string;
    character_version: string;
    extensions: Record<string, any>;
  };
}

export interface CharacterBook {
  name?: string;
  description?: string;
  scan_depth?: number; // agnai: "Memory: Chat History Depth"
  token_budget?: number; // agnai: "Memory: Context Limit"
  recursive_scanning?: boolean; // no agnai equivalent. whether entry content can trigger other entries
  extensions: Record<string, any>;
  entries: Array<{
    keys: Array<string>;
    content: string;
    extensions: Record<string, any>;
    enabled: boolean;
    insertion_order: number; // if two entries inserted, lower "insertion order" = inserted higher
    case_sensitive?: boolean;

    // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
    name?: string; // not used in prompt engineering
    priority?: number; // if token budget reached, lower priority value = discarded first

    // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
    id?: number; // not used in prompt engineering
    comment?: string; // not used in prompt engineering
    selective?: boolean; // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
    secondary_keys?: Array<string>; // see field `selective`. ignored if selective == false
    constant?: boolean; // if true, always inserted in the prompt (within budget limit)
    position?: "before_char" | "after_char"; // whether the entry is placed before or after the character defs
  }>;
}

/**
 * Writes Character metadata to a PNG image buffer.
 * @param img PNG image buffer
 * @param data Character data to write
 * @returns PNG image buffer with metadata
 */

function write(img: Buffer, data: string): Buffer {
  const chunks = extract(img);
  const tEXtChunks = chunks.filter((chunk) => chunk.name === "tEXt");

  // Remove all existing tEXt chunks
  for (let tEXtChunk of tEXtChunks) {
    chunks.splice(chunks.indexOf(tEXtChunk), 1);
  }
  // Add new chunks before the IEND chunk
  const base64EncodedData = Buffer.from(data, "utf8").toString("base64");
  chunks.splice(-1, 0, PNGtext.encode("chara", base64EncodedData));
  const newBuffer = Buffer.from(encode(chunks));
  return newBuffer;
}

/**
 * Reads Character metadata from a PNG image buffer.
 * @param img PNG image buffer
 * @returns Character data
 */
function read(img: Buffer): CardV2 {
  const chunks = extract(img);

  const textChunks = chunks
    .filter(function (chunk) {
      return chunk.name === "tEXt";
    })
    .map(function (chunk) {
      return PNGtext.decode(chunk.data);
    });

  if (textChunks.length === 0) {
    console.error("PNG metadata does not contain any text chunks.");
    throw new Error("No PNG metadata.");
  }

  let index = textChunks.findIndex((chunk) => chunk.keyword.toLowerCase() == "chara");

  if (index === -1) {
    console.error("PNG metadata does not contain any character data.");
    throw new Error("No PNG metadata.");
  }

  const str = Buffer.from(textChunks[index].text, "base64").toString("utf8");
  return JSON.parse(str);
}

export default {
  write,
  read
};

import encode from "png-chunks-encode";
import extract from "png-chunks-extract";
import PNGtext from "png-chunk-text";

// TODO: make this non blocking

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
function read(img: Buffer): string {
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

  return Buffer.from(textChunks[index].text, "base64").toString("utf8");
}

export default {
  write,
  read
};

import { FormatEnum } from "sharp";

/**
 * Freeze an object along with all of it's properties and subproperties making it completely immutable.
 * This is useful because Object.freeze() only freezes the top level properties.
 * @param object The object to freeze
 * @returns The frozen object
 */
export function deepFreeze(object: any) {
  const props = Object.getOwnPropertyNames(object);

  // Iterate through all top level properties
  props.forEach((prop) => {
    const subProp = object[prop];

    // Recursively traverse sub-properties
    if (subProp && typeof subProp === "object") {
      deepFreeze(subProp);
    }
  });

  // Freeze self
  return Object.freeze(object);
}

/**
 * Remove all top level properties matching the blacklist from an object
 * @param obj The object to clone and remove properties from
 * @param blacklist A string array of properties to remove
 * @returns A new object with the properties removed
 */
export function omit(obj: any, blacklist: string[]): any {
  const deepClone = JSON.parse(JSON.stringify(obj));

  // Delete all the top level properties that are in the blacklist
  Object.getOwnPropertyNames(deepClone).forEach((prop) => {
    if (blacklist.includes(prop)) {
      delete deepClone[prop];
    }
  });

  return deepClone;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Check if the given value is of type Error, if not rethrow it.
 * https://stackoverflow.com/a/70993058
 * @param error A value that should be of type Error
 */
export function isError(error: any): asserts error is Error {
  if (!(error instanceof Error)) {
    throw error;
  }
}

// Valid file name is unicode letters, numbers, spaces, hyphens, and underscores.
// This is safe against path traversal
export function isValidFileName(name: string): boolean {
  return /^[\p{L}\p{N}_ -]+$/u.test(name);
}

export function spacesToHyphens(str: string) {
  return str.toLowerCase().replace(/\s/g, "-");
}

export function getFileExtension(fileName: string): string | undefined {
  return fileName.split(".").pop() || undefined;
}

export const supportedImageExts = ["png", "jpg", "webp", "gif"];
export const supportedImageExtsWithDot = supportedImageExts.map((ext) => `.${ext}`);

const formatMapping: { [key: string]: string } = {
  avif: "avif",
  dz: "dz",
  fits: "fits",
  gif: "gif",
  heif: "heif",
  input: "input",
  jpeg: "jpg",
  jpg: "jpg",
  jp2: "jp2",
  jxl: "jxl",
  magick: "magick",
  openslide: "openslide",
  pdf: "pdf",
  png: "png",
  ppm: "ppm",
  raw: "raw",
  svg: "svg",
  tiff: "tiff",
  tif: "tiff",
  v: "v",
  webp: "webp"
};

export function sharpFormatToExt(format: keyof FormatEnum | undefined): string | undefined {
  if (!format) return undefined;
  return formatMapping[format];
}

/**
 * Converts a Sharp image format to a supported image file extension, if available.
 *
 * @param format - The Sharp image format to convert.
 * @returns The supported image file extension, or `undefined` if the format is not supported.
 */
export function sharpFormatToSupportedImageExt(format: keyof FormatEnum | undefined): string | undefined {
  if (!format) return undefined;
  const ext = sharpFormatToExt(format);
  if (!ext) return undefined;
  return supportedImageExts.includes(ext) ? ext : undefined;
}
export const supportedCardExts = ["zip", "json", "png"];

/* 
  The MIT License (MIT)
  Copyright (c) 2016-2018 Cheton Wu
  https://github.com/cheton/is-electron?tab=MIT-1-ov-file
*/
function isElectron() {
  // Renderer process
  if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
    return true;
  }

  // Main process
  if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  ) {
    return true;
  }

  return false;
}
export const isLocal = isElectron();

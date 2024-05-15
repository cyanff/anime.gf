import { RawPlatformCardBundle, Result } from "@shared/types";
import fsp from "fs/promises";
import JSZip from "jszip";
import { join } from "path";

// TODO, don't hard code to PNGs
export async function readDir(path: string): Promise<Result<RawPlatformCardBundle, Error>> {
  try {
    const data = JSON.parse(await fsp.readFile(join(path, "data.json"), "utf8"));
    const avatarBuffer = await fsp.readFile(join(path, "avatar.png"));
    const bannerBuffer = await fsp.readFile(join(path, "banner.png"));

    return { kind: "ok", value: { data, avatarBuffer, bannerBuffer } };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

export async function readZIP(path: string): Promise<Result<RawPlatformCardBundle, Error>> {
  try {
    const zipData = await fsp.readFile(path);
    const jszip = await JSZip.loadAsync(zipData);

    const dataJSONFile = jszip.file("data.json");
    if (!dataJSONFile) {
      return { kind: "err", error: new Error("data.json not found in card's zip") };
    }
    const dataJSONContent = await dataJSONFile.async("string");

    const data = JSON.parse(dataJSONContent);
    const avatarBuffer = await jszip.file("avatar.png")?.async("nodebuffer");
    const bannerBuffer = await jszip.file("banner.png")?.async("nodebuffer");

    return { kind: "ok", value: { data, avatarBuffer, bannerBuffer } };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

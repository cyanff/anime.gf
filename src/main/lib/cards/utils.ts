import { config } from "@shared/config";
import { Card } from "@shared/db_types";
import { md } from "@shared/md";
import { cardTagSchema } from "@shared/schema/schema";
import { CardData, InputCardData, Result } from "@shared/types";
import fsp from "fs/promises";
import tEXt from "png-chunk-text";
import extract from "png-chunks-extract";
import sqlite from "../sqlite";
import { SillyCardData } from "./parse";

export async function _sillyCardToAGFCard(sillyCard: SillyCardData): Promise<CardData> {
  // Convert all possible tags, filter out invalid ones, and limit to max count
  const cleanedTags = sillyCard.data.tags
    .map((tag) => tag.toLowerCase().trim())
    .filter((tag) => {
      const res = cardTagSchema.safeParse(tag);
      return res.success;
    })
    .slice(0, config.card.tagsMaxCount);
  const cleanedName = sillyCard.data.name.replace(/[^\p{L}\p{N}_ -]/gu, "_").substring(0, config.card.nameMaxChars);
  const creatorName = sillyCard.data.creator?.substring(0, config.card.nameMaxChars) || "";
  const cleanedCreatorName = creatorName.replace(/[^\p{L}\p{N}_ -]/gu, "_");

  const notes = sillyCard.data.creator_notes;
  const trimmedCreatorNotes = notes.substring(0, config.card.notesMaxChars);
  const trimmedTagline = md.strip(notes, {}).substring(0, config.card.taglineMaxChars);

  const description = [sillyCard.data.description, sillyCard.data.personality, sillyCard.data.scenario].join("\n");
  const trimmedDescription = description.substring(0, config.card.descriptionMaxChars);

  const trimmedGreeting = sillyCard.data.first_mes.substring(0, config.card.greetingMaxChars);

  const trimmedAltGreetings =
    sillyCard.data.alternate_greetings?.map((greeting) => greeting.substring(0, config.card.greetingMaxChars)) || [];
  const trimmeMsgExamples = sillyCard.data.mes_example.substring(0, config.card.msgExamplesMaxChars);
  const trimmedSystemPrompt = sillyCard.data.system_prompt.substring(0, config.card.systemPromptMaxChars);
  const trimmedPostHistoryInstructions = sillyCard.data.post_history_instructions.substring(
    0,
    config.card.jailbreakMaxChars
  );

  const agfCard: InputCardData = {
    spec: "anime.gf",
    spec_version: "1.0",
    character: {
      name: cleanedName,
      description: trimmedDescription,
      greeting: trimmedGreeting,
      alt_greetings: trimmedAltGreetings,
      msg_examples: trimmeMsgExamples,
      system_prompt: trimmedSystemPrompt,
      jailbreak: trimmedPostHistoryInstructions
    },
    world: {
      description: ""
    },
    meta: {
      title: cleanedName,
      notes: trimmedCreatorNotes,
      tagline: trimmedTagline,
      tags: cleanedTags,
      created_at: new Date().toISOString(),
      creator: {
        card: cleanedCreatorName,
        character: cleanedCreatorName,
        world: ""
      }
    }
  };

  return agfCard;
}

export async function getDBCardFromID(id: number): Promise<Result<Card, Error>> {
  try {
    const q = `SELECT * FROM cards WHERE id = ?;`;
    const row = sqlite.get(q, [id]) as Card;
    return { kind: "ok", value: row };
  } catch (e) {
    return { kind: "err", error: e };
  }
}
export async function _pngToCharacterData(pngPath: string): Promise<Result<any, Error>> {
  try {
    const buffer = await fsp.readFile(pngPath);
    const texts = extract(buffer)
      .filter((chunk) => chunk.name === "tEXt")
      .map((chunk) => tEXt.decode(chunk.data));

    if (!texts) {
      return { kind: "err", error: new Error("No tEXt chunks found in PNG") };
    }
    const base64 = texts.find((text) => text.keyword.toLowerCase() === "chara")?.text;
    if (!base64) {
      return { kind: "err", error: new Error("No 'chara' tEXt chunk found in PNG") };
    }
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    return { kind: "ok", value: decoded };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

import { CardData, CardFormData } from "@shared/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function cardFormDataToCardData(data: CardFormData): CardData {
  return {
    spec: "anime.gf",
    spec_version: "1.0",
    character: {
      name: data.character.name,
      description: data.character.description,
      greeting: data.character.greeting,
      msg_examples: data.character.msg_examples
    },
    world: {
      description: data.world.description
    },
    meta: {
      title: data.meta.title,
      notes: data.meta.notes,
      created_at: new Date().toISOString(),
      creator: {
        card: "you",
        character: "you",
        world: "you"
      },
      tagline: data.meta.tagline,
      tags: data.meta.tags.split(",")
    }
  };
}

import { CardData, CardFormData } from "@shared/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function cardFormDataToCardData(data: CardFormData): CardData {
  const card: CardData = {
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

  if (data.character.handle) card.character.handle = data.character.handle;

  return card as CardData;
}

export function debounce(fn: (...args: any[]) => void, ms: number) {
  let timeout: any;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, ms);
  };
}

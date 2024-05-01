import { CardBundle, CardData, CardFormData } from "@shared/types";
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

export function throttle(fn: (...args: any[]) => void, ms: number) {
  let lastTime = 0;
  let timeout: any;

  return function executedFunction(...args: any[]) {
    const now = Date.now();
    const remaining = ms - (now - lastTime);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * A function to compare two `CardBundle` objects based on the current `sortBy` and `descending` state.
 *
 * @param a - The first `CardBundle` object to compare.
 * @param b - The second `CardBundle` object to compare.
 * @returns
 * A ternary value (-1, 0 ,1) indicating the sort order of the two `CardBundle` objects.
 * -1: a should come before b
 * 0: a and b are equal
 * 1: a should come after b
 */
export const cardBundleSearchFN = (a: CardBundle, b: CardBundle, sortBy: string, descending: boolean) => {
  let valueA: any, valueB: any;
  switch (sortBy) {
    case "alphabetical":
      valueA = a.data.character.name.toLowerCase();
      valueB = b.data.character.name.toLowerCase();
      break;
    case "created":
      valueA = new Date(a.data.meta.created_at);
      valueB = new Date(b.data.meta.created_at);
      break;
    case "updated":
      // Fallback to created date if updated date is not available
      valueA = new Date(a.data.meta.updated_at || a.data.meta.created_at);
      valueB = new Date(b.data.meta.updated_at || b.data.meta.created_at);
      break;
    default:
      return 0;
  }
  let comparisonResult: number;
  if (valueA < valueB) {
    comparisonResult = -1;
  } else if (valueA > valueB) {
    comparisonResult = 1;
  } else {
    comparisonResult = 0;
  }
  // If descending is true, we want the comparison result to be reversed
  return descending ? -comparisonResult : comparisonResult;
};

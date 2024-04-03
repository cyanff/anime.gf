export interface CardJSON {
  spec: string;
  spec_version: string;
  character: Character;
  world: World;
  meta: {
    title: string;
    card_creator: string;
    character_creator: string;
    world_creator: string;
    notes?: string;
    avatar: string;
    tagline: string;
    tags: string[];
  };
}

export interface Character {
  name: string;
  description: string;
  greeting: string;
  alt_greetings: string[];
  msg_examples: string;
  avatar: string;
  banner: string;
}

export interface World {
  description: string;
}

// Contents of the card's zip archive
export interface Card {
  card: CardJSON;
  // Base64
  avatar: string;
  // Base64
  banner: string;
}

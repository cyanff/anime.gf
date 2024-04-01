import { CharacterCard } from "@shared/silly";
import { Persona, ChatHistory, Messages } from "@/lib/types";

interface Params {
  chatHistory: ChatHistory;
  persona: Persona;
  characterCard: CharacterCard;
}

// In:
// - global config
//   - global user prompt template
// - chat history
// - persona
// - character card
//   - system prompt
//   - ...
// - chat template
// */

// // TODO:
// // clean abstraction for different chat templates
// // chatml, alpaca, etc
// // each model has its own template

// // completion apis
// // - chat
// // - text

// interface Params {
//   chatHistory: ChatHistory;
//   persona: Persona;
//   characterCard: CharacterCard;
// }

// function renderPrompt(param: Params) {}

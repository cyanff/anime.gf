import { getProvider } from "@/lib/provider/provider";
import { queries } from "@/lib/queries";
import { CardData, PersonaData } from "@shared/types";
import { deepFreeze } from "@shared/utils";
import { ContextParams, context } from "./context";

/**
 * Generates a response based on the provided chat ID, card data, persona data, and latest user message.
 *
 * @param chatID - The unique identifier for the chat.
 * @param cardData - The data associated with the card being used in the chat.
 * @param personaData - The data associated with the persona being used in the chat.
 * @param latestUserMessage - The most recent message sent by the user in the chat.
 * @returns A promise that resolves to the generated response.
 */
async function generate(
  chatID: number,
  cardData: CardData,
  personaData: PersonaData,
  latestUserMessage: string
): Promise<string> {
  const res = await _generate(chatID, cardData, personaData, latestUserMessage);
  return res;
}

/**
 * Regenerates a response for the specified chat, using the latest user message starting from the provided message ID.
 *
 * @param chatID - The ID of the chat to regenerate the response for.
 * @param messageID - The ID of the message to regenerate.
 * @param cardData - The card data to use for generating the response.
 * @param personaData - The persona data to use for generating the response.
 * @returns A promise that resolves to the generated response.
 */
async function regenerate(
  chatID: number,
  messageID: number,
  cardData: CardData,
  personaData: PersonaData
): Promise<string> {
  const latestUserMessage = await queries.getLatestUserMessageStartingFrom(chatID, messageID);
  const res = await _generate(chatID, cardData, personaData, latestUserMessage);
  return res;
}

/**
 * Generates a response for the specified chat, using the latest user message, card data, and persona data.
 *
 * @param chatID - The ID of the chat to generate the response for.
 * @param cardData - The card data to use for generating the response.
 * @param personaData - The persona data to use for generating the response.
 * @param latestUserMessage - The user message that's at the end of the context window.
 * @returns A promise that resolves to the generated response.
 */
async function _generate(chatID: number, cardData: CardData, personaData: PersonaData, latestUserMessage: string) {
  const settingsRes = await window.api.setting.get();
  if (settingsRes.kind == "err") {
    throw new Error("Error fetching settings.");
  }
  const settings = settingsRes.value;
  const contextParams: ContextParams = {
    chatID,
    latestUserMessage,
    personaData,
    cardData,
    jailbreak: settings.chat.jailbreak,
    model: settings.chat.model,
    tokenLimit: settings.chat.maxContextTokens
  };
  const ctx = await context.get(contextParams);
  const provider = getProvider(settings.chat.provider);
  const completionConfig = {
    model: settings.chat.model,
    system: ctx.system,
    maxTokens: settings.chat.maxReplyTokens,
    temperature: settings.chat.temperature,
    topP: settings.chat.topP,
    topK: settings.chat.topK
  };

  const res = await provider.getChatCompletion(ctx.messages, completionConfig);
  if (res.kind == "err") {
    throw res.error;
  }
  return res.value;
}

export const reply = {
  generate,
  regenerate
};
deepFreeze(reply);

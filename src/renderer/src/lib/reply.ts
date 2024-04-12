import { getProvider } from "@/lib/provider/provider";
import { ContextParams, PromptVariant, context } from "./context";
import { deepFreeze } from "@shared/utils";
import { CardData, PersonaData } from "@shared/types";
import { queries } from "@/lib/queries";

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
 * @param messageID - The ID of the message to start retrieving the latest user message from.
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

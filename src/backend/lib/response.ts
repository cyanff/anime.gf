import dotenv from "dotenv";
import { getContext } from "./context";
import { getTokenizer } from "./tokenizer";
import { LLMEnum } from "./llm";
import { EmbeddingEnum } from "./embed";
import config from "./config";
import llm from "./llm";
import { ChatContext } from "./context";
import Mustache from "mustache";
import { PreTrainedTokenizer } from "@xenova/transformers";
import { insertData } from "../utils/sqlite-utils";

export async function response(chatID) {
  // Gather the necessary context
  const context = await getContext(chatID);

  // Construct the prompt
  const llmTokenizer = await getTokenizer(LLMEnum.NOUS_HERMES_2_YI_34B);
  const prompt = await constructPrompt(llmTokenizer, context);

  // Call the LLM
  const llmConfig = llm.getDefaultConfig(LLMEnum.NOUS_HERMES_2_YI_34B);
  const completion = await llm.getCompletion(prompt, llmConfig);

  // Insert the reply into the database
  await insertReply(completion, chatID);
}

/**
 * Construct a prompt to be sent to the LLM.
 * @param tokenizer The tokenizer used to apply the chat template
 * @param context An object containing all the context needed to construct the prompt
 * @returns The constructed prompt as a string
 */
async function constructPrompt(tokenizer: PreTrainedTokenizer, context: ChatContext): Promise<string> {
  const template = context.characterInfo.sysPrompt;
  const sysPrompt = Mustache.render(template, context);

  const contextWindow = context.contextWindow.map((message) => {
    return {
      role: message.sender_type,
      content: message.content || ""
    };
  });

  // Parse each chunk of relevant context
  let relevantContext = context.relevantContext.map((chunk) => {
    const parsedChunk = chunk.payload;
    // Parse each message from each chunk
    const messages = parsedChunk.map((message: any) => {
      // TODO: implement conversion of timestamp to natural language before returning
      return {
        role: message.sender_type,
        content: message.content // + " timestamp: " + message.inserted_at
      };
    });
    return messages;
  });
  relevantContext = relevantContext.flat();

  const chat = [{ role: "system", content: sysPrompt }, ...relevantContext, ...contextWindow];

  const prompt = tokenizer.apply_chat_template(chat, { tokenize: false, add_generation_prompt: true }) as string;
  return prompt;
}

/**
 * Inserts a reply into the database.
 * @param completion - The completion string to be inserted.
 * @param chatID - The ID of the chat.
 * @returns A promise that resolves when the data is inserted successfully.
 */
async function insertReply(completion: string, chatID: number) {
  const tokenizer = await getTokenizer(EmbeddingEnum.GTE_SMALL);
  const token_count = tokenizer(completion).input_ids.size;
  await insertData('messages', 'chat_id, msg, sender_type, num_tokens, embedded', [chatID, completion, 'character', token_count, false])
  .then(() => console.log('Data inserted successfully'))
  .catch(err => console.error('Error inserting data:', err));
}

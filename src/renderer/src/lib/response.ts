// import { getContext, ChatContext } from "./context";
// import Mustache from "mustache";

// export async function getResponse(chatID) {
//   let context, prompt, response;

//   try {
//     // Gather the necessary context
//     context = await getContext(chatID);
//   } catch (err) {
//     console.error(`Failed to get context for chat ID ${chatID}: ${(err as Error).message}`);
//   }

//   try {
//     // Construct the prompt
//     prompt = await constructPrompt(context);
//   } catch (err) {
//     console.error(`Failed to construct prompt: ${(err as Error).message}`);
//   }

//   try {
//     // Call the LLM
//     response = await getCompletion(prompt);
//     console.log(`RESPONSE: ${JSON.stringify(response, null, 2)}`);
//   } catch (err) {
//     console.error(`Failed to get completion from LLM: ${(err as Error).message}`);
//   }

//   return response;
// }

// /**
//  * Construct a prompt to be sent to the LLM.
//  * @param tokenizer The tokenizer used to apply the chat template
//  * @param context An object containing all the context needed to construct the prompt
//  * @returns The constructed prompt as a string
//  */
// async function constructPrompt(context: ChatContext): Promise<any[]> {
//   const template = context.character.system_prompt;
//   const sysPrompt = Mustache.render(template, context);

//   const contextWindow = context.contextWindow.map((message) => {
//     return {
//       role: message.sender_type,
//       content: message.content || ""
//     };
//   });

//   // Parse each chunk of relevant context
//   let relevantContext = context.relevantContext.map((chunk) => {
//     const payload = chunk.payload;
//     if (!payload) {
//       return [];
//     }
//     // Parse each message from each chunk
//     const messages = payload.map((message: any) => {
//       // TODO: implement conversion of timestamp to natural language before returning
//       return {
//         role: message.sender_type,
//         content: message.content // + " timestamp: " + message.inserted_at
//       };
//     });
//     return messages;
//   });
//   relevantContext = relevantContext.flat();

//   const prompt = [{ role: "system", content: sysPrompt }, ...relevantContext, ...contextWindow];

//   console.log(`________________________________________________________________________________`);
//   console.log(`PROMPT: ${JSON.stringify(prompt, null, 2)}`);
//   console.log(`________________________________________________________________________________`);

//   return prompt;
// }

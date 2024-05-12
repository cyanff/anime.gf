import { render } from "@/lib/macros";
import { ProviderMessage } from "@/lib/provider/provider";
import { ContextMessage, queries } from "@/lib/queries";
import { getTokenizer } from "@/lib/tokenizer/provider";
import { CardData, PersonaData, Result } from "@shared/types";
import { deepFreeze } from "@shared/utils";
import Mustache from "mustache";

export type PromptVariant = "xml" | "markdown";
export interface ContextParams {
  chatID: number;
  fromMessageID?: number;
  userMessageTerminator: string;
  cardData: CardData;
  personaData: PersonaData;
  jailbreak: string;
  model: string;
  tokenLimit: number;
}
interface SystemPromptParams extends Pick<ContextParams, "cardData" | "personaData"> {
  variant: PromptVariant;
  characterMemory: string;
}
interface Context {
  system: string;
  messages: ProviderMessage[];
}

/**
 * Generates a context object containing the system prompt and the array of messages for a given set of parameters.
 */
async function get(params: ContextParams): Promise<Result<Context, Error>> {
  let systemPrompt: string;
  if (params.cardData.character.system_prompt) {
    systemPrompt = params.cardData.character.system_prompt;
  } else {
    const systemPromptParams = {
      cardData: params.cardData,
      personaData: params.personaData,
      characterMemory: "",
      variant: getPromptVariant(params.model)
    };
    const systemPromptRes = renderSystemPrompt(systemPromptParams);
    if (systemPromptRes.kind === "err") {
      return systemPromptRes;
    }
    systemPrompt = systemPromptRes.value;
  }

  const tokenizer = getTokenizer(params.model);
  const userMessageTokens = tokenizer.countTokens(params.userMessageTerminator);
  const systemPromptTokens = tokenizer.countTokens(systemPrompt);
  const remainingTokens = params.tokenLimit - (userMessageTokens + systemPromptTokens);

  const minTokens = 300;
  if (remainingTokens < minTokens) {
    return {
      kind: "err",
      error: new Error(
        `Only ${remainingTokens} tokens remaining in the token limit. Minimum of ${minTokens} tokens required to load the chat history.`
      )
    };
  }

  // Fetch messages to fill up the context window.
  let fromID: number | undefined = params.fromMessageID;
  let contextWindowTokens = 0;
  const contextWindow: ContextMessage[] = [];
  while (contextWindowTokens < remainingTokens) {
    const messages = await queries.getContextMessagesStartingFrom(params.chatID, 100, fromID);
    // No more messages to fetch.
    if (messages.length === 0) {
      break;
    }
    for (const message of messages) {
      const messageTokens = tokenizer.countTokens(message.text);
      // If adding the message would exceed the token limit, break.
      if (contextWindowTokens + messageTokens > remainingTokens) {
        break;
      }
      contextWindow.push(message);
      contextWindowTokens += messageTokens;
      fromID = message.id;
    }
  }
  contextWindow.reverse();

  // Add global or card specific jailbreak to the final user message
  let userMessageTerminator = params.userMessageTerminator;
  const jailbreak = params.cardData.character.jailbreak || params.jailbreak;
  if (jailbreak) {
    userMessageTerminator += "\n\n" + jailbreak;
  }

  const providerMessages = _toProviderMessages(contextWindow, userMessageTerminator);

  console.log("systemPrompt", systemPrompt);
  console.log("providerMessages", providerMessages);
  return {
    kind: "ok",
    value: {
      system: systemPrompt,
      messages: providerMessages
    }
  };
}

/**
 * Converts an array of `Message` objects to an array of `ProviderMessage` objects,
 * Ensuring:
 * - The first message is a user message
 * - Messages alternate between user and assistant roles.
 * - The last message is a user message.
 *
 * @param messages - An array of `Message` objects representing the conversation history.
 * @param latestUserMessage - The latest user message to be added to the end of the `ProviderMessage` array.
 * @returns An array of `ProviderMessage` objects representing the conversation history in the format expected by the provider.
 */
function _toProviderMessages(messages: ContextMessage[], latestUserMessage: string): ProviderMessage[] {
  let ret = messages.map((m) => {
    return {
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    };
  });

  // Guarantees that first message in the context window is a user message
  if (ret.length > 0 && ret[0].role === "assistant") {
    ret.unshift({
      role: "user",
      content: "Now, begin the conversation based on the given instructions above."
    });
  }

  // The latest user message is always the last message
  ret.push({
    role: "user",
    content: latestUserMessage
  });

  // Merge non alternating message roles
  // Ex:
  // user / user / assistant / assistant / user
  // -> user / assistant / user
  let slow = 0;
  let fast = 1;
  while (slow < fast && fast < ret.length) {
    // Merge messages if they have the same role
    if (ret[slow].role === ret[fast].role) {
      ret[slow].content += "\n" + ret[fast].content;
      ret[fast] = null as any;
      fast++;
    } else {
      slow = fast;
      fast++;
    }
  }
  ret = ret.filter((msg) => msg !== null);
  return ret;
}

/**
 * Renders the system prompt template using the provided prompt parameters.
 *
 * @param params - The prompt parameters, including the card data, persona, character memory, and jailbreak settings.
 * @returns The rendered system prompt string.
 */
function renderSystemPrompt(params: SystemPromptParams): Result<string, Error> {
  const template = getTemplate(params.variant);
  const ctx = {
    card: params.cardData,
    persona: params.personaData,
    characterMemory: params.characterMemory
  };
  try {
    const renderedSystemPrompt = Mustache.render(template, ctx);
    const renderMacroRes = render(renderedSystemPrompt, { cardData: params.cardData, personaData: params.personaData });
    if (renderMacroRes.kind === "err") {
      return { kind: "err", error: renderMacroRes.error };
    }
    return { kind: "ok", value: renderMacroRes.value };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

/**
 * Returns the template string for the given prompt variant.
 *
 * @param variant - The prompt variant to get the template for.
 * @returns The template string.
 */
function getTemplate(variant: PromptVariant) {
  switch (variant) {
    case "xml":
      return `
<instruction>
You are now roleplaying as {{{card.character.name}}}. 
You are in a chat with {{{persona.name}}}.
</instruction>

{{#card.character.description}}
<character_info>
{{{card.character.description}}}
</character_info>
{{/card.character.description}}

{{#card.world.description}}
<world_info>
{{{card.world.description}}}
</world_info>
{{/card.world.description}}

{{#persona.description}}
<user_info>
User's description: {{{persona.description}}}
</user_info>
{{/persona.description}}

{{#characterMemory}}
<character_memory>
{{{characterMemory}}}
</character_memory>
{{/characterMemory}}

{{#card.character.msg_examples}}
<message_examples>
{{{card.character.msg_examples}}}
</message_examples>
{{/card.character.msg_examples}}`.trim();

    case "markdown":
      return `
### Instruction
You are now roleplaying as {{{card.character.name}}}. 
You are in a chat with {{{persona.name}}}. \

{{#card.character.description}}

### Character Info
{{{card.character.description}}}
{{/card.character.description}} \

{{#card.world.description}}

### World Info
{{{card.world.description}}}
{{/card.world.description}} \

{{#persona.description}}

### User Info
User's description: {{{persona.description}}}
{{/persona.description}} \

{{#characterMemory}}

### Character Memory
{{{characterMemory}}}
{{/characterMemory}} \

{{#card.character.msg_examples}}

### Messages Examples
{{{card.character.msg_examples}}}
{{/card.character.msg_examples}}`.trim();
    default:
      throw new Error("Invalid prompt variant");
  }
}

function getPromptVariant(model: string): PromptVariant {
  if (model.match(/claude/i)) {
    return "xml";
  } else {
    return "markdown";
  }
}

export const context = {
  get,
  renderSystemPrompt
};
deepFreeze(context);

import { getTokenizer } from "./tokenizer";
import xfetch from "./xfetch";
import { z } from "zod";
import config from "./config";
import { Option } from "./types";
import zodToJsonSchema from "zod-to-json-schema";
import { omit, sleep } from "./utils";
import { fromZodError } from "zod-validation-error";

export interface LLMConfig {
  name: string;
  baseUrl: string;
  stop: string[];
  temperature: number;
  topP: number;
  topK: number;
  completionTokens: number;
  repetitionPenalty: number;
}

export enum LLMEnum {
  NOUS_HERMES_2_YI_34B = "nous_hermes_2_yi_34b",
  MIXTRAL_8X7B_INSTRUCT = "mixtral_8x7b_instruct",
  MISTRAL_7B_INSTRUCT = "mistral_7b_instruct",
  SOLAR_10_7B_INSTRUCT = "solar_10_7b_instruct"
}

/**
 *  Get the default configurations required to generate a completion for the given LLM.
 * @param llm  The LLM to get the default configurations for.
 * @returns The default configurations for the given LLM.
 */
function getDefaultConfig(llm: LLMEnum): LLMConfig {
  switch (llm) {
    case LLMEnum.NOUS_HERMES_2_YI_34B:
      return {
        name: "NousResearch/Nous-Hermes-2-Yi-34B",
        baseUrl: "https://api.together.xyz/inference",
        stop: ["<|im_start|>", "<|im_end|>"],
        temperature: 1.1,
        topP: 0.7,
        topK: 50,
        completionTokens: 256,
        repetitionPenalty: 1.2
      };

    case LLMEnum.MIXTRAL_8X7B_INSTRUCT:
      return {
        name: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        baseUrl: "https://api.together.xyz/inference",
        stop: ["[/INST]", "</s>"],
        temperature: 0.4,
        topP: 1,
        topK: 50,
        completionTokens: 256,
        repetitionPenalty: 0
      };

    case LLMEnum.MISTRAL_7B_INSTRUCT:
      return {
        name: "mistralai/Mistral-7B-Instruct-v0.2",
        baseUrl: "https://api.together.xyz/inference",
        stop: ["[/INST]", "</s>"],
        temperature: 0.4,
        topP: 1,
        topK: 50,
        completionTokens: 256,
        repetitionPenalty: 0
      };
    case LLMEnum.SOLAR_10_7B_INSTRUCT:
      return {
        name: "upstage/SOLAR-10.7B-Instruct-v1.0",
        baseUrl: "https://api.together.xyz/inference",
        stop: ["###", "</s>"],
        temperature: 0.4,
        topP: 1,
        topK: 50,
        completionTokens: 256,
        repetitionPenalty: 0
      };
  }
}

/**
 * Get the LLM enum from the given LLM config.
 * @param llmConfig The LLM config to get the LLM enum from.
 * @returns An LLM enum matching the given LLM config.
 */
function llmEnumWithConfig(llmConfig: LLMConfig): LLMEnum {
  switch (llmConfig.name) {
    case "NousResearch/Nous-Hermes-2-Yi-34B":
      return LLMEnum.NOUS_HERMES_2_YI_34B;
    case "mistralai/Mixtral-8x7B-Instruct-v0.1":
      return LLMEnum.MIXTRAL_8X7B_INSTRUCT;
    case "mistralai/Mistral-7B-Instruct-v0.1":
      return LLMEnum.MISTRAL_7B_INSTRUCT;
    case "upstage/SOLAR-10.7B-Instruct-v1.0":
      return LLMEnum.SOLAR_10_7B_INSTRUCT;
    default:
      throw new Error(`Unknown LLM config: ${llmConfig.name}`);
  }
}

async function getCompletion(prompt: string, llmConfig: LLMConfig): Promise<string> {
  const headers = {
    Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    "Content-Type": "application/json"
  };

  const body = {
    model: llmConfig.name,
    prompt: prompt,
    temperature: llmConfig.temperature,
    top_p: llmConfig.topP,
    top_k: llmConfig.topK,
    max_tokens: llmConfig.completionTokens,
    stream_tokens: false,
    repetition_penalty: llmConfig.repetitionPenalty,
    stop: llmConfig.stop
  };

  const res = await xfetch.post(llmConfig.baseUrl, body, headers);
  if (res.kind === "err") {
    console.error(`Error while making completion request to LLM. Error: ${res.error.message}`);
    throw res.error;
  }

  const json = res.value;
  const completion = json.output.choices[0].text;

  return completion;
}

/**
 * Generate a JSON object completion abiding to the given schema.
 * If the completion response doesn't pass the schema check, further requests to the LLM will be made to "heal" the JSON.
 * If all attempts fail, return none.
 * @return An Option containing the object if successful, none otherwise.
 */
async function getJSONCompletion(
  instruction: string,
  schema: z.ZodSchema,
  llmConfig: LLMConfig
): Promise<Option<unknown>> {
  const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" });
  const blacklist = ["$ref", "$schema", "default", "definitions", "markdownDescription, additionalProperties"];
  const cleanedJsonSchema = omit(jsonSchema, blacklist);

  const sysPrompt = `You are a powerful API endpoint that ONLY respond with JSON.\
You always generate the valid JSON output and NOTHING ELSE.
The JSON *MUST* conform to this schema:
\`\`\`
${JSON.stringify(cleanedJsonSchema, null, 2)}
\`\`\`
===================
${instruction}
===================
Remember, ONLY OUTPUT A JSON OBJECT AND NOTHING ELSE.`;

  const llmEnum = await llmEnumWithConfig(llmConfig);
  const tokenizer = await getTokenizer(llmEnum);

  const chat = [{ role: "user", content: sysPrompt }];
  for (let i = 0; i < config.JSON_ATTEMPTS; i++) {
    const prompt = tokenizer.apply_chat_template(chat, { tokenize: false }) as string;
    const completion = (await getCompletion(prompt, llmConfig)).trim();
    chat.push({ role: "assistant", content: completion });

    // Parse completion as JSON
    let json;
    try {
      json = JSON.parse(completion);
    } catch (e) {
      // JSON is invalid, prompt the LLM to ONLY output a JSON object.
      chat.push({ role: "user", content: "Invalid JSON. ONLY output a JSON object and NOTHING else." });
      continue;
    }

    // Check if JSON matches schema
    const parseRes = schema.safeParse(json);
    if (parseRes.success) {
      return { kind: "some", value: parseRes.data };
    }

    // JSON did not match schema, prompt the LLM to heal it.
    const readableErr = fromZodError(parseRes.error).toString();
    chat.push({
      role: "user",
      content: `JSON did not match schema. Error: ${readableErr}`
    });

    // Fixed backoff timer
    await sleep(config.JSON_ATTEMPTS_DELAY);
  }
  return { kind: "none" };
}

export default {
  getCompletion,
  getJSONCompletion,
  getDefaultConfig
};

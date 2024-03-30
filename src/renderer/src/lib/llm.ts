import { post } from "./xfetch";
import path from "path";
import fs from "fs";
import { app } from "electron";

function getApiKey() {
  const apiKeyFilePath = path.join(app.getPath("userData"), "api_key.txt");
  if (!fs.existsSync(apiKeyFilePath)) {
    fs.writeFileSync(apiKeyFilePath, "insert_api_key_here", "utf8");
  }
  const apiKey = fs.readFileSync(apiKeyFilePath, "utf8");
  return apiKey;
}

export async function getCompletion(prompt: string): Promise<string> {
  const headers = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json"
  };

  const body = {
    model: "NousResearch/Nous-Hermes-2-Yi-34B",
    prompt: "say hi please",
    temperature: 0.7,
    top_p: 0.7,
    top_k: 50,
    max_tokens: 32,
    stream_tokens: false,
    repetition_penalty: 1.2,
    stop: ["<|im_start|>", "<|im_end|>"]
  };

  const res = await post("https://api.together.xyz/v1/chat/completions", body, headers);
  if (res.kind === "err") {
    console.error(`Error while making completion request to LLM. Error: ${res.error.message}`);
    throw res.error;
  }

  const json = res.value;
  const completion = json.choices[0].message.content;

  return completion;
}

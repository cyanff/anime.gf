import { CompletionConfig, Provider, ProviderMessage } from "@/lib/provider/provider";
import { Result } from "@shared/types";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
  };
}

async function getModels(): Promise<Result<string[], Error>> {
  const models = ["gemini-1.5-pro-latest", "gemini-1.0-pro"];
  return { kind: "ok", value: models };
}

async function getChatCompletion(
  messages: ProviderMessage[],
  config: CompletionConfig
): Promise<Result<string, Error>> {
  let key;
  if (!config.apiKey) {
    const keyRes = await window.api.secret.get("gemini");
    if (keyRes.kind == "err") {
      return keyRes;
    }
    key = keyRes.value;
  } else {
    key = config.apiKey;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${key}`;
  const headers = {
    "Content-Type": "application/json"
  };

  const contents = messages.map((message) => {
    const parts = [{ text: message.content }];
    const role = message.role == "user" ? "user" : "model";
    return { parts, role };
  });

  const body: any = {
    contents,
    generationConfig: {
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
      maxOutputTokens: config.maxTokens,
      stopSequences: config.stop || []
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };

  if (config.system) {
    body.systemInstruction = {
      parts: [{ text: config.system }],
      role: "system"
    };
  }

  const completionRes = await window.api.xfetch.post(url, body, headers);
  if (completionRes.kind == "err") {
    return completionRes;
  }

  const geminiResponse = completionRes.value as GeminiResponse;
  return { kind: "ok", value: geminiResponse.candidates[0].content.parts[0].text };
}

async function streamChatCompletion(): Promise<any> {
  throw new Error("Not implemented");
}

export const gemini: Provider = {
  getModels,
  getChatCompletion,
  streamChatCompletion
};

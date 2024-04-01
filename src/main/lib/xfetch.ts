import { Result, isError } from "@shared/utils";

export interface Headers {
  Authorization?: string;
}

async function post(url: string, body: Object = {}, headers: Record<string, string> = {}): Promise<Result<any, Error>> {
  // Default Content-Type to application/json
  const contentTypeKey = Object.keys(headers).find((key) => key.toLowerCase() === "content-type");
  if (!contentTypeKey) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    console.log("Headers: ", headers);
    console.log("Body: ", body);

    if (!res.ok) {
      const errorDetails = await res.text();
      return {
        kind: "err",
        error: new Error(
          `Request failed with status ${res.status}.\nStatus text: ${res.statusText}.\nError details: ${errorDetails}`
        )
      };
    }
    return { kind: "ok", value: await res.json() };
  } catch (err) {
    isError(err);
    return { kind: "err", error: err };
  }
}

export const xfetch = {
  post
};

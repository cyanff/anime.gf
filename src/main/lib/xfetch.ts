import { Result, isError } from "@shared/utils";

export interface Headers {
  Authorization?: string;
}

async function post(url: string, body: Object = {}, headers: Record<string, string> = {}): Promise<Result<any, Error>> {
  // Default Content-Type to application/json
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      return {
        kind: "err",
        error: new Error(`Request failed with status ${res.status}. Status text: ${res.statusText}}`)
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

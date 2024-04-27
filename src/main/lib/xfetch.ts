import { Result } from "@shared/types";
import { deepFreeze } from "@shared/utils";

export interface XFetchConfig {
  // How long to wait before timing out the request, in milliseconds.
  timeout?: number;
}

async function post(
  url: string,
  body: Object = {},
  headers: Record<string, string> = {},
  cfg: XFetchConfig = {}
): Promise<Result<any, Error>> {
  // Default Content-Type to application/json
  const contentTypeKey = Object.keys(headers).find((key) => key.toLowerCase() === "content-type");
  if (!contentTypeKey) {
    headers["Content-Type"] = "application/json";
  }

  const requestInit: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  };
  const configuredRequestInit = _getConfiguredRequestInit(requestInit, cfg);

  try {
    const res = await fetch(url, configuredRequestInit);
    console.log("Headers: ", headers);
    console.log("Body: ", body);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed with status ${res.status}.\nStatus text: ${res.statusText}.\nBody text: ${text}`);
    }
    return { kind: "ok", value: await res.json() };
  } catch (err) {
    return { kind: "err", error: err };
  }
}

async function get(
  url: string,
  headers: Record<string, string> = {},
  config: XFetchConfig = {}
): Promise<Result<any, Error>> {
  let requestInit: RequestInit = {
    method: "GET",
    headers
  };
  const configuredRequestInit = _getConfiguredRequestInit(requestInit, config);

  try {
    const res = await fetch(url, configuredRequestInit);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed with status ${res.status}.\nStatus text: ${res.statusText}.\nBody text: ${text}`);
    }
    return { kind: "ok", value: await res.json() };
  } catch (err) {
    return { kind: "err", error: err };
  }
}

/**
 * Configures the provided `RequestInit` object with additional options based on the given `XFetchConfig`.
 *
 * @param requestInit The base `RequestInit` object to be configured.
 * @param config The `XFetchConfig` object containing additional configuration options.
 * @returns The configured `RequestInit` object.
 */
function _getConfiguredRequestInit(requestInit: RequestInit, config: XFetchConfig) {
  const ret = { ...requestInit };
  if (config.timeout) {
    ret.signal = AbortSignal.timeout(config.timeout);
  }
  return ret;
}

export const xfetch = {
  post,
  get
};
deepFreeze(xfetch);

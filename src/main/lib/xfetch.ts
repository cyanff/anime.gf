import { config as appConfig } from "@shared/config";
import { Result } from "@shared/types";
import { deepFreeze } from "@shared/utils";

export interface XFetchConfig {
  // How long to wait before timing out the request, in milliseconds.
  timeout?: number;
  uuid?: string;
}

// Map of UUIDs to AbortControllers
const _abortControllers = new Map<string, AbortController>();

async function post(
  url: string,
  body: object = {},
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
  const configuredRequestInit = _configureRequest(requestInit, cfg);

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
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return { kind: "err", error: new Error(`Request timed out.`) };
    }
    return { kind: "err", error: err };
  }
}

async function get(
  url: string,
  headers: Record<string, string> = {},
  config: XFetchConfig = {}
): Promise<Result<any, Error>> {
  const requestInit: RequestInit = {
    method: "GET",
    headers
  };
  const configuredRequestInit = _configureRequest(requestInit, config);

  try {
    const res = await fetch(url, configuredRequestInit);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed with status ${res.status}.\nStatus text: ${res.statusText}.\nBody text: ${text}`);
    }
    return { kind: "ok", value: await res.json() };
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return { kind: "err", error: new Error(`Request timed out.`) };
    }
    return { kind: "err", error: err };
  }
}

async function abort(config: XFetchConfig): Promise<Result<undefined, Error>> {
  if (!config.uuid) return { kind: "err", error: new Error(`A request UUID not provided in the abort request.`) };

  const uuid = config.uuid;
  const abortController = _abortControllers.get(uuid);
  if (!abortController)
    return { kind: "err", error: new Error(`No request found with UUID ${uuid} found, cannot abort request.`) };

  abortController.abort();
  _abortControllers.delete(uuid);
  return { kind: "ok", value: undefined };
}

function _configureRequest(requestInit: RequestInit, config: XFetchConfig) {
  const ret = { ...requestInit };
  const timeout = config.timeout || appConfig.requestTimeout;
  const abortController = new AbortController();

  const uuid = config.uuid;
  if (uuid) {
    _abortControllers.set(uuid, abortController);
  }

  ret.signal = abortController.signal;
  setTimeout(() => {
    abortController.abort();
  }, timeout);

  return ret;
}

function _toRefinedError(err: unknown): { kind: "err"; error: Error } {
  if (err instanceof DOMException && err.name === "AbortError") {
  }

  return { kind: "err", error: err as Error };
}

export const xfetch = {
  post,
  get,
  abort
};
deepFreeze(xfetch);

/*
  During development, you often have to run adhoc snippets to test if things are working as expected.
  Put those snippets here so that you could trigger them using ctrl+k.
*/
// export interface CompletionConfig {
//   apiKey?: string;
//   model: string;
//   url?: string;
//   system?: string;
//   stop?: string[];
//   maxTokens: number;
//   temperature?: number;
//   topP?: number;
//   topK?: number;
// }

import { v4 } from "uuid";

let config: any;

export async function handleA() {
  const url = "http://127.0.0.1:5000/delay";
  config = {
    uuid: v4()
  };

  const res = await window.api.xfetch.post(url, {}, {}, config);

  console.log("POST RES:", res);
}

export async function handleB() {
  if (!config) {
    console.error("No config found");
    return;
  }

  const res = await window.api.xfetch.abort(config);
  console.log("ABORT RES:", res);
}

export async function handleC() {
  // timeout test
  const start = Date.now();

  const url = "http://127.0.0.1:5000/delay";
  // const config = {
  //   timeout: 1000
  // };
  const res = await window.api.xfetch.post(url, {}, {}, config);

  console.log("POST RES:", res, "Time taken:", Date.now() - start);
}

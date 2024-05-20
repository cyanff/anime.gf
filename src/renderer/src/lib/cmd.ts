/*
  During development, you often have to run adhoc snippets to test if things are working as expected.
  Put those snippets here so that you could trigger them using ctrl+k.
*/

import { platform } from "@platform";
import { createTRPCProxyClient } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";
import { AppRouter } from "../../../main/router";

const client = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()]
});

export async function handleA() {}

export async function handleB() {
  const res = await client.test.query();
  const res2 = await client.test2.query();
  const res3 = await client.test3.query();
}

export async function handleC() {}

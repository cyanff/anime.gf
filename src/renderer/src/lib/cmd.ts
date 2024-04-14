/*
  During development, you often have to run adhoc snippets to test if things are working as expected.
  Put those snippets here so that you could trigger them using ctrl+k.
*/

import { queries } from "./queries";

export async function handleA() {
  const res = await queries.getContextMessagesStartingFrom(1, 100);
  console.log(res);
}

export async function handleB() {}

export async function handleC() {}

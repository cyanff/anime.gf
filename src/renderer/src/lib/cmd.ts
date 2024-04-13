/*
  During development, you often have to run adhoc snippets to test if things are working as expected.
  Put those snippets here so that you could trigger them using ctrl+k.
*/

import { Message as DBMessage } from "@shared/db_types";

type Message = Pick<DBMessage, "id" | "sender" | "text">;
export function handleA() {}

export async function handleB() {}

export function handleC() {}

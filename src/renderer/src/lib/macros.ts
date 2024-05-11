import { CardData, PersonaData, Result } from "@shared/types";
import Mustache from "mustache";

export interface Ctx {
  cardData: CardData;
  personaData: PersonaData;
}

/*
  Currently supported macros:
  - {{user}} - the name of the user / persona
  - {{char}} - the name of the character
*/
export function render(str: string, ctx: Ctx): Result<string, Error> {
  const user = ctx.personaData.name;
  const char = ctx.cardData.character.name;
  const refinedCtx = { user, char };

  try {
    const rendered = Mustache.render(str, refinedCtx);
    return { kind: "ok", value: rendered };
  } catch (e) {
    return { kind: "err", error: e };
  }
}

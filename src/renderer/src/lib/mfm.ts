/* 
  Moe Flavor Markdown (mfm)
  ENBF:
    text = { element } ;
    element = bold | italic | block_quote | quote | strikethrough | emoji | plain ;
    bold = "**" { element } "**" ;
    italic = "_" { element } "_" | "*" { element } "*" ;
    block_quote = "> " { element } newline ;
    quote = '"' plain '"' ;
    strikethrough = "~~" { element } "~~" ;
    emoji = ":" plain - space ":" ;
    plain = { character } ;
    character = ? any unicode character ? ;
*/

import { deepFreeze } from "@shared/utils";

enum Token {
  S_BOLD,
  E_BOLD,
  S_ITALIC_STAR,
  E_ITALIC_STAR,
  S_ITALIC_UNDERSCORE,
  E_ITALIC_UNDERSCORE,
  S_BLOCK_QUOTE,
  E_BLOCK_QUOTE,
  S_QUOTE,
  E_QUOTE,
  S_STRIKETHROUGH,
  E_STRIKETHROUGH,
  S_EMOJI,
  E_EMOJI,
  PLAIN
}

interface Node {
  value: string;
  children: Node[];
}

function lex(text: string): Token[] {
  return [];
}

function parse(tokens): Node {
  return {} as any;
}

export const mfm = {
  lex,
  parse
};
deepFreeze(mfm);

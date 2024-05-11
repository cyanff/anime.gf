/* 
  The MIT License (MIT)

  Copyright (c) 2015 Stian Grytøyr

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.  
*/
// https://github.com/stiang/remove-markdown

/* eslint-disable */
import { deepFreeze } from "@shared/utils";

/**
 * Strips Markdown formatting from the provided input string, based on the specified options.
 *
 * @param {string} md - The Markdown-formatted input string to be stripped.
 * @param {object} [options] - An optional object containing configuration options for the stripping process.
 * @param {boolean} [options.listUnicodeChar=false] - Whether to replace list item markers with a Unicode character.
 * @param {boolean} [options.stripListLeaders=true] - Whether to remove list item leaders (e.g., `*`, `+`, `1.`) from the output.
 * @param {boolean} [options.gfm=true] - Whether to apply GitHub Flavored Markdown (GFM) stripping rules.
 * @param {boolean} [options.useImgAltText=true] - Whether to use the alt text of images in the output.
 * @param {boolean} [options.abbr=false] - Whether to remove abbreviations from the output.
 * @param {boolean} [options.replaceLinksWithURL=false] - Whether to replace inline links with their URLs in the output.
 * @param {string[]} [options.htmlTagsToSkip=[]] - An array of HTML tags to skip when removing HTML tags from the output.
 * @returns {string} The stripped Markdown text.
 */
function strip(md, options): string {
  options = options || {};
  options.listUnicodeChar = options.hasOwnProperty("listUnicodeChar") ? options.listUnicodeChar : false;
  options.stripListLeaders = options.hasOwnProperty("stripListLeaders") ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty("gfm") ? options.gfm : true;
  options.useImgAltText = options.hasOwnProperty("useImgAltText") ? options.useImgAltText : true;
  options.abbr = options.hasOwnProperty("abbr") ? options.abbr : false;
  options.replaceLinksWithURL = options.hasOwnProperty("replaceLinksWithURL") ? options.replaceLinksWithURL : false;
  options.htmlTagsToSkip = options.hasOwnProperty("htmlTagsToSkip") ? options.htmlTagsToSkip : [];

  var output = md || "";

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*/gm, "");

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + " $1");
      else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, "$1");
    }
    if (options.gfm) {
      output = output
        // Header
        .replace(/\n={2,}/g, "\n")
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, "")
        // Strikethrough
        .replace(/~~/g, "")
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, "");
    }
    if (options.abbr) {
      // Remove abbreviations
      output = output.replace(/\*\[.*\]:.*\n/, "");
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, "");

    var htmlReplaceRegex = new RegExp("<[^>]*>", "g");
    if (options.htmlTagsToSkip.length > 0) {
      // Using negative lookahead. Eg. (?!sup|sub) will not match 'sup' and 'sub' tags.
      var joinedHtmlTagsToSkip = "(?!" + options.htmlTagsToSkip.join("|") + ")";

      // Adding the lookahead literal with the default regex for html. Eg./<(?!sup|sub)[^>]*>/ig
      htmlReplaceRegex = new RegExp("<" + joinedHtmlTagsToSkip + "[^>]*>", "ig");
    }

    output = output
      // Remove HTML tags
      .replace(htmlReplaceRegex, "")
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, "")
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, "")
      .replace(/\s{0,2}\[.*?\]: .*?$/g, "")
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? "$1" : "")
      // Remove inline links
      .replace(/\[([^\]]*?)\][\[\(].*?[\]\)]/g, options.replaceLinksWithURL ? "$2" : "$1")
      // Remove blockquotes
      .replace(/^(\n)?\s{0,3}>\s?/gm, "$1")
      // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, "")
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm, "$1$3$4$6")
      // Remove * emphasis
      .replace(/([\*]+)(\S)(.*?\S)??\1/g, "$2$3")
      // Remove _ emphasis. Unlike *, _ emphasis gets rendered only if
      //   1. Either there is a whitespace character before opening _ and after closing _.
      //   2. Or _ is at the start/end of the string.
      .replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, "$1$3$4$5")
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, "$2")
      // Remove inline code
      .replace(/`(.+?)`/g, "$1")
      // // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      // .replace(/\n{2,}/g, '\n\n')
      // // Remove newlines in a paragraph
      // .replace(/(\S+)\n\s*(\S+)/g, '$1 $2')
      // Replace strike through
      .replace(/~(.*?)~/g, "$1");
  } catch (e) {
    console.error(e);
    return md;
  }
  return output;
}

export const md = {
  strip
};
deepFreeze(md);

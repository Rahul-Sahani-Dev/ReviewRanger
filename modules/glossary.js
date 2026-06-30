// glossary.js
// Turns a line of code into segments, marking which pieces have a
// plain-English meaning the learner can tap to read.

import { content } from "../content.js";

const glossary = content.glossary;

// Match longest keys first so ">=" wins before ">", and ".append" before ".".
const keys = Object.keys(glossary).sort((a, b) => b.length - a.length);

// Alphabetic keys (def, return, len...) must match whole words only,
// so "if" inside "gift" is never mistaken for the keyword.
const isWordKey = (k) => /^[A-Za-z]/.test(k);
const isWordChar = (ch) => ch !== undefined && /[A-Za-z0-9_]/.test(ch);

export function lookup(key) {
  return glossary[key];
}

// Ordered list for a readable glossary panel (keeps the source order).
export function glossaryEntries() {
  return Object.keys(glossary).map((symbol) => ({ symbol, meaning: glossary[symbol] }));
}

// Split a line into [{ text, key }]. key is a glossary key (tappable) or null.
export function tokenizeLine(line) {
  const out = [];
  let plain = "";
  let i = 0;

  const flush = () => {
    if (plain) {
      out.push({ text: plain, key: null });
      plain = "";
    }
  };

  while (i < line.length) {
    let matched = null;
    for (const k of keys) {
      if (!line.startsWith(k, i)) continue;
      if (isWordKey(k)) {
        const before = line[i - 1];
        const after = line[i + k.length];
        if (isWordChar(before) || isWordChar(after)) continue;
      }
      matched = k;
      break;
    }
    if (matched) {
      flush();
      out.push({ text: matched, key: matched });
      i += matched.length;
    } else {
      plain += line[i];
      i += 1;
    }
  }
  flush();
  return out;
}

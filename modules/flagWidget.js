// flagWidget.js
// The heart of the app: a labeled group of per-line flag toggles.
//
// Parity by design:
//  - Tap: each flag control is a 44x44 button.
//  - Keyboard: Tab reaches each flag control, Enter/Space toggles it,
//    Up/Down or J/K move between lines.
// Flag state shows a calm accent plus the text marker "flagged" (never red),
// and exposes aria-pressed to screen readers.
// Tapping a glossed symbol shows its meaning and never toggles the flag.

import { tokenizeLine, lookup } from "./glossary.js";

export function buildFlagWidget(puzzle, onGloss, onToggle) {
  const group = document.createElement("div");
  group.className = "flag-widget";
  group.setAttribute("role", "group");
  group.setAttribute(
    "aria-label",
    "Code lines. Flag the lines that break the promise."
  );

  const flags = [];

  puzzle.snippet.forEach((lineText, idx) => {
    const lineNo = idx + 1;

    const row = document.createElement("div");
    row.className = "code-row";

    // --- the flag control -------------------------------------------
    const flagBtn = document.createElement("button");
    flagBtn.type = "button";
    flagBtn.className = "flag-btn";
    flagBtn.dataset.line = String(lineNo);
    flagBtn.setAttribute("aria-pressed", "false");
    flagBtn.setAttribute("aria-label", "Flag line " + lineNo);

    const mark = document.createElement("span");
    mark.className = "flag-mark";
    mark.setAttribute("aria-hidden", "true");
    const txt = document.createElement("span");
    txt.className = "flag-text";
    txt.textContent = "flag";
    flagBtn.append(mark, txt);

    flagBtn.addEventListener("click", () => {
      const pressed = flagBtn.getAttribute("aria-pressed") === "true";
      const next = !pressed;
      flagBtn.setAttribute("aria-pressed", String(next));
      flagBtn.classList.toggle("is-flagged", next);
      txt.textContent = next ? "flagged" : "flag";
      row.classList.toggle("row-flagged", next);
      if (onToggle) onToggle(lineNo, next);
    });
    flags.push(flagBtn);

    // --- the line number (decorative; SR reads it from the code) -----
    const num = document.createElement("span");
    num.className = "line-no";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(lineNo);

    // --- the code text, with tappable glossed symbols ----------------
    const code = document.createElement("code");
    code.className = "code-text";

    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = "Line " + lineNo + ": ";
    code.appendChild(sr);

    tokenizeLine(lineText).forEach((seg) => {
      if (seg.key) {
        const tok = document.createElement("button");
        tok.type = "button";
        tok.className = "gloss-token";
        tok.textContent = seg.text;
        const meaning = lookup(seg.key);
        tok.setAttribute("aria-label", "Explain " + seg.text + ": " + meaning);
        tok.addEventListener("click", (e) => {
          // never let a gloss tap bubble into a flag toggle
          e.stopPropagation();
          if (onGloss) onGloss(seg.text, meaning);
        });
        code.appendChild(tok);
      } else {
        code.appendChild(document.createTextNode(seg.text));
      }
    });

    row.append(flagBtn, num, code);
    group.appendChild(row);
  });

  // Up/Down and J/K move between the flag controls.
  group.addEventListener("keydown", (e) => {
    const t = e.target;
    if (!t.classList || !t.classList.contains("flag-btn")) return;
    const i = flags.indexOf(t);
    if (i === -1) return;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") next = i + 1;
    else if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") next = i - 1;
    if (next >= 0 && next < flags.length) {
      e.preventDefault();
      flags[next].focus();
    }
  });

  function getFlags() {
    return flags
      .filter((b) => b.getAttribute("aria-pressed") === "true")
      .map((b) => Number(b.dataset.line));
  }
  function focusFirst() {
    if (flags[0]) flags[0].focus();
  }

  return { element: group, getFlags, focusFirst };
}

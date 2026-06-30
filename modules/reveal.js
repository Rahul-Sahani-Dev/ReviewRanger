// reveal.js
// Belonging-first feedback. Builds the warm reveal after a submit.
//
// A finding counts as found if ANY of its lines was flagged.
// Nothing here is ever marked wrong: no red, no "incorrect", no failure.
// Recall and precision are computed for the private save only, never shown
// as a grade and never used to block anything.

export function buildReveal(puzzle, flaggedLines, voice) {
  const findings = puzzle.findings || [];
  const flagged = new Set(flaggedLines);

  const found = [];
  const missed = [];
  const findingLines = new Set();
  findings.forEach((f) => {
    f.lines.forEach((l) => findingLines.add(l));
    const isFound = f.lines.some((l) => flagged.has(l));
    (isFound ? found : missed).push(f);
  });
  const stray = flaggedLines.filter((l) => !findingLines.has(l));

  const wrap = document.createElement("section");
  wrap.className = "reveal screen";
  wrap.setAttribute("aria-labelledby", "reveal-lead");

  // --- the lead line -------------------------------------------------
  let leadText;
  if (findings.length === 0) leadText = voice.clean;
  else if (found.length === findings.length) leadText = voice.allCaught;
  else if (found.length > 0) leadText = voice.some;
  else leadText = voice.none;

  const lead = document.createElement("p");
  lead.className = "reveal-lead";
  lead.id = "reveal-lead";
  lead.tabIndex = -1;
  lead.textContent = leadText;
  wrap.appendChild(lead);

  // --- one card per finding, in snippet order ------------------------
  findings.forEach((f) => {
    const isFound = f.lines.some((l) => flagged.has(l));
    wrap.appendChild(findingCard(f, isFound, voice));
  });

  // --- an "already correct" puzzle -----------------------------------
  if (findings.length === 0 && puzzle.cleanNote) {
    const card = document.createElement("div");
    card.className = "finding-card clean";
    card.appendChild(para("finding-summary", puzzle.cleanNote.why));
    card.appendChild(labeled("The habit", puzzle.cleanNote.rule));
    wrap.appendChild(card);
  }

  // --- stray flags are never errors ----------------------------------
  if (stray.length > 0) {
    const card = document.createElement("div");
    card.className = "finding-card stray";
    const badge = document.createElement("span");
    badge.className = "badge badge-stray";
    badge.textContent = stray.length === 1 ? "a careful eye" : "careful eyes";
    card.appendChild(badge);
    card.appendChild(para("stray-note", voice.stray));
    wrap.appendChild(card);
  }

  // --- always close on belonging -------------------------------------
  const close = document.createElement("p");
  close.className = "reveal-close";
  close.textContent = voice.close;
  wrap.appendChild(close);

  const stats = {
    totalFindings: findings.length,
    found: found.length,
    stray: stray.length,
    caughtAll: findings.length > 0 ? found.length === findings.length : true,
    // Private only. Never displayed as a grade.
    recall: findings.length ? found.length / findings.length : 1,
    precision: flaggedLines.length
      ? (flaggedLines.length - stray.length) / flaggedLines.length
      : 1,
  };

  // Plain text for optional read-aloud.
  const parts = [leadText];
  findings.forEach((f) => {
    parts.push(
      f.summary + " Why it matters: " + f.why + " The habit: " + f.rule + " The fix: " + f.fix
    );
  });
  if (findings.length === 0 && puzzle.cleanNote) {
    parts.push(puzzle.cleanNote.why, puzzle.cleanNote.rule);
  }
  if (stray.length > 0) parts.push(voice.stray);
  parts.push(voice.close);
  const speakText = parts.join(" ");

  return { element: wrap, stats, speakText };
}

function findingCard(f, isFound, voice) {
  const card = document.createElement("div");
  card.className = "finding-card " + (isFound ? "found" : "missed");

  const head = document.createElement("div");
  head.className = "finding-head";

  const badge = document.createElement("span");
  badge.className = "badge " + (isFound ? "badge-found" : "badge-notice");
  badge.textContent = isFound ? voice.spotted : voice.toNotice;
  head.appendChild(badge);

  const where = document.createElement("span");
  where.className = "finding-lines";
  where.textContent = linesPhrase(f.lines);
  head.appendChild(where);

  card.appendChild(head);
  card.appendChild(para("finding-summary", f.summary));
  card.appendChild(labeled("Why it matters", f.why));
  card.appendChild(labeled("The habit", f.rule));
  card.appendChild(labeled("The fix", f.fix));
  return card;
}

function linesPhrase(lines) {
  if (!lines || lines.length === 0) return "";
  if (lines.length === 1) return "Line " + lines[0];
  if (lines.length === 2) return "Lines " + lines[0] + " and " + lines[1];
  return "Lines " + lines.slice(0, -1).join(", ") + " and " + lines[lines.length - 1];
}

function para(cls, text) {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  return p;
}

function labeled(label, text) {
  const block = document.createElement("p");
  block.className = "labeled";
  const strong = document.createElement("span");
  strong.className = "label";
  strong.textContent = label + ": ";
  block.appendChild(strong);
  block.appendChild(document.createTextNode(text));
  return block;
}

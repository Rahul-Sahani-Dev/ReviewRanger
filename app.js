// app.js
// ReviewRanger — the patient guide. Ties the pieces together.
// No build step: this runs straight from the file in any modern browser.

import { content } from "./content.js";
import { tokenizeLine, lookup, glossaryEntries } from "./modules/glossary.js";
import * as store from "./modules/storage.js";
import * as audio from "./modules/audio.js";
import * as speech from "./modules/speech.js";
import { buildPrimer } from "./modules/primer.js";
import { buildFlagWidget } from "./modules/flagWidget.js";
import { buildReveal } from "./modules/reveal.js";
import {
  exportCode,
  importCode,
  drawQRCode,
  scanSupported,
  scanImageFile,
} from "./modules/transfer.js";

// ---- state --------------------------------------------------------------
const state = {
  settings: store.loadSettings(),
  profile: store.getActiveProfile(),
  progress: store.emptyProgress(),
  flat: [],
  index: 0,
  lastFlags: [],
};

content.themes.forEach((theme) => {
  theme.puzzles.forEach((puzzle) => {
    state.flat.push({
      themeId: theme.id,
      themeTitle: theme.title,
      themeBlurb: theme.blurb,
      puzzle,
    });
  });
});

// ---- short DOM helpers --------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.id) node.id = opts.id;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.html != null) node.innerHTML = opts.html;
  if (opts.type) node.type = opts.type;
  if (opts.attrs) for (const k in opts.attrs) node.setAttribute(k, opts.attrs[k]);
  if (opts.on) for (const ev in opts.on) node.addEventListener(ev, opts.on[ev]);
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}
function button(label, cls, onClick, attrs) {
  return el("button", { class: cls, type: "button", text: label, on: { click: onClick }, attrs });
}

const main = $("#main");
const status = $("#sr-status");

function announce(msg) {
  status.textContent = "";
  // a tick later so screen readers re-announce identical text
  requestAnimationFrame(() => (status.textContent = msg));
}
function setMain(node) {
  main.innerHTML = "";
  main.appendChild(node);
  const focusTarget = node.querySelector('[tabindex="-1"]') || node;
  focusTarget.focus({ preventScroll: false });
  window.scrollTo(0, 0);
  closeMenu();
}

function screen(titleText) {
  const sec = el("section", { class: "screen" });
  const h = el("h2", { class: "screen-title", text: titleText, attrs: { tabindex: "-1" } });
  sec.appendChild(h);
  return sec;
}

// ---- progress helpers ---------------------------------------------------
function completedCount() {
  return Object.keys(state.progress.completed || {}).length;
}
function firstIncompleteIndex() {
  for (let i = 0; i < state.flat.length; i++) {
    if (!state.progress.completed[state.flat[i].puzzle.id]) return i;
  }
  return -1;
}
function missedPuzzles() {
  return state.flat
    .map((entry, i) => ({ entry, i }))
    .filter(({ entry }) => {
      const c = state.progress.completed[entry.puzzle.id];
      return c && c.caughtAll === false;
    });
}
function save() {
  store.saveProgress(state.profile, state.progress);
}

// Jump to a random puzzle. A small, calm way to roam.
function shufflePuzzle() {
  const i = Math.floor(Math.random() * state.flat.length);
  announce("Shuffled to a new puzzle.");
  renderPuzzle(i);
}

// ---- settings -----------------------------------------------------------
function applySettings() {
  const root = document.documentElement;
  if (state.settings.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", state.settings.theme);

  if (state.settings.motion === "auto") root.removeAttribute("data-motion");
  else root.setAttribute("data-motion", state.settings.motion);

  audio.setMuted(state.settings.mute);
  updateHeaderToggles();
}
function persistSettings() {
  store.saveSettings(state.settings);
  applySettings();
}

// ========================================================================
//  Header
// ========================================================================
function buildHeader() {
  const header = $("#app-header");
  header.innerHTML = "";

  const brand = button("ReviewRanger", "brand", () => {
    if (state.profile) renderStart();
    else renderHome();
  });
  brand.setAttribute("aria-label", "ReviewRanger home");

  const soundBtn = button("", "icon-btn", () => {
    state.settings.mute = !state.settings.mute;
    persistSettings();
    announce(state.settings.mute ? "Sound off." : "Sound on.");
  }, { id: "sound-btn" });

  const themeBtn = button("", "icon-btn", () => {
    const order = ["auto", "light", "dark"];
    const next = order[(order.indexOf(state.settings.theme) + 1) % order.length];
    state.settings.theme = next;
    persistSettings();
    announce("Theme: " + next + ".");
  }, { id: "theme-btn" });

  const menuBtn = button("Menu", "icon-btn", toggleMenu, {
    id: "menu-btn",
    "aria-expanded": "false",
    "aria-controls": "menu",
  });

  const controls = el("div", { class: "header-controls" }, [soundBtn, themeBtn, menuBtn]);

  const items = [
    ["Reviewer and progress", () => renderStart()],
    ["All themes", () => renderThemes()],
    ["Settings", () => renderSettings()],
    ["Move to another device", () => renderTransfer()],
    ["About", () => renderAbout()],
    ["Start over (clear this device)", () => renderWipe()],
  ];
  const nav = el("nav", { id: "menu", attrs: { "aria-label": "Menu", hidden: "" } },
    items.map(([label, fn]) =>
      button(label, "menu-item", () => { closeMenu(); fn(); })
    )
  );

  header.append(brand, controls, nav);
  updateHeaderToggles();
}
function updateHeaderToggles() {
  const s = $("#sound-btn");
  if (s) {
    s.textContent = state.settings.mute ? "Sound off" : "Sound on";
    s.setAttribute("aria-pressed", String(!state.settings.mute));
    s.setAttribute("aria-label", state.settings.mute ? "Turn sound on" : "Turn sound off");
  }
  const t = $("#theme-btn");
  if (t) {
    const label = { auto: "Theme: auto", light: "Theme: light", dark: "Theme: dark" }[state.settings.theme];
    t.textContent = label;
    t.setAttribute("aria-label", "Change colour theme. Currently " + state.settings.theme);
  }
}
function toggleMenu() {
  const nav = $("#menu");
  const btn = $("#menu-btn");
  const open = nav.hasAttribute("hidden");
  if (open) {
    nav.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
    btn.textContent = "Close";
  } else {
    closeMenu();
  }
}
function closeMenu() {
  const nav = $("#menu");
  const btn = $("#menu-btn");
  if (nav) nav.setAttribute("hidden", "");
  if (btn) {
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Menu";
  }
}

// ========================================================================
//  Screens
// ========================================================================
function renderHome() {
  const sec = screen("ReviewRanger");
  sec.appendChild(el("p", {
    class: "lead",
    text: "Learn to read and review code, one small puzzle at a time. Free, private, and nothing here is ever marked wrong.",
  }));

  const who = el("section", { class: "panel", attrs: { "aria-label": "Who is reviewing" } });
  who.appendChild(el("h3", { text: "Who is reviewing?" }));

  const profiles = store.listProfiles();
  if (profiles.length) {
    const list = el("div", { class: "profile-list" });
    profiles.forEach((name) => {
      list.appendChild(button("Continue as " + name, "btn btn-soft", () => chooseProfile(name)));
    });
    who.appendChild(list);
  }

  const form = el("form", { class: "name-form", on: { submit: (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) { announce("Type a nickname first, or play as a guest."); input.focus(); return; }
    const created = store.createProfile(name);
    if (created) chooseProfile(created);
  } } });
  const label = el("label", { class: "field-label", text: "Or pick a nickname", attrs: { for: "name-input" } });
  const input = el("input", { id: "name-input", attrs: { type: "text", autocomplete: "off", maxlength: "40", placeholder: "your nickname" } });
  const startBtn = el("button", { class: "btn btn-primary", type: "submit", text: "Start" });
  form.append(label, el("div", { class: "field-row" }, [input, startBtn]));
  who.appendChild(form);

  who.appendChild(button("Play as a guest", "btn btn-soft", () => chooseProfile(store.GUEST)));
  who.appendChild(el("p", { class: "fine", text: "Guest play stays on this device until you clear it. On a shared computer, a nickname keeps each person's progress separate." }));

  sec.appendChild(who);
  setMain(sec);
}

function chooseProfile(name) {
  store.setActiveProfile(name);
  state.profile = name;
  state.progress = store.loadProgress(name);
  audio.playStart();
  renderStart();
}

function renderStart() {
  if (!state.profile) { renderHome(); return; }
  state.progress = store.loadProgress(state.profile);
  const isGuest = state.profile === store.GUEST;
  const sec = screen(isGuest ? "Welcome" : "Hi, " + state.profile);

  const done = completedCount();
  const total = state.flat.length;
  sec.appendChild(el("p", { class: "lead", text:
    done === 0
      ? "You have " + total + " short puzzles waiting, across four kinds of review."
      : "You have looked at " + done + " of " + total + " puzzles. Pick up where you like." }));

  const actions = el("div", { class: "stack" });
  const next = firstIncompleteIndex();
  if (next !== -1 && done > 0) {
    actions.appendChild(button("Continue", "btn btn-primary", () => renderPuzzle(next)));
  } else if (done === 0) {
    actions.appendChild(button("Start the first puzzle", "btn btn-primary", () => renderPuzzle(0)));
  } else {
    actions.appendChild(button("Look again at the puzzles", "btn btn-primary", () => renderThemes()));
  }

  actions.appendChild(button("Shuffle a puzzle", "btn btn-soft", shufflePuzzle));
  actions.appendChild(button(content.primer.startLabel, "btn btn-soft", () => renderPrimer()));
  actions.appendChild(button(content.primer.skipLabel, "btn btn-soft", () => {
    state.progress.primerSeen = true;
    save();
    const i = firstIncompleteIndex();
    renderPuzzle(i === -1 ? 0 : i);
  }));
  actions.appendChild(button("See all themes", "btn btn-ghost", () => renderThemes()));
  sec.appendChild(actions);

  setMain(sec);
}

function renderPrimer() {
  const node = buildPrimer(content.primer, () => {
    state.progress.primerSeen = true;
    save();
    const i = firstIncompleteIndex();
    renderPuzzle(i === -1 ? 0 : i);
  });
  setMain(node);
}

function renderPuzzle(index) {
  if (index < 0) index = 0;
  if (index >= state.flat.length) { renderDone(); return; }
  state.index = index;
  state.lastFlags = [];
  state.progress.position = { index };
  save();

  const entry = state.flat[index];
  const puzzle = entry.puzzle;

  const sec = screen("Review this change");
  sec.querySelector(".screen-title").classList.add("visually-compact");

  // context line
  sec.appendChild(el("p", { class: "puzzle-context" }, [
    el("span", { class: "theme-tag", text: entry.themeTitle }),
    el("span", { class: "puzzle-count", text: "Puzzle " + (index + 1) + " of " + state.flat.length }),
  ]));

  // the promise
  const promiseBox = el("div", { class: "promise-box" }, [
    el("p", { class: "promise-label", text: "The promise" }),
    el("p", { class: "promise", text: puzzle.promise }),
  ]);
  sec.appendChild(promiseBox);

  sec.appendChild(el("p", { class: "instruction", text:
    "Flag the line or lines that break the promise. If nothing breaks it, that is fine — just submit." }));

  // the flagging widget
  const hint = el("p", { class: "hint", id: "gloss-hint", attrs: { role: "status", "aria-live": "polite" },
    text: "Tip: tap any underlined symbol in the code to see what it means." });

  const widget = buildFlagWidget(
    puzzle,
    (symbol, meaning) => {
      hint.textContent = symbol + " — " + meaning;
    },
    (line, flagged) => {
      audio.playToggle();
      announce((flagged ? "Flagged line " : "Unflagged line ") + line);
    }
  );
  sec.appendChild(widget.element);
  sec.appendChild(hint);

  // a glossary list for the symbols in this snippet (keyboard friendly)
  const used = usedSymbols(puzzle.snippet);
  if (used.length) {
    const det = el("details", { class: "gloss-list" });
    det.appendChild(el("summary", { text: "What do these symbols mean?" }));
    const dl = el("dl");
    used.forEach(({ symbol, meaning }) => {
      dl.appendChild(el("dt", { text: symbol }));
      dl.appendChild(el("dd", { text: meaning }));
    });
    det.appendChild(dl);
    sec.appendChild(det);
  }

  // actions
  const submit = button("Submit review", "btn btn-primary", () => {
    state.lastFlags = widget.getFlags();
    renderReveal();
  });
  const nav = el("div", { class: "stack-row" }, [submit, button("All themes", "btn btn-ghost", () => renderThemes())]);
  sec.appendChild(nav);

  setMain(sec);
}

function renderReveal() {
  const entry = state.flat[state.index];
  const puzzle = entry.puzzle;
  const built = buildReveal(puzzle, state.lastFlags, content.voice);

  // record progress (private; never a grade)
  state.progress.completed[puzzle.id] = {
    caughtAll: built.stats.caughtAll,
    found: built.stats.found,
    total: built.stats.totalFindings,
    stray: built.stats.stray,
    ts: Date.now(),
  };
  save();

  const sec = el("section", { class: "screen" });
  sec.appendChild(built.element);

  // read-aloud (always paired with the on-screen text)
  if (speech.isSupported()) {
    const readBtn = button("Read this aloud", "btn btn-soft", () => speech.speak(built.speakText));
    sec.appendChild(readBtn);
    if (state.settings.readAloud) speech.speak(built.speakText);
  }

  // next / navigation
  const isLast = state.index >= state.flat.length - 1;
  const nextBtn = button(isLast ? "Finish" : "Next puzzle", "btn btn-primary", () => {
    speech.stop();
    if (isLast) renderDone();
    else renderPuzzle(state.index + 1);
  });
  sec.appendChild(el("div", { class: "stack-row" }, [
    nextBtn,
    button("All themes", "btn btn-ghost", () => { speech.stop(); renderThemes(); }),
  ]));

  setMain(sec);
  audio.playReveal();
}

function renderThemes() {
  const sec = screen("All themes");
  sec.appendChild(el("p", { class: "lead", text:
    "Roam freely. Open any puzzle, in any order. A tick just means you have looked at it." }));
  sec.appendChild(el("div", { class: "stack" }, [
    button("Shuffle a puzzle", "btn btn-primary", shufflePuzzle),
  ]));

  let flatIndex = 0;
  content.themes.forEach((theme) => {
    const block = el("section", { class: "theme-block", attrs: { "aria-label": theme.title } });
    block.appendChild(el("h3", { text: theme.title }));
    block.appendChild(el("p", { class: "theme-blurb", text: theme.blurb }));
    const list = el("div", { class: "puzzle-grid" });
    theme.puzzles.forEach((puzzle, n) => {
      const myIndex = flatIndex++;
      const c = state.progress.completed[puzzle.id];
      const mark = c ? (c.caughtAll ? "caught it" : "looked at it") : "not yet";
      const btn = button("", "puzzle-chip" + (c ? " is-done" : ""), () => renderPuzzle(myIndex));
      btn.appendChild(el("span", { class: "chip-n", text: "Puzzle " + (n + 1) }));
      btn.appendChild(el("span", { class: "chip-state", text: mark }));
      btn.setAttribute("aria-label", "Puzzle " + (n + 1) + " of " + theme.title + ", " + mark);
      list.appendChild(btn);
    });
    block.appendChild(list);
    sec.appendChild(block);
  });

  sec.appendChild(button("Back", "btn btn-ghost", () => renderStart()));
  setMain(sec);
}

function renderDone() {
  const sec = screen("You went through them all");
  sec.appendChild(el("p", { class: "lead", text: content.voice.close }));

  const missed = missedPuzzles();
  if (missed.length) {
    const panel = el("section", { class: "panel", attrs: { "aria-label": "A few to look at again" } });
    panel.appendChild(el("h3", { text: "A few to look at again" }));
    panel.appendChild(el("p", { text:
      "These had a part still worth noticing. No rush, and no marks — just another gentle look." }));
    const grid = el("div", { class: "puzzle-grid" });
    missed.forEach(({ entry, i }) => {
      const btn = button("", "puzzle-chip", () => renderPuzzle(i));
      btn.appendChild(el("span", { class: "chip-n", text: entry.themeTitle }));
      btn.appendChild(el("span", { class: "chip-state", text: "look again" }));
      grid.appendChild(btn);
    });
    panel.appendChild(grid);
    sec.appendChild(panel);
  }

  sec.appendChild(el("div", { class: "stack-row" }, [
    button("See all themes", "btn btn-primary", () => renderThemes()),
    button("Back to start", "btn btn-ghost", () => renderStart()),
  ]));
  setMain(sec);
}

function renderSettings() {
  const sec = screen("Settings");

  // sound
  sec.appendChild(toggleRow(
    "Gentle sounds", !state.settings.mute,
    (on) => { state.settings.mute = !on; persistSettings(); }
  ));

  // theme
  sec.appendChild(radioRow("Colour theme", "theme",
    [["Match my device", "auto"], ["Light", "light"], ["Dark", "dark"]],
    state.settings.theme, (v) => { state.settings.theme = v; persistSettings(); }
  ));

  // motion
  sec.appendChild(radioRow("Motion", "motion",
    [["Match my device", "auto"], ["Reduce motion", "reduce"], ["Allow motion", "full"]],
    state.settings.motion, (v) => { state.settings.motion = v; persistSettings(); }
  ));

  // read aloud
  if (speech.isSupported()) {
    sec.appendChild(toggleRow(
      "Read the reveal aloud", !!state.settings.readAloud,
      (on) => { state.settings.readAloud = on; persistSettings(); }
    ));
  } else {
    sec.appendChild(el("p", { class: "fine", text: "Read-aloud is not available in this browser. Everything is always on screen as text." }));
  }

  sec.appendChild(button("Back", "btn btn-ghost", () => renderStart()));
  setMain(sec);
}

function renderTransfer() {
  const sec = screen("Move to another device");
  sec.appendChild(el("p", { class: "lead", text:
    "Your progress stays on your devices. Nothing is sent anywhere. Copy the code below, or scan the picture, on your other device." }));

  // export
  const exp = el("section", { class: "panel", attrs: { "aria-label": "Your code" } });
  exp.appendChild(el("h3", { text: "Take it with you" }));
  const code = exportCode(state.progress);
  const ta = el("textarea", { class: "code-out", attrs: { readonly: "", rows: "4", "aria-label": "Your transfer code" } });
  ta.value = code;
  exp.appendChild(ta);
  exp.appendChild(button("Copy the code", "btn btn-soft", async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(code); ok = true; } catch { ok = false; }
    if (!ok) { ta.focus(); ta.select(); }
    announce(ok ? "Code copied." : "Code selected — press copy on your keyboard.");
  }));
  const canvas = el("canvas", { class: "qr", attrs: { "aria-label": "A QR picture of your code" } });
  const drew = drawQRCode(canvas, code);
  if (drew) exp.appendChild(canvas);
  sec.appendChild(exp);

  // import
  const imp = el("section", { class: "panel", attrs: { "aria-label": "Load a code" } });
  imp.appendChild(el("h3", { text: "Bring it here" }));
  const inTa = el("textarea", { class: "code-in", attrs: { rows: "4", placeholder: "Paste a code here", "aria-label": "Paste a transfer code" } });
  imp.appendChild(inTa);
  imp.appendChild(button("Load this code", "btn btn-primary", () => {
    const p = importCode(inTa.value);
    if (!p) { announce("That code was not readable. Check it copied fully and try again."); return; }
    state.progress = p;
    save();
    announce("Loaded. Your progress is here now.");
    renderStart();
  }));
  if (scanSupported()) {
    const file = el("input", { attrs: { type: "file", accept: "image/*", "aria-label": "Scan a QR picture" } });
    file.addEventListener("change", async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const text = await scanImageFile(f);
      if (text) { inTa.value = text; announce("Picture read. Press Load this code."); }
      else announce("Could not read that picture. You can paste the code instead.");
    });
    imp.appendChild(el("label", { class: "field-label", text: "Or scan a QR picture" }));
    imp.appendChild(file);
  }
  sec.appendChild(imp);

  sec.appendChild(button("Back", "btn btn-ghost", () => renderStart()));
  setMain(sec);
}

function renderAbout() {
  const sec = screen("About ReviewRanger");
  sec.appendChild(el("p", { class: "lead", text:
    "ReviewRanger is a free, open guide for anyone learning to read and review code. It works offline, keeps nothing about you, and never marks you wrong." }));
  sec.appendChild(el("p", { text: content.attribution }));
  sec.appendChild(el("p", { class: "fine", text:
    "Code is shared under GPL-3.0. The puzzles and words are shared under CC BY-SA 4.0. Teachers and volunteers can add their own puzzles by editing one file — see the README in the project." }));
  sec.appendChild(button("Back", "btn btn-ghost", () => renderStart()));
  setMain(sec);
}

function renderWipe() {
  const sec = screen("Start over");
  sec.appendChild(el("p", { class: "lead", text:
    "This clears everything ReviewRanger saved on this device: every profile, all progress, and the offline files. It cannot be undone." }));
  sec.appendChild(el("p", { class: "fine", text:
    "Use this to leave a shared or library computer with no trace." }));

  let armed = false;
  const confirm = button("Clear this device", "btn btn-primary", async function () {
    if (!armed) {
      armed = true;
      this.textContent = "Tap again to clear";
      announce("Tap again to confirm clearing this device.");
      return;
    }
    await store.wipeAll();
    state.profile = null;
    state.progress = store.emptyProgress();
    state.settings = store.loadSettings();
    applySettings();
    announce("This device is cleared. A fresh start.");
    renderHome();
  });
  sec.appendChild(el("div", { class: "stack-row" }, [
    confirm,
    button("Keep my progress", "btn btn-ghost", () => renderStart()),
  ]));
  setMain(sec);
}

// ---- small builders -----------------------------------------------------
function toggleRow(label, on, onChange) {
  const id = "t-" + Math.abs(hashStr(label));
  const wrap = el("div", { class: "setting-row" });
  const lab = el("label", { class: "setting-label", text: label, attrs: { for: id } });
  const btn = el("button", {
    id, class: "switch", type: "button",
    attrs: { role: "switch", "aria-checked": String(on) },
    on: { click: () => {
      const now = btn.getAttribute("aria-checked") !== "true";
      btn.setAttribute("aria-checked", String(now));
      btn.classList.toggle("is-on", now);
      onChange(now);
    } },
  });
  btn.classList.toggle("is-on", on);
  btn.appendChild(el("span", { class: "switch-track", attrs: { "aria-hidden": "true" } }));
  btn.appendChild(el("span", { class: "switch-state", text: on ? "on" : "off" }));
  // keep the visible text in sync
  const sync = () => { btn.querySelector(".switch-state").textContent = btn.getAttribute("aria-checked") === "true" ? "on" : "off"; };
  btn.addEventListener("click", sync);
  wrap.append(lab, btn);
  return wrap;
}
function radioRow(label, name, options, current, onChange) {
  const fs = el("fieldset", { class: "setting-row radio-set" });
  fs.appendChild(el("legend", { class: "setting-label", text: label }));
  options.forEach(([text, value]) => {
    const id = name + "-" + value;
    const opt = el("label", { class: "radio-opt", attrs: { for: id } });
    const input = el("input", { id, attrs: { type: "radio", name } });
    if (value === current) input.checked = true;
    input.addEventListener("change", () => { if (input.checked) onChange(value); });
    opt.append(input, el("span", { text }));
    fs.appendChild(opt);
  });
  return fs;
}
function usedSymbols(snippet) {
  const seen = new Set();
  const out = [];
  snippet.forEach((line) => {
    tokenizeLine(line).forEach((seg) => {
      if (seg.key && !seen.has(seg.key)) {
        seen.add(seg.key);
        out.push({ symbol: seg.key, meaning: lookup(seg.key) });
      }
    });
  });
  return out;
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}

// ========================================================================
//  Start up
// ========================================================================
function init() {
  applySettings();
  buildHeader();

  // close the menu on Escape or outside click
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  document.addEventListener("click", (e) => {
    const nav = $("#menu");
    if (!nav || nav.hasAttribute("hidden")) return;
    if (!e.target.closest("#menu") && !e.target.closest("#menu-btn")) closeMenu();
  });

  if (state.profile && (state.profile === store.GUEST || store.profileExists(state.profile))) {
    state.progress = store.loadProgress(state.profile);
    renderStart();
  } else {
    state.profile = null;
    renderHome();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

init();

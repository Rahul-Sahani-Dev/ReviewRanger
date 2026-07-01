# Contributing to ReviewRanger

Thank you for being here. The most valuable thing you can add is **a new puzzle** - and you do not need to be a programmer to do it. If you can fill in a form made of words, you can contribute.

Everything learners see lives in one file: [`content.js`](content.js). You will not need to touch any other file.

---

## The spirit (please read this first)

ReviewRanger exists to make a nervous beginner feel they belong in engineering. Two promises hold the whole project together:

1. **Nothing is ever marked wrong.** No red, no "incorrect", no "you failed", no failure sound, no wording that says the learner wasted their time. A careful eye that flags a line that turned out fine is *still a careful eye*.
2. **Plain English, always.** Short sentences. Active voice. No idioms, no jargon, no sarcasm. Many learners read English as a second language and may be on a cheap phone in a noisy room.

If a change would break either promise, it does not belong here, however clever it is.

---

## How to add a puzzle

1. Open [`content.js`](content.js).
2. Find the theme you want by its `id`:
   - `intent` - *Does the code do what it claims?*
   - `edges` - *The edges* (boundaries, off-by-one, empty or zero cases)
   - `slips` - *The small slips* (a swapped value, a wrong name, a copy-paste leftover)
   - `comments` - *Does the comment still match the code?*
3. Copy a whole existing puzzle block (from one `{` to its matching `},`) and paste it next to the others inside that theme's `puzzles: [ ... ]` list.
4. Edit the text inside the quotes. Keep the labels outside the quotes (`promise:`, `snippet:`, `findings:`, `lines:`, `summary:`, `why:`, `rule:`, `fix:`).
5. Give the puzzle a new, unique `id`.
6. Commit. The puzzle appears the next time the app loads - no build step.

### The shape of a puzzle

- `id` - a short unique label, e.g. `"edges-temperature"`.
- `promise` - one plain sentence: what the code is meant to do.
- `snippet` - the lines of code, as a list of strings. The **first line is line 1**.
- `findings` - a list of problems. Each finding has:
  - `lines` - the line number(s) the problem lives on (must exist in the snippet).
  - `summary` - one sentence naming the mismatch.
  - `why` - why it matters, in plain words, with a concrete example.
  - `rule` - the habit a reviewer should take away.
  - `fix` - what to change.
- For an **already-correct** puzzle, use `findings: []` and (optionally) a `cleanNote: { why, rule }`.

### New symbols

If your snippet uses a symbol that is not already in the `glossary` near the top of `content.js`, add it there with a short plain-English meaning, so learners can tap it to understand it.

---

## The checklist (a reviewer will check these)

- [ ] Every `lines` number exists in that puzzle's `snippet` (first line is 1).
- [ ] Every finding has a `summary`, a `why`, a `rule`, and a `fix`.
- [ ] Sentences are short, active, and idiom-free.
- [ ] Nothing reads as blame, failure, or "wrong". No red is introduced.
- [ ] The snippet is **original** - not copied from any real repository, book, or article.
- [ ] Early-theme snippets stay tiny (minimal syntax, no loops).
- [ ] Any new symbol used in the snippet has a `glossary` entry.
- [ ] The `id` is new and unique.
- [ ] The app still loads (open it locally with a simple static server, or just preview your fork's GitHub Pages).

---

## Other contributions

Fixes to wording, accessibility, translations of the interface, and bug fixes are all welcome. Keep the two promises above intact, and keep the no-build, no-server, offline-first constraints: the app must always run straight from static files.

## Licensing of contributions

By contributing, you agree that your **code** is licensed under [GPL-3.0](LICENSE) and your **content** (puzzles and learner-facing words) under **CC BY-SA 4.0** (see [CONTENT-LICENSE.md](CONTENT-LICENSE.md)). You will be counted among "ReviewRanger by Rahul Sahani and contributors."

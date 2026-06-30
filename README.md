# ReviewRanger

**A free, offline, private web app that teaches absolute beginners to read and review code — and never, ever marks them wrong.**

ReviewRanger is the patient guide a self-taught beginner never had. A learner reads a one-line *promise* ("Give the customer the cheaper of the two prices"), looks at a tiny snippet of code, and flags the line or lines that break the promise. Then a warm mentor voice walks them through it. There is no red, no "wrong", no failure sound, anywhere. The whole point is to leave the learner feeling they belong in engineering.

It is built so that **anyone** — including teachers and volunteers with no coding background — can fork it, add their own puzzles by editing **one clearly marked file**, and publish it with a single commit. No build step. No server. No accounts. No tracking.

---

## What it does

- An optional, skippable **"Reading code changes 101"** primer.
- A **tap-to-explain glossary**: every known symbol in a snippet can be tapped to show a plain-English meaning.
- A **flagging widget** with full tap **and** keyboard support, built for screen readers.
- The **core loop**: read the promise → flag the lines → get a kind, belonging-first reveal.
- **24+ starter puzzles** across four review skills (intent vs code, the edges, the small slips, stale comments).
- **On-device auto-save**, **named local profiles** for shared computers, and a **guest one-tap wipe**.
- **Move between devices** with a copy-and-paste code or a QR picture — generated and read locally, with no server.
- Installable **PWA**: works fully offline after the first load.

---

## Try it / run it

**The easiest way is GitHub Pages** (see *Deploy it* below). Once it is live, just open the link in any modern browser. You can also "install" it from the browser menu to use it like an app, online or offline.

**To preview it on your own computer**, you need a tiny local web server (modern browsers do not allow the app's small module files to load directly from a `file://` path). Pick whichever you have:

- Python: `python -m http.server 8000`
- Node: `npx serve` (or `npx http-server`)

Then open the address it prints (for example `http://localhost:8000`).

That is only for previewing on your machine. **Publishing needs no server and no build step at all** — GitHub Pages serves the files as they are.

---

## Deploy it (free, on GitHub Pages)

1. **Fork** this repository to your own GitHub account.
2. In your fork, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the **`main`** branch and the **`/ (root)`** folder, then **Save**.
5. Wait a minute. GitHub gives you a public link like `https://yourname.github.io/ReviewRanger/`. That is your live app.

There is **no CI build** in the way. Whenever you commit a change (like a new puzzle), GitHub Pages republishes it, and the app — which uses a network-first service worker — picks up your change the next time it is online.

---

## Add your own puzzle (a guide for non-coders)

You do **not** need to know how to program. You will edit one file, [`content.js`](content.js), which is just a long, friendly form made of text.

### The idea

Every puzzle has:

- a **promise** — one plain sentence saying what the code is meant to do,
- a **snippet** — the lines of code, written as a list,
- **findings** — the problems hidden in the snippet (there can be one, several, or none).

Each finding has four short pieces: a **summary**, a **why**, a **rule** (the habit it teaches), and a **fix**.

### Step by step

1. Open [`content.js`](content.js) in GitHub (click the file, then the pencil ✏️ to edit), or on your computer in any text editor.
2. Find the theme you want, for example the part that starts with `id: "edges"`. Inside it is a list called `puzzles: [ ... ]`.
3. **Copy a whole existing puzzle block** — everything from one `{` to its matching `},` — and paste it right next to the others, inside the same `puzzles: [ ... ]` list.
4. Change the words inside the quote marks. Keep the words *outside* the quotes (like `promise:` and `snippet:`) exactly as they are.
5. Give your puzzle a new, unique `id` (any short label, like `"edges-my-new-one"`).
6. Save. On GitHub, that means writing a short note and clicking **Commit changes**.

That is it. Your puzzle appears the next time the app loads. No build, no command line.

### The rules for a good puzzle

These keep ReviewRanger kind, clear, and correct. The README and [`CONTRIBUTING.md`](CONTRIBUTING.md) both list them:

- **Line numbers must be real.** Every number in a finding's `lines` must point to a line that exists in that snippet. The first line of a snippet is line **1**.
- **Every finding has all four parts**: `summary`, `why`, `rule`, `fix`.
- **Plain English only.** Short sentences. Active voice. No idioms, no jargon, no sarcasm.
- **Never anything that says "wrong".** No red, no blame, no "you failed". A flag that lands a little wide is still a careful eye.
- **Write your own snippets.** Never copy code from a real project, a textbook, or a website. Make up something small and friendly, like the examples already in the file.
- **Keep early puzzles tiny.** Minimal syntax, no loops, in the gentlest sets. Add new symbols only when a later puzzle needs them — and add a plain-English meaning for any new symbol to the `glossary` near the top of the file, so learners can tap it.
- An **"already correct" puzzle** (with `findings: []`) is welcome. Knowing when code is fine is part of review too.

---

## Project layout

```
index.html              the page shell
styles.css              all styling (no red anywhere; light + dark; AA contrast)
app.js                  ties everything together; no build needed
content.js              ← THE FILE EDITORS CHANGE: puzzles, glossary, primer, mentor voice
modules/
  flagWidget.js         the per-line flagging widget (tap + keyboard + screen reader)
  reveal.js             the belonging-first feedback
  glossary.js           tap-to-explain tokeniser
  primer.js             the optional reading primer
  storage.js            on-device save, profiles, guest wipe
  transfer.js           export/import code + QR (all local, no server)
  qr.js                 a self-contained QR generator
  audio.js              gentle confirmation tones (and no failure sound, ever)
  speech.js             optional read-aloud
manifest.webmanifest    makes it installable
sw.js                   service worker (network-first, then cache) for offline
icons/                  app icons
```

---

## Privacy and offline

- **No backend, no server, no accounts, no email, nothing collected.** ReviewRanger never runs or pays for a server.
- Progress is saved **only on the device**, in the browser.
- **Named profiles** let several people share one computer without mixing their progress.
- **Guest mode** has a one-tap wipe that clears `localStorage`, `IndexedDB`, and Cache Storage, leaving no trace — good for a library or school computer.
- After the first load, the app works **fully offline**.

## Accessibility

ReviewRanger targets **WCAG 2.1 AA**. Keyboard-only and touch-only both complete a full session. The flagging widget exposes `aria-pressed` and clear labels. There is optional read-aloud (always paired with on-screen text), a persistent mute, reduced-motion support, and both a light and a dark theme that pass contrast.

---

## Licenses and attribution

- **Code:** [GPL-3.0](LICENSE).
- **Content** (puzzles and learner-facing words): **CC BY-SA 4.0** — see [CONTENT-LICENSE.md](CONTENT-LICENSE.md).
- Attribution string: **"ReviewRanger by Rahul Sahani and contributors."**

Because there is no server, there is no data controller.

## Contributing

New puzzles are the most welcome contribution of all. See [CONTRIBUTING.md](CONTRIBUTING.md) and the pull-request template. You belong here too.

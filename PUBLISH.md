# Publishing & forking ReviewRanger

This guide takes you from the files on your computer to a **live website**, with
**no build step and no cost**. It is written for people who have never used
GitHub before. Pick **Path A** (point-and-click) or **Path B** (command line).

ReviewRanger is just static files. GitHub Pages serves them as-is. There is
nothing to compile, no server to run, and no monthly bill.

---

## What you have

```
index.html              the page
app.js                  the logic (no build step)
content.js              ← the file you edit to add puzzles
styles.css              the look (cream, serif, minimal)
sw.js, manifest.webmanifest   make it installable + offline
.nojekyll               tells GitHub Pages to serve the files as-is (keep it!)
modules/                small helper scripts
icons/                  app icons
README.md, CONTRIBUTING.md, LICENSE, CONTENT-LICENSE.md
.github/PULL_REQUEST_TEMPLATE.md
```

> **Important:** keep `index.html` and `.nojekyll` at the **top level** of the
> repository (not inside a sub-folder), or the site will 404.

---

## Path A — publish with the GitHub website (no commands)

1. **Make a free account** at <https://github.com>.
2. Click the **+** (top-right) → **New repository**.
   - **Repository name:** e.g. `ReviewRanger`
   - **Public**
   - Do **not** add a README (you already have one).
   - Click **Create repository**.
3. On the new empty repo page, click **uploading an existing file**.
4. Open the unzipped `ReviewRanger` folder on your computer, select **all the
   files and folders inside it** (so `index.html` lands at the top), and drag
   them onto the upload area. Wait for them to finish uploading.
5. Scroll down and click **Commit changes**.
6. Go to **Settings → Pages** (left sidebar).
   - **Source:** *Deploy from a branch*
   - **Branch:** `main`  •  Folder: `/ (root)`  → **Save**
7. Wait about a minute, then refresh that page. GitHub shows your live link:
   `https://YOUR-USERNAME.github.io/ReviewRanger/`

That link is your app. Open it on a phone and "Add to Home Screen" to install it.

---

## Path B — publish with git (command line)

You need git installed (<https://git-scm.com>). One-time setup:

```
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

Then, inside the `ReviewRanger` folder:

```
git init
git add .
git commit -m "ReviewRanger: initial commit"
git branch -M main
```

Create an **empty** repository on GitHub (Path A, steps 1–2, but skip the
upload). GitHub shows a URL like `https://github.com/YOU/ReviewRanger.git`.
Connect and push:

```
git remote add origin https://github.com/YOU/ReviewRanger.git
git push -u origin main
```

Then enable Pages exactly as in **Path A, steps 6–7**.

> This repository may already be initialized with a first commit. If so, skip
> `git init` / `git add` / `git commit` and go straight to `git remote add` and
> `git push`.

---

## Updating it later

1. Edit a file (almost always `content.js` — see below).
2. **Website:** open the file on GitHub, click the ✏️ pencil, make your change,
   click **Commit changes**.
   **Command line:** `git add .` then `git commit -m "Add a puzzle"` then
   `git push`.
3. GitHub Pages republishes within a minute.

If your phone or browser still shows the old version, do a **hard refresh**
(`Ctrl+Shift+R` on desktop) once. ReviewRanger's service worker is "network
first," so it picks up your changes the next time it is online; the hard
refresh just skips your browser's own cache.

---

## How other people fork and contribute

Anyone can make their own copy:

1. On your repo page, they click **Fork** (top-right). They now have their own
   editable copy at `github.com/THEIR-NAME/ReviewRanger`.
2. They enable **Settings → Pages** on *their* fork to get *their* live site.
3. They edit `content.js` to add their own puzzles (next section).
4. (Optional) To offer their puzzles back to you, they open a **Pull Request**
   from their fork. The form in `.github/PULL_REQUEST_TEMPLATE.md` walks them
   through the checklist. See `CONTRIBUTING.md`.

---

## What you can safely edit

You do **not** need to be a programmer. Here is the map:

### Add or change puzzles — `content.js` (start here)
This is the one file made for editors. It holds every puzzle, the glossary, the
reading primer, and the mentor's words. Copy an existing puzzle block, paste it
next to the others in the same theme, and change the words inside the quotes.
Full step-by-step instructions are in **`README.md` → "Add your own puzzle"**
and **`CONTRIBUTING.md`**. The rules in short:

- Every line number in a finding must exist in that snippet (first line = 1).
- Every finding needs a `summary`, a `why`, a `rule`, and a `fix`.
- Plain English. Short sentences. No idioms.
- Never anything that says "wrong"; no red; no blame.
- Write your own snippets — never copy real code.

### Change the mentor's tone — `content.js` → `voice`
The warm, never-graded lines shown after each puzzle. Keep them kind.

### Change colours or fonts — `styles.css` → `:root`
The block at the top sets the cream background, ink text, and serif font as
named values (`--bg`, `--text`, `--serif`, ...). Change a value to restyle the
whole app. There is a matching block for dark mode just below. (Rule: never
introduce red — nothing is ever marked wrong.)

### Rename the app
Change the name in three places: `manifest.webmanifest` (`name` and
`short_name`), the `<title>` in `index.html`, and the brand text in `app.js`
(search for `"ReviewRanger"`).

### You normally never need to touch
`app.js`, the files in `modules/`, or `sw.js` — those are the working parts.
The whole point is that a non-coder only ever edits `content.js`.

---

## Licenses (please keep these)

- **Code:** GPL-3.0 (`LICENSE`).
- **Content** (puzzles and words): CC BY-SA 4.0 (`CONTENT-LICENSE.md`).
- Keep the attribution line: **"ReviewRanger by Rahul Sahani and contributors."**

Forks and remixes are welcome and encouraged — that is what these licenses are
for. Because there is no server, there is no data controller and nothing is
collected about anyone.

---

## Troubleshooting

- **Blank page when I double-click `index.html`.** That is expected — browsers
  block the small module files over a `file://` path. Use GitHub Pages, or run a
  tiny local server: `python -m http.server 8000` then open
  `http://localhost:8000`.
- **404 after enabling Pages.** Make sure `index.html` and `.nojekyll` are at
  the repository **root**, not inside a sub-folder.
- **My change isn't showing.** Wait a minute for Pages to rebuild, then hard
  refresh (`Ctrl+Shift+R`).
- **Icons missing.** Confirm the `icons/` folder uploaded with its files.

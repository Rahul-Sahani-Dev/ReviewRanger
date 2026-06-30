# ReviewRanger PRD (complete)



A free, open, offline web app that teaches absolute beginners to read and review code, and is built so that anyone, including teachers and volunteers with no coding background, can fork it, add their own puzzles, and redeploy it. Its purpose is to be the patient guide a self-taught beginner never had, and to leave them feeling they belong in engineering.



## 1. Who it serves

The learner: a nervous beginner, often on a cheap phone or a shared library or school computer, sometimes with English as a second language, often with nobody technical around them. The editor: a teacher or NGO worker who is not a programmer and should be able to add a puzzle by editing one clearly marked file and publish it by committing, with no build step.



## 2. Principles, non-negotiable

Free forever. No accounts, no email, no name, nothing collected, no backend or server anywhere. Offline-first after one load. Desktop and browser are first-class, since many learners have no phone of their own but reach a computer. Plain English throughout. WCAG 2.1 AA. Forkable and editable by non-coders. And the heart of it: nothing is ever marked wrong. No red, no X, no failure sound, no word that says the learner wasted their time.



## 3. The learner's journey

An optional, skippable "Reading code changes 101" primer (what a line is, what a comment or name promises, what review means). Then themed puzzle sets in a friendly order, each set teaching one beginner-level review skill. Nothing ever hard-locks a learner out, they can roam, and skipping the primer is treated as "I already read code." Missed themes resurface gently for review later, all stored on-device. The skill themes for launch:

1. Does the code do what it claims (intent versus code).

2. The edges (boundaries, off-by-one, empty or zero cases).

3. The small slips (a swapped value, a wrong variable, a copy-paste leftover).

4. Does the comment still match the code (stale or lying comments).



## 4. The core loop

A short snippet appears with a one-line promise above it. The learner reads the promise, then flags the line or lines that break it. Submitting with zero flags is valid. Then the guide reveals, in a warm mentor voice. Repeat.



## 5. The flagging widget

A labeled group of per-line toggles, the core component of the whole app. Each line has an explicit flag control plus the code text. Identical activation by tap and by keyboard: Tab reaches each flag control, Enter or Space toggles it, Up or Down or J or K move between lines. Flag state uses a calm accent color plus a text marker reading "flagged," never red, and exposes aria-pressed to screen readers. Touch targets at least 44 by 44 pixels, visible focus ring at 3 to 1 contrast. Tapping a glossed symbol in the code shows its meaning and does not toggle the flag.



## 6. Belonging-first feedback

Build the reveal from these branches. A finding counts as found if any of its lines was flagged.

- Caught all findings, no stray flags: "There it is. You read the promise, checked the code against it, and caught it. That is code review, and you just did it."

- Caught some: "Nice, you caught part of this. Let me show you the rest."

- Caught none: "Good, you took a real look, that is the part that counts. Let me walk you to it."

- For every finding, render its summary, why it matters, the general rule it teaches, and the fix. Found ones get a light "you spotted this," missed ones get "here is the one to notice."

- Stray flags are never errors: "About the line you flagged: it is doing its job fine here. No harm at all, a careful eye that lands a little wide is still a careful eye, and that is what review needs."

- Always close on belonging: "You saw real things in real code just now. There is a place for you in this."



Recall and precision may be computed for the learner's own private view, but are never shown as a grade and never block anything.



## 7. Just-in-time basics

No syntax lecture up front. The optional skippable primer, plus a glossary where every known symbol in any snippet is tappable and shows a plain-English meaning in a live hint area. New constructs are glossed the first time a puzzle uses one. A learner who skips the primer still has tap-to-explain under them. Keep snippets to minimal syntax, no loops, in the earliest sets, introducing more only as later sets need it.



## 8. Progress and privacy, no server

On-device auto-save, so the same machine resumes where the learner left off. Named local profiles for shared computers: a nickname loads that learner's local save and nothing leaves the machine. Moving between devices is a data-carrying export code or QR, generated and decoded locally, with no server. Guest mode with a one-tap wipe that clears all localStorage, IndexedDB, and Cache Storage. ReviewRanger never runs or pays for a server. A memorable cross-device sync code is deliberately not here.



## 9. Architecture and deployment

- Forkability is a hard constraint. No build step is required to run or deploy. The app runs directly from static files. A non-programmer can add a puzzle by editing one commented content file and see it live by committing, with GitHub Pages serving the repo and no CI build in the way.

- Stack: vanilla JavaScript with ES modules, or any approach needing no bundler or transpile step to run. Content lives in a separate plain data file, not inside logic.

- PWA: installable on mobile and desktop, fully offline after first load, via a small manifest and a service worker that uses network-first then cache, so an editor's changes appear when online and the app still works offline.

- Performance: under 500 KB transferred to reach interactive. All content is text and small, so it loads fast and the whole experience works offline.

- Hosting: static, GitHub Pages or equivalent, zero cost.



## 10. Content system

All content lives in one schema-versioned, heavily commented data file, separate from app code. The README documents the rules so editors can follow them: every finding's line numbers must exist in its snippet, every finding needs a summary, a why, a rule, and a fix, and all learner-facing text stays plain (short sentences, active voice, no idioms). Originality rule: every snippet is written for the project, never copied from a real repository or article. Author a complete starter set of at least four to six puzzles per theme across the four themes in section 3, following the seed examples below and these rules exactly, so the product ships full, not as a sample.



## 11. Seed content (ship these, and they are the format example for editors)



Glossary, plain English: `def` is "defines a function, a named block of steps"; `return` is "hands this value back to whoever called the function"; `==` is "is the same as"; `!=` is "is not the same as"; `>` is "is greater than"; `<` is "is less than"; `>=` is "is greater than or equal to"; `<=` is "is less than or equal to"; `[0]` is "the first item, counting starts at zero"; `[1]` is "the second item, counting starts at zero".



Puzzle 1, intent versus code, the engineered first win. Promise: "Give the customer the cheaper of the two prices."

def cheaper_price(price_a, price_b):
    if price_a < price_b:
        return price_b
    else:
        return price_a

Finding, lines 3 and 5. Summary: the promise asks for the cheaper price, but the code hands back the more expensive one every time. Why: when price_a is the smaller one, line 3 returns price_b, the bigger one, and in the other case line 5 returns price_a, the bigger one, so the customer is quietly overcharged, nothing crashes, no alarm goes off, it just keeps happening until someone reads it the way you just did. Rule: check the code against what it claims, a name or a comment is a promise, not a fact, so read the promise first and look for the line that breaks it. Fix: swap the two returns, line 3 returns price_a and line 5 returns price_b.



Puzzle 2, the edges. Promise: "Return True if the person is 18 or older."

def is_adult(age):
    return age > 18

Finding, line 2. Summary: the promise says 18 or older, but the code only says older than 18. Why: with age greater than 18, someone who is exactly 18 gets turned away even though they should be let in, and the bug hides right on the edge, at the exact number in the promise. Rule: boundaries are where bugs live, so whenever you see a comparison, test the edge value in your head, here, what happens at exactly 18. Fix: use age greater than or equal to 18.



Puzzle 3, the edges. Promise: "Return the first item in the list."

def first_item(items):
    return items[1]

Finding, line 2. Summary: the promise asks for the first item, but the code reaches for the second one. Why: counting starts at zero, so items[0] is the first item and items[1] is the second, and this code skips the real first item. Rule: counting starts at zero, items[0] is first and items[1] is second, so when a position looks off by one, this is usually why. Fix: use items[0].



## 12. Accessibility and audio

WCAG 2.1 AA. Keyboard-only and touch-only both complete a full session. Screen-reader support on the flagging widget per section 5. Optional read-aloud through the browser speech voice, always paired with on-screen text, absent gracefully where unsupported. Gentle confirmation tones, a persistent mute, and no failure sound anywhere in the code. Reduced-motion support. Dark and light, both contrast-passing.



## 13. Repo deliverables

The static app files. One separate, commented content file. The manifest and service worker. A README explaining what it is, how to run it, how to deploy it (enable GitHub Pages), and a friendly "Add your own puzzle" guide aimed at a non-coder. A LICENSE (GPL-3.0). A content license note (CC BY-SA 4.0) and the attribution string "ReviewRanger by YouCantBearMe and contributors." A CONTRIBUTING note and a simple pull-request template inviting new puzzles.



## 14. Acceptance criteria

A nervous beginner, on a cheap phone and on a desktop browser, offline, can open it, read a promise, flag a line by tap and by keyboard, catch puzzle 1 as a clear win, see a reveal with no red anywhere, move through the full set of puzzles across all four themes, and reopen later to find their progress waiting. A non-programmer can add a new puzzle by editing the content file and see it appear after committing, with no build step. Technically: under 500 KB to interactive, the whole experience works with the service worker off, guest wipe leaves no trace, keyboard-only and touch-only both pass, clean console.



## 15. License and identity

GPL-3.0 code, CC BY-SA 4.0 content, copyright YouCantBearMe, on the separate GitHub account, no server so no data controller.
# 🇩🇪 Genau — A Structured German Grammar Course (A1 → B1)

**Genau** is a free, self-study German grammar course from **A1 to B1**, built around cognitive science for one clear goal: **passing a B1 German exam** (modeled on **telc Deutsch B1**, and equally useful for Goethe, ÖSD, and DTZ) with a focus on **reading and writing**.

All **65 lessons**, **533 spaced-repetition flashcards**, **multilingual contrast notes** (🇧🇷 Portuguese, 🇪🇸 Spanish, 🇫🇷 French, 🇬🇧 English), and **hidden answer keys** live as plain Markdown files — ready to study in the browser or offline.

> **Study in your browser:** [laguiar.github.io/genau](https://laguiar.github.io/genau/) — read all 65 lessons, filter contrast languages, track progress, practice diagnostics, and review flashcards with zero setup.

---

## Ways to study

### 1. In the browser (Recommended)
Open **[laguiar.github.io/genau](https://laguiar.github.io/genau/)** on desktop, iPad, or phone — no downloads or terminal commands required:
- Study all **65 lessons** (`A1`, `A2`, `B1`) and exam reference sheets in a distraction-free editorial reader.
- Toggle which **contrast languages** (`🇧🇷 BR`, `🇪🇸 ES`, `🇫🇷 FR`, `🇬🇧 EN`) appear in lessons with one click.
- **Track your progress** across A1–B1 locally in your browser (with JSON backup & restore).
- Use **Practice** for an A2-04 diagnostic with 7-day follow-up, timed B1 listening, paired speaking role cards, and writing revisions ([Practice guide](practice/README.md)).
- Review **spaced-repetition flashcards** right in the app, or add the site to your phone's Home Screen.
- Click **Copy for AI Tutor** inside any lesson to drill interactively in ChatGPT, Claude, or Gemini, or **Print** cheat sheets and mock exams cleanly.

### 2. Offline as a digital notebook (Obsidian / ZIP)
- **Read on GitHub:** Open [PLAN.md](PLAN.md) and browse [A1/](A1/README.md), [A2/](A2/README.md), or [B1/](B1/README.md). Every answer key stays folded behind a reveal toggle.
- **Download a copy:** Grab the **[latest ZIP release](https://github.com/laguiar/genau/releases/latest/download/genau.zip)** (or browse [Releases](https://github.com/laguiar/genau/releases)) and unzip anywhere.
- **Offline reader:** Open the unzipped `genau` folder in **[Obsidian](https://obsidian.md/)** (free) for clean tables, collapsible keys, local progress tracking in [PROGRESS.md](PROGRESS.md), and writing drafts in `writing/submissions/`.

### 3. Live drilling with ChatGPT, Claude, or Gemini
Static exercises are half the method; **live drilling and writing correction** are the other half:
1. Open **[PROMPT.md](PROMPT.md)** and copy the AI tutor prompt.
2. Paste it into **ChatGPT**, **Claude**, or **Gemini** (or save it as a Project / Gem).
3. Paste or upload any lesson (e.g. `A1/A1-05-nouns-gender-articles.md`) and say: *"Run this lesson with me"*, *"Drill me for 10 minutes"*, or *"Correct my letter"*.

### 4. Spaced-repetition flashcards in Anki
Ready-to-import `.tsv` decks for A1, A2, B1, and all four contrast languages live in **[review/anki/](review/anki/README.md)** — download a deck and choose **File → Import** in Anki.

---

## The daily 30-minute routine

Read [METHOD.md](METHOD.md) once (10 minutes) for the full learning protocol and cognitive-science references. In brief:

1. **5 min — Review flashcards:** Clear today's due cards in the web app or Anki ([review/anki/](review/anki/README.md)).
2. **20 min — Topic work:** Pick the next lesson in [PLAN.md](PLAN.md). Score at least 7/8 on the diagnostic to mark it `✔` and move on; otherwise study the dual-coded rule, complete the exercises without peeking, and then check the answer key.
3. **5 min — Write:** Write 3–5 sentences (or a telc-style letter paragraph from A2-22 onward) using today's grammar and get feedback from your AI tutor.

Pause for a week or a month whenever life gets busy — nothing breaks, and your tracker shows exactly where to pick up.

---

## Repository structure

```
genau/
├── index.html         ← standalone web app (reader, flashcards, practice & progress tracker)
├── README.md          ← repository overview
├── PROMPT.md          ← copy-paste AI tutor prompt for ChatGPT, Claude, and Gemini
├── PLAN.md            ← full A1 → B1 syllabus (scope, order, rationale)
├── METHOD.md          ← 30-minute daily protocol and learning-science references
├── PROGRESS.md        ← personal Markdown progress tracker
├── AGENTS.md          ← session & onboarding protocol for AI tutors
├── A1/  A2/  B1/      ← 65 self-contained grammar lessons + consolidation tests
├── shared/            ← reference sheets (cases, verbs, connectors, word order, prepositions,
│                        telc B1 exam guide, timed practice mocks, writing templates, contrasts/)
├── review/            ← 533 spaced-repetition flashcards, ready-to-import Anki decks (anki/),
│                        error log, schedule, and optional review.py CLI
├── practice/          ← browser practice bank (diagnostics, listening audio, speaking & writing)
└── writing/           ← your texts (submissions/) and their corrections (corrections/)
```

---

## Multilingual contrast packs (🇧🇷 · 🇪🇸 · 🇫🇷 · 🇬🇧)

Genau explains German grammar in clear English and adds contrast notes highlighting where languages you already know help — or trigger false friends and transfer traps:
- 🇧🇷 **Brazilian Portuguese (`pt-BR`)** — [shared/contrasts/pt-BR.md](shared/contrasts/pt-BR.md)
- 🇪🇸 **Spanish (`es`)** — [shared/contrasts/es.md](shared/contrasts/es.md)
- 🇫🇷 **French (`fr`)** — [shared/contrasts/fr.md](shared/contrasts/fr.md)
- 🇬🇧 **English (`en`)** — [shared/contrasts/en.md](shared/contrasts/en.md)

Toggle active languages directly in the web app, or add a new language pack following [shared/contrasts/README.md](shared/contrasts/README.md) and [shared/contrasts/TEMPLATE.md](shared/contrasts/TEMPLATE.md).

---

## Sources

- Grammar inventory per level: *Profile deutsch* (Glaboniat et al., the CEFR reference for German), "Grammatik: Übersicht A1–B2".
- Practice course: DW *Nicos Weg* [A1](https://learngerman.dw.com/de/nicos-weg/c-36519687) and [A2](https://learngerman.dw.com/de/nicos-weg/c-36519709); every topic links the matching DW lesson.
- Exam format: telc Deutsch B1 handbook and Übungstests; DW [Deine Deutschprüfung A2](https://learngerman.dw.com/de/deine-deutschprüfung-a2/s-68121735).
- Learning science: see the reference list at the end of [METHOD.md](METHOD.md).

## License

Free to use, copy, and adapt for personal learning and teaching. Example sentences are original; exam descriptions summarise publicly available handbooks.

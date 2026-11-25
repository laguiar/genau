# Genau — a structured, science-based German grammar course

**👉 [Open the Genau Web App (laguiar.github.io/genau)](https://laguiar.github.io/genau/)** — study all 65 lessons, filter contrast languages, track progress, and review flashcards right in your browser (no installation needed).

**Genau** is a free, self-study German grammar course from **A1 to B1**, built for one goal: **passing a B1 German exam** (target format: **telc Deutsch B1**, and equally useful for Goethe, ÖSD, and DTZ). The focus is **reading and writing**.

Everything is written in plain Markdown files, with **hidden answer keys** (no accidental peeking), **multilingual contrast notes** (🇧🇷 Portuguese, 🇪🇸 Spanish, 🇫🇷 French, 🇬🇧 English), **533 spaced-repetition flashcards**, and a **built-in browser web app**.

---

## How to start (no technical setup required)

Pick whichever way feels easiest to you:

### Option 1 — Study in your browser (Recommended)
Open **[https://laguiar.github.io/genau/](https://laguiar.github.io/genau/)** on your laptop or phone — zero downloads, zero terminal commands:
- Browse all **65 lessons** (`A1`, `A2`, `B1`) and reference sheets in a clean editorial reader.
- Toggle which **contrast languages** (`🇧🇷 BR`, `🇪🇸 ES`, `🇫🇷 FR`, `🇬🇧 EN`) appear in every lesson with one click.
- **Track your progress** across A1–B1 automatically in your browser (with backup/restore).
- Review **interactive spaced-repetition flashcards** directly in the browser — or tap **Add to Home Screen** on your phone to use it like an app.
- Click **"Copy for AI Tutor"** inside any lesson to practice it interactively in ChatGPT, Claude, or Gemini, or click **Print** to print cheat sheets & mock exams cleanly.

### Option 2 — Read on GitHub or Download as a Digital Notebook (Obsidian / Notion)
- **Read right here on GitHub:** Open [PLAN.md](PLAN.md) and click any topic in [A1/](A1/README.md), [A2/](A2/README.md), or [B1/](B1/README.md). Every answer key is hidden behind a **"Click to reveal answer key"** toggle.
- **Download a personal copy (no Git needed):** **[Download Genau ZIP](https://github.com/laguiar/genau/releases/latest/download/genau.zip)** (or browse all versions under **[Releases](https://github.com/laguiar/genau/releases)**), and unzip the `genau` folder anywhere on your computer.
- **Best reading experience offline:** Open the unzipped `genau` folder in **[Obsidian](https://obsidian.md/)** (free). It displays tables, collapsible answer keys, and links cleanly, and lets you edit [PROGRESS.md](PROGRESS.md) and save your writing in `writing/submissions/`.

### Option 3 — Practice live with ChatGPT, Claude, or Gemini (Web / Mobile App)
Static exercises are only half of the method — the other half is **live drilling and writing correction**.
1. Open **[PROMPT.md](PROMPT.md)** and copy the ready-made AI tutor prompt.
2. Paste it into **ChatGPT**, **Claude**, or **Gemini** on the web (or into a Project / Gem).
3. Upload or paste any lesson file (e.g. `A1/A1-05-nouns-gender-articles.md`) and say: *"Run this lesson with me"*, *"Drill me for 10 minutes"*, or *"Correct my letter"*.

### Option 4 — Study flashcards on your phone with Anki
You don't need to run any scripts to use Anki. Ready-to-import decks for A1, A2, B1, and all four contrast languages are already generated in **[review/anki/](review/anki/README.md)** — just download a `.tsv` file and click **File → Import** in Anki.

---

## The daily 30-minute routine

Read [METHOD.md](METHOD.md) once (10 minutes) for the full learning protocol and the cognitive science behind it. In short:

1. **5 min — Review flashcards:** Review today's due cards in the **Genau Web App** or in **Anki** ([review/anki/](review/anki/README.md)).
2. **20 min — Topic work:** Pick the next topic in [PLAN.md](PLAN.md). Score at least 7/8 on the regular lesson diagnostic to mark it `✔` and move on. Otherwise, study the dual-coded rule, do the exercises, then open the collapsible answer key. Consolidation lessons have their own tests and scoring instructions.
3. **5 min — Write:** Write 3–5 sentences (or a telc-style letter paragraph from A2-22 on) using today's grammar. Get feedback with your AI tutor.

Pause for a week or a month whenever life gets busy — nothing breaks, and your tracker tells you exactly where to resume.

---

## How Genau is organized

```
genau/
├── index.html         ← standalone web app (course reader + flashcards + tracker for GitHub Pages)
├── README.md          ← you are here
├── PROMPT.md          ← copy-paste AI tutor prompt for ChatGPT, Claude, and Gemini Web
├── PLAN.md            ← the full A1 → B1 syllabus (what is covered, in which order, why)
├── METHOD.md          ← the 30-minute daily protocol and the research behind it
├── PROGRESS.md        ← personal progress tracker
├── AGENTS.md          ← session & onboarding protocol for AI tutors
├── A1/  A2/  B1/      ← 65 self-contained grammar lessons + consolidation tests
├── shared/            ← reference sheets (cases, verbs, connectors, word order, prepositions,
│                        telc B1 exam guide, timed practice mocks, writing templates, contrasts/)
├── review/            ← 533 spaced-repetition flashcards, ready-to-import Anki decks (anki/),
│                        error log, schedule, and optional review.py CLI
└── writing/           ← your texts (submissions/) and their corrections (corrections/)
```

---

## Multilingual contrast packs (🇧🇷 · 🇪🇸 · 🇫🇷 · 🇬🇧)

Genau explains grammar in clear English and includes built-in contrast boxes showing where your known languages help or create transfer traps:
- 🇧🇷 **Brazilian Portuguese (`pt-BR`)** — [shared/contrasts/pt-BR.md](shared/contrasts/pt-BR.md)
- 🇪🇸 **Spanish (`es`)** — [shared/contrasts/es.md](shared/contrasts/es.md)
- 🇫🇷 **French (`fr`)** — [shared/contrasts/fr.md](shared/contrasts/fr.md)
- 🇬🇧 **English (`en`)** — [shared/contrasts/en.md](shared/contrasts/en.md)

- **In the Web App:** Toggle which languages you want to display directly from the top bar.
- **Want to add another language** (e.g. Italian `it` or Ukrainian `uk`)? Follow [shared/contrasts/README.md](shared/contrasts/README.md) and [shared/contrasts/TEMPLATE.md](shared/contrasts/TEMPLATE.md).

---

## Sources

- Grammar inventory per level: *Profile deutsch* (Glaboniat et al., the CEFR reference for German), "Grammatik: Übersicht A1–B2".
- Practice course: DW *Nicos Weg* [A1](https://learngerman.dw.com/de/nicos-weg/c-36519687) and [A2](https://learngerman.dw.com/de/nicos-weg/c-36519709); every topic links the matching DW lesson.
- Exam format: telc Deutsch B1 handbook and Übungstests; DW [Deine Deutschprüfung A2](https://learngerman.dw.com/de/deine-deutschprüfung-a2/s-68121735).
- Learning science: see the reference list at the end of [METHOD.md](METHOD.md).

## License

Free to use, copy, and adapt for personal learning and teaching. Example sentences are original; exam descriptions summarise publicly available handbooks.

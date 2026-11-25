# review/ — the Genau spaced-repetition system

Plain Markdown plus one dependency-free Python script.

```
review/
├── README.md        this file
├── review.py        the scheduler and language-pack manager (python3, standard library only)
├── schedule.md      state: one row per card in the queue (the script edits this)
├── error-log.md     every mistake you made, with the rule → becomes cards
├── anki/            ready-to-import Anki (.tsv) flashcard decks (no terminal needed)
└── cards/
    ├── A1.md        universal cards for A1 topics
    ├── A2.md        universal cards for A2 topics
    ├── B1.md        universal cards for B1 topics
    ├── errors.md    cards generated from the error log
    └── contrasts/   language-specific contrast cards (pt-BR.md, es.md, fr.md, en.md, …)
```

## Card format

```
### A1-05-01
Q: Gender and plural of *Haus*?
A: das Haus — die Häuser
```

One card = one rule or one pattern, answerable in one glance. Tags are optional: add `T: cases prepositions` under `A:`.

## Commands

```bash
python3 review/review.py add A1-05          # queue every card of a topic (due today)
python3 review/review.py due [--limit 15]   # list cards due today, interleaved
python3 review/review.py quiz [--limit 15]  # interactive session: shows Q, waits, shows A, asks grade 0-3
python3 review/review.py grade A1-05-01 2   # record a grade without the interactive quiz
python3 review/review.py stats              # queue size, due today, per-topic accuracy
python3 review/review.py add-error 12       # turn error-log row 12 into a card in cards/errors.md and queue it
python3 review/review.py lang               # list installed contrast language packs and active languages
python3 review/review.py lang set es,en     # switch active contrast languages and sync all 62 lesson files
python3 review/review.py check [--fix]      # check each completed topic's queue, and optionally add missing cards
python3 review/review.py snapshot A2-03 A2-04 # save pre-adaptation copies of lessons before editing
python3 review/review.py reset [--lang es,en] [--yes] # reset progress and restore adapted lessons
```

## Scheduling rule

Interval ladder in days: `1, 3, 7, 14, 30, 60, 120`. Grade 0 → step 0; grade 1 → one step back; grade 2 → one step forward; grade 3 → two steps forward. A card at the top of the ladder that gets a 2 or 3 stays there (due again in 120 days). Overdue cards are not penalised; answer them when you return.

## Adaptations and reset

Before adapting a lesson, the tutor saves its original in `review/lesson-baselines/`. Reset restores the saved lesson files, reapplies your selected contrast languages, and clears review history and adaptation logs. Restoring a lesson also replaces other edits made after its snapshot. Save any edits you want to keep separately. For adaptations made before snapshots existed, provide an unadapted copy at the path printed by reset. Reset checks for these copies before clearing progress.

The release build resets a staging copy with `--clean-profile` to restore the default learner profile. A marked-up lesson without a baseline stops the build.

## Why not Anki?

Anki is great software — and you can use it right away! Ready-to-import Anki decks are already built in **[review/anki/](anki/README.md)** (no terminal needed; just download a `.tsv` file and click `File → Import` in Anki). Or study the cards directly in your browser using the Genau Web App (`index.html`).

The plain-text queue here exists so the whole course stays in one folder of human-readable Markdown files that anyone can fork, diff, and edit without an app. If you add custom error cards and want a fresh export, `python3 review/review.py export` writes `review/anki-export.tsv`.

# Contrast Language Packs (`shared/contrasts/`)

Contrast notes in Genau are modular so anyone who clones this repository can use the four built-in language packs or plug in additional languages (e.g., Italian `it`, Ukrainian `uk`).

## Built-in language packs (included by default)

- 🇧🇷 **Brazilian Portuguese (`pt-BR`):** [pt-BR.md](pt-BR.md) — full feature tables, false friends, and all 62 topic contrast notes (`A1-01` to `B1-21`). Paired flashcards: [review/cards/contrasts/pt-BR.md](../../review/cards/contrasts/pt-BR.md) (30 cards).
- 🇪🇸 **Spanish (`es`):** [es.md](es.md) — full feature tables, *gustar* ↔ `gefallen` & *ser/estar* passive mapping, false friends, and all 62 topic contrast notes (`A1-01` to `B1-21`). Paired flashcards: [review/cards/contrasts/es.md](../../review/cards/contrasts/es.md) (30 cards).
- 🇫🇷 **French (`fr`):** [fr.md](fr.md) — full feature tables, *passé composé* ↔ Perfekt mapping, false friends, and all 62 topic contrast notes (`A1-01` to `B1-21`). Paired flashcards: [review/cards/contrasts/fr.md](../../review/cards/contrasts/fr.md) (30 cards).
- 🇬🇧 **English (`en`):** [en.md](en.md) — L2 English transfer overview and all 62 topic contrast notes (`A1-01` to `B1-21`). Paired flashcards: [review/cards/contrasts/en.md](../../review/cards/contrasts/en.md) (9 cards).
- 🧩 **Template for new languages:** [TEMPLATE.md](TEMPLATE.md).

## How to switch or add a language

1. **Check active and installed packs:**
   ```bash
   python3 review/review.py lang
   ```
2. **Select which built-in packs to display in your lessons (e.g., `es,en`, `fr,en`, `pt-BR,en`, or all four `pt-BR,es,fr,en`):**
   ```bash
   python3 review/review.py lang set es,en
   # or enable all four built-in packs together:
   python3 review/review.py lang set pt-BR,es,fr,en
   ```
   This updates `**Contrast languages:**` in [PROGRESS.md](../../PROGRESS.md), injects the matching `> 🇧🇷 / 🇪🇸 / 🇫🇷 / 🇬🇧` contrast boxes across all 62 lessons in `A1/`, `A2/`, and `B1/`, and tells `review.py add <topic>` which contrast flashcards to queue.
3. **Add a new language (e.g., Italian `it`):**
   - Copy [TEMPLATE.md](TEMPLATE.md) to `shared/contrasts/it.md` (and optionally add contrast flashcards in `review/cards/contrasts/it.md`), **or** ask your AI tutor: `"Add language Italian (it)"` (see [AGENTS.md](../../AGENTS.md)), then run `python3 review/review.py lang set it,en`.

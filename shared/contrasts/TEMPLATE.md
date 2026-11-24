# Language Pack Template — `<Language>` (`<code>`)

**Code:** `<code>` · **Language:** `<Language Name>` · **Flag:** `<🏳️>` · **Label:** `<Language> contrast`

> **How to add a new language pack (e.g., Spanish `es`, French `fr`, Italian `it`):**
> 1. Copy this file to `shared/contrasts/<code>.md` (e.g. `shared/contrasts/es.md`) and fill in the metadata line above (e.g. `**Code:** es · **Language:** Spanish · **Flag:** 🇪🇸 · **Label:** Spanish contrast`).
> 2. Fill in Sections 1–6 below: where `<Language>` **helps** (positive transfer), **misleads** (negative transfer / traps), or **neither** (feature does not exist in `<Language>`), plus false friends, glossary terms, and one concise `### <TOPIC-ID>` contrast note for each of the 62 grammar topics (`A1-01` to `B1-21`).
> 3. Optionally create `review/cards/contrasts/<code>.md` with `<Language> → German` translation/trap flashcards (`### <TOPIC-ID>-<code>-01`).
> 4. Activate and inject the language into all lesson files with:
>    ```bash
>    python3 review/review.py lang set <code>,en
>    ```
>    (Or ask your AI tutor: `"Add language Spanish (es)"` — see [AGENTS.md](../../AGENTS.md)).

---

## 1. Nouns and articles

| German feature | `<Language>` transfer (`helps` / `misleads` / `neither`) | Contrast note & key traps |
|---|---|---|
| Three genders (`der / die / das`) | | |
| Article agreement (gender, number, case) | | |
| Noun capitalisation | | |
| Plural patterns & umlaut | | |
| Compound nouns (right-headed) | | |
| Zero article (professions after `sein`, general plurals) | | |

## 2. Cases (`● ▲ ■ ◆`)

| German feature | `<Language>` transfer | Contrast note & key traps |
|---|---|---|
| Four cases on determiners/adjectives/pronouns | | |
| `■` Dativ verbs that take a direct object in `<Language>` (`helfen, danken, folgen, gefallen…`) | | |
| Two-way prepositions (`wo? ■` vs `wohin? ▲`) | | |
| `◆` Genitiv possession & `wegen / trotz / während` | | |

## 3. Verbs and tenses

| German feature | `<Language>` transfer | Contrast note & key traps |
|---|---|---|
| Subject pronoun obligatory (no pro-drop) | | |
| One verb `sein` (vs `ser/estar` or continuous `-ing`) | | |
| Formal `Sie` vs informal `du / ihr` | | |
| Perfekt (`haben/sein`) vs Präteritum register split | | |
| `sein` as Perfekt auxiliary for movement/change of state | | |
| Modal verbs (`können vs dürfen`, `nicht müssen vs nicht dürfen`) | | |
| Separable prefixes & Satzklammer | | |
| Reflexive verbs (`▲ mich/dich` vs `■ mir/dir`) | | |
| Konjunktiv II (`würde`, `hätte`, `wäre`, past `hätte/wäre + PII`) | | |
| Passiv (`wird gemacht` action vs `ist gemacht` state) | | |
| Verb + fixed preposition chunks (`warten auf ▲, denken an ▲, Angst haben vor ■…`) | | |

## 4. Word order and connectors

| German feature | `<Language>` transfer | Contrast note & key traps |
|---|---|---|
| V2 inversion when an adverb/clause is in Position 1 (`Morgen fahre ich`) | | |
| Verb-final in subordinate clauses (`weil, dass, wenn, ob, obwohl`) | | |
| Three-column connectors (`denn` pos. 0 vs `weil` V-END vs `deshalb` pos. 1) | | |
| Single negation (`niemand / nichts / nie`, `kein` vs `nicht`, `kein … mehr`) | | |
| Object pronoun order (`▲ es` before `■ ihm`) | | |
| Infinitive clauses (`um … zu, ohne … zu, statt … zu`) and `indem` | | |

## 5. Spelling, sounds, and false friends

- **Spelling & pronunciation traps for `<Language>` speakers:** (`ß/ss`, `ie/ei`, umlauts, `h`, `ch`, `v/w`, `z`, salutation comma + lowercase body start).
- **Cognates that help in Lesen:** …
- **False friends (`<Language>` ↔ German):** …

## 6. Grammar terminology (`Deutsch / English / <Language>`)

| Deutsch | English | `<Language>` | Symbol / note |
|---|---|---|---|
| Nominativ / Akkusativ / Dativ / Genitiv | nominative / accusative / dative / genitive | | `● ▲ ■ ◆` |
| Substantiv / Artikel / Adjektiv / Pronomen | noun / article / adjective / pronoun | | |
| Hauptsatz / Nebensatz / Relativsatz | main / subordinate / relative clause | | V2 / V-END |
| Satzklammer | sentence bracket | | `[V2] … [V-END]` |
| trennbares / reflexives Verb / Modalverb | separable / reflexive / modal verb | | |
| Präsens / Perfekt / Präteritum / Plusquamperfekt | present / present perfect / simple past / past perfect | | |
| Konjunktiv II / Passiv | subjunctive II / passive | | |

---

## Topic notes

`review/review.py lang sync` reads each `### <TOPIC-ID>` below and injects `> <Flag> **<Label>** — <note>` into section `## 2. The rule in words` of the corresponding lesson file. Keep each note to 1–4 concise sentences focused on high-yield transfer and exam traps.

### A1-01
<contrast note for A1-01>

### A1-02
<contrast note for A1-02>

<!-- Continue for A1-03..A1-20, A2-01..A2-21, B1-01..B1-21 -->

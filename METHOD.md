# METHOD — how to study with Genau, and why

This is the protocol. It is short on purpose. The evidence behind each rule is at the end.

## 1. The daily 30 minutes

| Minutes | Activity | Tool |
|--------:|----------|------|
| 0–5 | **Review queue.** Answer today's due cards from memory, grade yourself honestly. | `python3 review/review.py quiz` |
| 5–25 | **Topic work.** Day A: read the explanation, do exercises 1–2, check the key. Day B: exercises 3+, then a live drill (see §4). | `A1/…`, `A2/…`, `B1/…` |
| 25–30 | **Write.** 3–5 sentences using today's structure, or one paragraph of a letter. Save it in `writing/submissions/`. | `writing/` |

One topic takes two days on average. Some take one, some three. Nothing breaks if you skip a week: the queue simply has more due cards when you return, and the tracker tells you where you were.

## 2. The lesson loop (one topic)

1. **Diagnostic first (3 min).** Every topic starts with 6–8 quick items. Score ≥ 90 %: mark the topic `✔ known`, still add its cards, move on. Score below: study it. If you are already around A2, expect to skip a third of A1 this way.
2. **Explanation, dual-coded.** Every rule is presented twice: in words, and as a table, bracket diagram, or symbol code. The case code is used everywhere:
   `●` Nominativ · `▲` Akkusativ · `■` Dativ · `◆` Genitiv. Word order uses bracket diagrams: `[Pos 1] [VERB] [Mitte…] [VERB-END]`.
3. **Retrieval before re-reading.** Do the exercises *without* looking back at the tables. Check with the key. Only then re-read the parts you got wrong.
4. **Log errors.** Every mistake you make goes in `review/error-log.md` with the rule it violated. Errors become cards.
5. **Produce.** Write 5 sentences (or the writing task in the lesson). The rule is only learned when you can use it in your own sentence.
6. **Queue.** `python3 review/review.py add <topic-id>` puts the topic's cards into the schedule.

## 3. Spaced repetition (the queue)

The queue lives in `review/schedule.md`, a Markdown table the script reads and writes. Cards live in `review/cards/<level>.md` as `### id` blocks with `Q:` and `A:` lines.

Intervals: **1 → 3 → 7 → 14 → 30 → 60 → 120 days**. Grade each answer 0–3:

| Grade | Meaning | Effect |
|------:|---------|--------|
| 0 | blank / wrong | back to step 0 (due tomorrow) |
| 1 | wrong, but I recognised the answer | back one step |
| 2 | right, with effort | next step |
| 3 | right, instantly | skip one step |

Cards are *rules and patterns*, not vocabulary lists: "Which case after `mit`?", "Verb position after `weil`?", "Partizip II of `bringen`?". Keep the answer short enough to check in one glance. The script shuffles due cards across topics on purpose (interleaving).

## 4. Live drilling and correction (the non-static half)

Static exercises can only test what the author anticipated. Twice per topic, run a live session with an AI tutor following [AGENTS.md](AGENTS.md):

- **Drill:** the tutor generates fresh items, one at a time, mixes in your recent error-log rules, escalates difficulty, and stops after 10 minutes.
- **Correct:** paste your writing; the tutor returns the text with errors marked, the rule for each error, a corrected version, and adds the errors to the error log.
- **Interleaved test:** once a week, 15 mixed items from all topics done so far, exam-style (telc Sprachbausteine format).

**Adaptive lessons.** The lesson files are a starting point, not a script. After every live session the tutor tallies your errors by rule, marks rules as *weak* or *strong* in `PROGRESS.md`, and **rewrites the next three lessons** of the level around them: extra diagnostic items and interleaved exercises for weak rules, compressed explanations and harder items for strong ones. Every change is marked in the file and logged in `review/adaptations.md`. So `Run lesson A2-02 with me` changes what A2-03, A2-04 and A2-05 look like when you open them. This is deliberate: the research on interleaving and error-driven learning says practice should follow *your* error profile, not the author's guess.

## 5. Reading and writing input

Grammar sticks when you meet it in texts. Alongside the topics:

- **Nicos Weg** (DW): do the linked lesson after each topic; it is free and A1/A2-aligned.
- **Graded readers / DW "Langsam gesprochene Nachrichten" texts** from A2 on: read 10 minutes, 3 times a week, and copy out two sentences that use a structure you are studying (comprehensible input).
- From B1 on, every writing task is a telc-format letter: 4 content points, semi-formal, ~150 words, 30 minutes.

## 6. Explanation language: English, with multilingual L1/L2 contrast boxes

What the research says about learning a third language (L3 German) through English explanations and L1/L2 contrasts:

- **Explicit grammar instruction works** and its effect is large and durable (Norris & Ortega 2000; Spada & Tomita 2010). What matters is that the *metalinguistic explanation is understood*, not which language it is written in. For an adult who reads English fluently, English explanations lose nothing.
- **Transfer comes from every language you know, property by property.** Third-language research (Bardel & Falk's "L2 status factor"; Rothman's Typological Primacy Model; Westergaard's Linguistic Proximity Model) shows learners draw on whichever known language is structurally closest for a *given feature*, and that a prior foreign language (such as English) is often over-activated. So:
  - Where **English** is closer to German, English helps: modal verbs, Perfekt with *have*, separable verbs vs phrasal verbs, Germanic core vocabulary, `wenn/if` conditionals.
  - Where a **Romance language (Portuguese, Spanish, French)** is closer, it is the better anchor: grammatical gender and article agreement, adjective agreement, `du/Sie` vs `você/o senhor` / `tú/usted` / `tu/vous`, reflexive verbs, the Konjunktiv II ↔ conditional/past subjunctive mapping, and auxiliary selection (`haben/sein` ↔ French *avoir/être*).
  - Where **all known languages** differ from German, you need the contrast made explicit to avoid negative transfer: four cases, verb-second and verb-final order, noun capitalisation, `nicht/kein`, Te-Ka-Mo-Lo adverb order.
- **Noticing** (Schmidt 1990) is the mechanism: a learner only acquires what they consciously register. Contrastive notes ("in your L1/L2 you would say X; German does Y") are a cheap way to force noticing exactly where prior languages would mislead.

Design decision: explanations in English; contrast boxes for your active languages (**🇧🇷 Portuguese**, **🇪🇸 Spanish**, **🇫🇷 French**, **🇬🇧 English**). Contrast packs are modular and live in `shared/contrasts/` ([shared/contrasts/pt-BR.md](shared/contrasts/pt-BR.md), [shared/contrasts/es.md](shared/contrasts/es.md), [shared/contrasts/fr.md](shared/contrasts/fr.md), [shared/contrasts/en.md](shared/contrasts/en.md), and [shared/contrasts/TEMPLATE.md](shared/contrasts/TEMPLATE.md)) with matching flashcards in `review/cards/contrasts/`, so anyone cloning the repo can pick their preferred combination (`python3 review/review.py lang set es,en`) or plug in a new L1 via `TEMPLATE.md`.

## 7. Exam-specific rules (telc B1)

- The **Sprachbausteine** section tests grammar directly: 10 multiple-choice gaps (connectors, prepositions, verb forms, pronouns) and 10 gaps filled from a bank of 15 words. Lessons B1-11 and B1-22 are built around it, but every topic from A2 on ends with 3 Sprachbausteine-style items.
- **Schreiben** is one letter, 4 content points, 30 minutes, graded on content, organisation, accuracy, and register. From A2-22 on, every writing task uses that format.
- **Lesen** is the biggest block (75 of 225 written points). Reading input (§5) is not optional.

Details and strategy: [shared/exam-telc-b1.md](shared/exam-telc-b1.md).

## References

- Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. *Psychological Bulletin*. (spacing effect)
- Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*. (retrieval practice)
- Rohrer, D. & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*. (interleaving)
- Paivio, A. (1986). *Mental Representations: A Dual Coding Approach*. Mayer, R. E. (2009). *Multimedia Learning*. (dual coding)
- Norris, J. & Ortega, L. (2000). Effectiveness of L2 instruction: a research synthesis and quantitative meta-analysis. *Language Learning*. Spada, N. & Tomita, Y. (2010). Interactions between type of instruction and type of language feature: a meta-analysis. *Language Learning*. (explicit instruction)
- Schmidt, R. (1990). The role of consciousness in second language learning. *Applied Linguistics*. (noticing)
- Bardel, C. & Falk, Y. (2007). The role of the second language in third language acquisition. *Second Language Research*. Rothman, J. (2011). L3 syntactic transfer selectivity and typological determinacy. *Second Language Research*. Westergaard, M. et al. (2017). Crosslinguistic influence in the acquisition of a third language: the Linguistic Proximity Model. *International Journal of Bilingualism*. (L3 transfer)
- Wyner, G. (2014). *Fluent Forever*. (practical SRS for languages)
- Glaboniat, M. et al. (2005). *Profile deutsch*. Langenscheidt. (grammar inventory per CEFR level)

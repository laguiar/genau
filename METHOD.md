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

1. **Diagnostic first (3 min).** Regular lessons start with eight core items. With at least 7/8 correct, mark the topic `✔ known`, add its cards, and move on. Review any extra diagnostic items from an adaptation separately. Consolidation lessons have their own tests and scoring instructions.
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
- For a full B1 writing simulation, allow 30 minutes for an informal or semi-formal e-mail addressing all four content points. Around 150 words is a course practice target.

## 6. Explanation language: English, with multilingual L1/L2 contrast boxes

What the research says about learning a third language (L3 German) through English explanations and L1/L2 contrasts:

- **Explicit grammar instruction works** and its effect is large and durable (Norris & Ortega 2000; Spada & Tomita 2010). What matters is that the *metalinguistic explanation is understood*, not which language it is written in. For an adult who reads English fluently, English explanations lose nothing.
- **Transfer comes from every language you know, property by property.** Third-language research (Bardel & Falk's "L2 status factor"; Rothman's Typological Primacy Model; Westergaard's Linguistic Proximity Model) shows learners draw on whichever known language is structurally closest for a *given feature*, and that a prior foreign language (such as English) is often over-activated. So:
  - Where **English** is closer to German, English helps: modal verbs, Perfekt with *have*, separable verbs vs phrasal verbs, Germanic core vocabulary, `wenn/if` conditionals.
  - Where a **Romance language (Portuguese, Spanish, French)** is closer, it is the better anchor: grammatical gender and article agreement, adjective agreement, `du/Sie` vs `você/o senhor` / `tú/usted` / `tu/vous`, reflexive verbs, the Konjunktiv II ↔ conditional/past subjunctive mapping, and auxiliary selection (`haben/sein` ↔ French *avoir/être*).
  - Where **all known languages** differ from German, you need the contrast made explicit to avoid negative transfer: four cases, verb-second and verb-final order, noun capitalisation, `nicht/kein`, Te-Ka-Mo-Lo adverb order.
- **Noticing** (Schmidt 1990) is the mechanism: a learner only acquires what they consciously register. Contrastive notes ("in your L1/L2 you would say X; German does Y") are a cheap way to force noticing exactly where prior languages would mislead.

Design decision: explanations in English; contrast boxes for your active languages (**🇧🇷 Portuguese**, **🇪🇸 Spanish**, **🇫🇷 French**, **🇬🇧 English**). Contrast packs are modular and live in `shared/contrasts/` ([shared/contrasts/pt-BR.md](shared/contrasts/pt-BR.md), [shared/contrasts/es.md](shared/contrasts/es.md), [shared/contrasts/fr.md](shared/contrasts/fr.md), [shared/contrasts/en.md](shared/contrasts/en.md), and [shared/contrasts/TEMPLATE.md](shared/contrasts/TEMPLATE.md)) with matching flashcards in `review/cards/contrasts/`, so anyone cloning the repo can pick their preferred combination (`python3 review/review.py lang set es,en`) or plug in a new L1 via `TEMPLATE.md`.

## 7. Grammatical gender: why adults struggle, and how Genau handles it

German's three-gender system (`der / die / das`) is one of the highest-friction bottlenecks for adult learners, and unstable noun gender cascades directly into Akkusativ, Dativ, adjective-ending, and relative-pronoun errors in telc B1 writing and *Sprachbausteine*. Modern neurolinguistics, psycholinguistics, and SLA research clarify why rote lists fail and what replaces them:

- **Blocking and granularity ("start big"):** Under associative learning models (Rescorla–Wagner), presenting a bare noun first (`Tisch = table`) makes the noun stem a 100 %-predictive cue for meaning and **blocks** the preceding article (`der`) from binding to it (Arnon & Ramscar 2012). Children acquire gender smoothly because they first store unsegmented multi-word chunks (*dertisch*). Genau therefore treats every noun as an indivisible prosodic chunk (`der Tisch, -e`) and fades bare `(m)/(n)/(f)` tags in favour of Nominativ chunks or unassisted retrieval.
- **Lexical stability gates real-time processing:** Eye-tracking studies in the visual-world paradigm show native speakers use gender markers *predictively* before the noun finishes, whereas intermediate adults process reactively (Grüter, Lew-Williams & Fernald 2012; Hopp 2013). Crucially, Hopp (2016) demonstrated that once adult learners stabilize the lexical gender of core nouns, online predictive processing and syntactic agreement emerge.
- **Declarative rules vs. procedural agreement:** Under Ullman's Declarative/Procedural model and ERP training studies (Morgan-Short et al. 2010, 2012), explicit rule tables live in slow temporal-lobe declarative memory (N400-like signatures), while rapid online agreement relies on frontal/basal-ganglia procedural circuits (P600/LAN). Explicit rules bootstrap adult accuracy, but proceduralization requires practising gender **inside live agreement frames** (`einen neuen Termin → Ich verschiebe ihn`) rather than isolated `___ + noun` guessing.
- **Probabilistic cues and gender–plural coupling:** German gender is far less arbitrary than it looks — roughly 80 % of nouns follow hierarchical morphological, phonological, and semantic regularities, and native speakers store **gender and plural as coupled schemas** (Köpcke & Zubin 1984, 1996, 2009; Köpcke 1998). [shared/gender.md](shared/gender.md) packages this as a **4-step triage algorithm** and a bidirectional gender ↔ plural table linking A1-05 and A1-06.
- **Cross-linguistic Gender Congruency Effect (GCE):** For learners who already speak a gendered language (Portuguese, Spanish, French), L1 gender is automatically co-activated during German retrieval (Lemhöfer, Spalek & Schriefers 2008; Bordag & Pechmann 2007). Incongruent translation equivalents (*o sol / el sol / le soleil* → **die** Sonne; *a mesa / la mesa / la table* → **der** Tisch) cause measurable neural conflict — which is why each Romance contrast pack flags its top L1 gender-clash traps explicitly and turns them into agreement cards.
- **Interactive imagery & embodied anchoring for the ~20 % rule-breakers:** Dual-coding studies specifically testing French learners of German gender (Paivio 1986; Desrochers, Wieland & Coté 1991) found that abstract gender tags fail unless recoded into **vivid, interactive sensory imagery** (e.g., 3 fixed actions or 3 familiar rooms), and fMRI research shows meaningful sensorimotor encoding recruits premotor memory networks (Macedonia, Müller & Friederici 2011). Genau reserves this optional 3-Anchor toolkit ([shared/gender.md](shared/gender.md)) strictly for high-frequency exceptions and repeat error-log items.
- **Why Genau avoids permanent color-coding on prompts:** Color-coding (`der` = blue, `die` = red, `das` = green) increases initial noticing against semantic overshadowing (Ellis 2006), **but permanent color on study prompts causes secondary overshadowing**: learners bind gender to the color instead of the word, and accuracy drops on uncolored exam sheets (plus it visually collides with Genau's `● ▲ ■ ◆` case colors). Instead, Genau keeps question prompts uncolored and reinforces a **consistent left–middle–right spatial slot (`m · n · f`)** across paradigm tables ([shared/cases.md](shared/cases.md)) and on flashcard answer reveals.

## 8. Exam-specific rules (telc B1)

- The **Sprachbausteine** section tests grammar directly: 10 multiple-choice gaps (connectors, prepositions, verb forms, pronouns) and 10 gaps filled from a bank of 15 words. Lessons B1-11 and B1-22 are built around it, but every topic from A2 on ends with 3 Sprachbausteine-style items.
- **Schreiben** is one e-mail with four content points in 30 minutes. telc scores task fulfilment, communicative design (including organisation and register), and formal accuracy. The course introduces this format at A2-22.
- **Lesen** is the biggest block (75 of 225 written points). Reading input (§5) is not optional.

Details and strategy: [shared/exam-telc-b1.md](shared/exam-telc-b1.md).

## References

- Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. *Psychological Bulletin*. (spacing effect)
- Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*. (retrieval practice)
- Rohrer, D. & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*. (interleaving)
- Paivio, A. (1986). *Mental Representations: A Dual Coding Approach*. Mayer, R. E. (2009). *Multimedia Learning*. (dual coding)
- Desrochers, A., Wieland, L. D. & Coté, M. (1991). Instructional effects in the use of the mnemonic keyword method for learning German nouns and their grammatical gender. *Applied Cognitive Psychology*. (interactive imagery for German gender)
- Norris, J. & Ortega, L. (2000). Effectiveness of L2 instruction: a research synthesis and quantitative meta-analysis. *Language Learning*. Spada, N. & Tomita, Y. (2010). Interactions between type of instruction and type of language feature: a meta-analysis. *Language Learning*. (explicit instruction)
- Schmidt, R. (1990). The role of consciousness in second language learning. *Applied Linguistics*. (noticing)
- Ellis, N. C. (2006). Selective attention and transfer phenomena in L2 acquisition: contingency, cue competition, salience, interference, overshadowing, blocking, and perceptual learning. *Applied Linguistics*. (cue competition & overshadowing)
- Arnon, I. & Ramscar, M. (2012). Granularity and the acquisition of grammatical gender: how order-of-acquisition affects what gets learned. *Cognition*. (blocking & article–noun chunking)
- Köpcke, K.-M. & Zubin, D. A. (1984). Sechs Prinzipien für die Genuszuweisung im Deutschen: ein Beitrag zur natürlichen Klassifikation. *Linguistische Berichte*. Köpcke, K.-M. (1998). The acquisition of plural marking in English and German revisited: schemata versus rules. *Journal of Child Language*. Köpcke, K.-M. & Zubin, D. A. (2009). Genus. In *Handbuch der deutschen Wortarten*. (probabilistic gender cues & plural schemas)
- Grüter, T., Lew-Williams, C. & Fernald, A. (2012). Grammatical gender in L2: a production or a real-time processing problem? *Second Language Research*. Hopp, H. (2013). Grammatical gender in adult L2 acquisition: relations between lexical and syntactic variability. *Second Language Research*. Hopp, H. (2016). Learning (not) to predict: grammatical gender processing in second language acquisition. *Second Language Research*. (lexical stability & predictive processing)
- Ullman, M. T. (2004, 2020). The declarative/procedural model: a neurobiologically motivated theory of first and second language. Morgan-Short, K., Sanz, C., Steinhauer, K. & Ullman, M. T. (2010). Second language acquisition of gender agreement in explicit and implicit training conditions: an event-related potential study. *Language Learning*. Morgan-Short, K. et al. (2012). Explicit and implicit second language training differentially affect the achievement of native-like brain activation patterns. *Journal of Cognitive Neuroscience*. (declarative vs. procedural gender agreement)
- Lemhöfer, K., Spalek, K. & Schriefers, H. (2008). Cross-language effects of grammatical gender in bilingual word recognition and production. *Journal of Memory and Language*. Bordag, D. & Pechmann, T. (2007). Factors influencing L2 gender processing. *Bilingualism: Language and Cognition*. (L1–L2 gender congruency & interference)
- Macedonia, M., Müller, K. & Friederici, A. D. (2011). The impact of iconic gestures on foreign language word learning and its neural substrate. *Human Brain Mapping*. (embodied sensorimotor traces)
- Bardel, C. & Falk, Y. (2007). The role of the second language in third language acquisition. *Second Language Research*. Rothman, J. (2011). L3 syntactic transfer selectivity and typological determinacy. *Second Language Research*. Westergaard, M. et al. (2017). Crosslinguistic influence in the acquisition of a third language: the Linguistic Proximity Model. *International Journal of Bilingualism*. (L3 transfer)
- Wyner, G. (2014). *Fluent Forever*. (practical SRS & imagery mnemonics for languages)
- Glaboniat, M. et al. (2005). *Profile deutsch*. Langenscheidt. (grammar inventory per CEFR level)

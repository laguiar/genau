# Noun Gender — Triage, Schemas, and Core Exam Chunks

German nouns belong to one of three grammatical genders: **masculine (`der`) · neuter (`das`) · feminine (`die`)**.
Throughout Genau, every paradigm table keeps the same left-to-right spatial order — **m · n · f · pl** ([cases.md](cases.md)) — so you map each gender to a fixed visual slot rather than a loose label.

Unstable noun gender is the single biggest upstream cause of case, adjective-ending, and pronoun errors in telc B1 *Sprachbausteine* and *Schreiben*. The methods below apply neurolinguistic and psycholinguistic findings (documented in [METHOD.md](../METHOD.md)) to make gender automatic without turning a grammar course into rote vocabulary lists.

---

## 0. Four rules from how the brain stores gender

1. **Never encode a bare noun.** Learning `Tisch = table` first lets the noun stem *block* the preceding article from bonding with it (Arnon & Ramscar 2012). Always read, say, and write the article + noun as **one stress unit** with no pause: *derTisch, dieArbeit, dasProblem*.
2. **Train gender inside live agreement, not isolated lists.** Explicit rules live in slow declarative memory; fluent agreement (`einen neuen Termin`, `Ich verschiebe ihn`) requires proceduralizing gender inside real case, adjective, and pronoun frames (Ullman; Morgan-Short et al. 2010; Hopp 2016).
3. **Run the 4-step triage before memorizing.** Roughly 80 % of German nouns follow structural or plural cues (Köpcke & Zubin 1984, 2009). Save memory tricks for the ~20 % of high-frequency rule-breakers and L1 gender clashes.
4. **Do not lean on permanent color-coding.** Painting text blue/red/green helps initial noticing, but if color stays on prompts, the brain binds gender to the color rather than the word (*secondary overshadowing*) and accuracy drops on uncolored exam sheets. Use spatial position (`m · n · f`) and fading cues instead.

---

## 1. The 4-Step Gender Triage Algorithm

Run new nouns through these four checks in order. Stop at the first step that resolves the gender.

```
 STEP 1 · COMPOUND NOUN? (100 % reliable)
   Read from RIGHT to LEFT. The LAST word fixes gender + plural:
   das Zimmer + der Schlüssel  →  DER Zimmerschlüssel (pl. -)
   die Kinder + das Buch       →  DAS Kinderbuch (pl. ¨-er)
   der Vertrag + die Kündigung →  DIE Vertragskündigung (pl. -en)

 STEP 2 · DETERMINISTIC SUFFIX OR NOMINALISATION? (~95–100 % reliable)
   m (der)   -ismus · -ling · -ig · -or · -ant · -ist · -er (agent/tool: der Lehrer, der Drucker)
   n (das)   -chen · -lein · -ment · -um · -ma (Greek: das Thema) · verb-as-noun (das Lesen, beim Kochen)
   f (die)   -ung · -heit · -keit · -schaft · -ion · -tät · -ik · -ur · -ei · -in · -ie · -enz · -anz · -age

 STEP 3 · PROBABILISTIC PHONOLOGICAL, SEMANTIC & PLURAL CUES (~80–90 % reliable)
   m (der)   days · months · seasons · weather (Regen, Wind, Schnee) · directions · alcohols (exc. das Bier)
             + monosyllables with heavy consonant clusters (der Knopf, der Brief, der Strand, der Preis)
   n (das)   Ge-…(e) collectives (das Gebäude, das Gespräch, das Gesetz) · young beings (Kind, Baby)
             + colours/letters as nouns · metals · most cities/countries · foreign words in -o (das Büro, das Auto)
   f (die)   nouns ending in -e (~90 %: die Lampe, die Straße, die Frage, die Woche)
             + numbers as nouns (die Eins) · plural in -(e)n strongly reinforces die

 STEP 4 · HIGH-FREQUENCY RULE-BREAKER OR L1 GENDER CLASH? (~20 %)
   Do NOT re-read a flat list. Bind it as:
     (a) prosodic chunk + plural:   der Termin, -e
     (b) live agreement phrase:     einen wichtigen Termin vereinbaren · Ich verschiebe ihn.
     (c) optional 3-Anchor image    (section 3 below — only if missed twice!)
```

---

## 2. The Bidirectional Gender ↔ Plural Schema

Native speakers do not store gender and plural as two separate facts — they form **coupled schemas** (Köpcke 1998). Knowing the plural narrows down the singular gender just as much as gender predicts the plural ([A1-06](../A1/A1-06-plural.md)):

| Plural pattern | Strongest gender link | Reverse clue (plural → singular) | Common exceptions to watch |
|----------------|----------------------|----------------------------------|----------------------------|
| **`-(e)n`** | **~90 % `die`** (feminine) | *Zeitungen, Fragen, Arbeiten, Firmen* → expect **`die`** | weak masculines (`der Junge → Jungen, der Kunde → Kunden, der Name → Namen`), `das Auge → Augen`, `das Bett → Betten` |
| **`¨-er` / `-er`** | **mostly `das`** (neuter one-syllable) | *Häuser, Bücher, Kinder, Länder, Bilder, Gläser* → expect **`das`** | a few masculines (`der Mann → Männer, der Wald → Wälder, der Fehler` is `-`) |
| **`–` (or `¨`) on `-el / -en / -er / -chen / -lein`** | **never `die`** (only `der` or `das`) | *Lehrer, Schlüssel, Äpfel, Zimmer, Fenster, Mädchen* → **`der` or `das`** (`-chen/-lein` = always `das`) | only two common feminines: *die Mutter → Mütter*, *die Tochter → Töchter* |
| **`-e` (often with `¨`)** | **mostly `der`**, plus many `das` | *Tische, Stühle, Termine, Verträge, Preise, Züge* → expect **`der`** (or neuter *Jahre, Angebote, Probleme*) | small feminine `¨-e` group (*die Hand → Hände, die Stadt → Städte, die Nacht → Nächte, die Wand → Wände*) |
| **`-s`** | **loanwords / vowel-final** | *Autos, Büros, Hotels, Handys, Fotos* → often **`das`** (also `der Park → Parks`, `die E-Mail → E-Mails`) | check the singular chunk |

---

## 3. The 3-Anchor Imagery Toolkit (Only for Rule-Breakers)

Empirical dual-coding studies (Paivio 1986; Desrochers, Wieland & Coté 1991) show that abstract labels (`m / n / f`) rarely stick for arbitrary nouns — **interactive sensory imagery** does. Use this **only** for core nouns that fail Steps 1–3 or appear twice in `review/error-log.md` (typically 30–60 words total).

Pick **one** of the two systems below and keep it fixed forever:

| Gender (fixed slot) | Option A · 3 Physical Actions (Wyner / Desrochers) | Option B · 3 Fixed Rooms (Method of Loci) |
|---------------------|----------------------------------------------------|-------------------------------------------|
| **Left · `der` (m)** | **Burning / exploding / heavy metal** — *der Tisch* bursts into flames; *der Mond* crashes like an iron anvil | **Familiar place 1** (e.g., your kitchen or office) — place every tricky `der`-noun inside it |
| **Middle · `das` (n)** | **Shattering into glass / shrinking like a toy** — *das Problem* shatters into glass shards; *das Angebot* folds into a tiny origami boat | **Familiar place 2** (e.g., your bedroom or a café) — place every tricky `das`-noun inside it |
| **Right · `die` (f)** | **Freezing into ice / melting into water** — *die Sonne* freezes into an ice cube; *die Arbeit* melts into a puddle | **Familiar place 3** (e.g., a park or bathroom) — place every tricky `die`-noun inside it |

**Rule that makes it work:** The action or room must *physically interact* with the noun's meaning (an exploding table, a frozen sun), not float passively next to it. Once the chunk (`der Tisch, die Sonne`) feels automatic in sentences, the image fades naturally.

---

## 4. High-Yield Core ~60 telc A1–B1 Gender-Tricky Noun Bank

These ~60 nouns appear constantly in telc B1 *Lesen*, *Sprachbausteine*, and *Schreiben*, yet either lack an obvious suffix or clash with Romance L1 genders (Portuguese, Spanish, French). Practise them **only as fused chunks + live agreement frames**, never as bare words.

### Work, study & appointments

| Chunk + plural | Live agreement frame (`● ▲ ■ ◆` / adjective / pronoun) | Watch / cue |
|----------------|--------------------------------------------------------|-------------|
| **der Termin, -e** | Wir vereinbaren **einen neuen Termin**. Ich verschiebe **ihn**. | m · false friend (not *end*) |
| **der Vertrag, ¨-e** | Ich unterschreibe **den Vertrag** und kündige **ihn** fristgerecht. | m · `-e` + umlaut |
| **der Beruf, -e** | Was machst du von Beruf? Er hat **einen interessanten Beruf**. | m |
| **der Chef, -s** | Ich spreche morgen mit **meinem Chef**. | m · male person |
| **der Kollege, -n** | Ich helfe **dem neuen Kollegen** (■ n-noun!). | m · `-e` exception (n-Dekl.) |
| **der Kurs, -e** | Ich melde mich für **einen Deutschkurs** an. | m |
| **der Fehler, -** | Bitte entschuldigen Sie **diesen Fehler**. | m · zero plural |
| **der Erfolg, -e** | Ich wünsche Ihnen **viel Erfolg** bei der Prüfung. | m |
| **das Angebot, -e** | Vielen Dank für **Ihr gutes Angebot**. Ich nehme **es** an. | n · prefix `An-` + root |
| **das Gehalt, ¨-er** | Sie bekommt **ein faires Gehalt**. | n · `Ge-` + `¨-er` plural |
| **das Gespräch, -e** | Vielen Dank für **das freundliche Gespräch**. | n · `Ge-` |
| **das Praktikum, Praktika** | Er macht **ein dreimonatiges Praktikum**. | n · `-um` |
| **das Studium, Studien** | Nach **dem Studium** sucht sie eine Stelle. | n · `-um` |
| **die Arbeit, -en** | Nach **der Arbeit** bin ich müde. (PT/ES/FR clash: *o trabalho / el trabajo / le travail*!) | f · `-en` plural |
| **die Pause, -n** | In **der Pause** trinken wir Kaffee. | f · `-e` + `-n` |
| **die Stelle, -n** | Ich bewerbe mich um **die offene Stelle**. | f · `-e` + `-n` |

### Housing, flat & daily life

| Chunk + plural | Live agreement frame (`● ▲ ■ ◆` / adjective / pronoun) | Watch / cue |
|----------------|--------------------------------------------------------|-------------|
| **der Tisch, -e** | Ich stelle die Lampe auf **den großen Tisch**. (PT/ES/FR clash: *a mesa / la mesa / la table*!) | m |
| **der Stuhl, ¨-e** | Nimm dir **einen Stuhl**! | m · `¨-e` plural |
| **der Schlüssel, -** | Wo ist **mein Schlüssel**? Hast du **ihn** gesehen? | m · zero plural |
| **der Stock, Stockwerke** | Wir wohnen im **dritten Stock**. | m |
| **der Aufzug, ¨-e** | **Der Aufzug** ist seit gestern kaputt. | m |
| **der Nachbar, -n** | Ich spreche mit **meinem netten Nachbarn** (■ n-noun!). | m · n-Dekl. |
| **das Zimmer, -** | Wir suchen **ein ruhiges Zimmer**. | n · `-er` exception! |
| **das Fenster, -** | Mach bitte **das Fenster** zu! | n · `-er` exception! |
| **das Haus, ¨-er** | Wir wohnen in **einem alten Haus**. (PT/ES/FR clash: *a casa / la casa / la maison*!) | n · `¨-er` plural |
| **das Bett, -en** | Das Kind liegt schon im **Bett**. (PT/ES clash: *a cama / la cama*!) | n |
| **das Bad, ¨-er** | **Das Bad** hat kein Fenster. | n · `¨-er` plural |
| **das Gerät, -e** | **Das neue Gerät** funktioniert nicht. | n · `Ge-` |
| **die Tür, -en** | Bitte schließen Sie **die Tür**! | f · `-en` plural |
| **die Miete, -n** | **Die monatliche Miete** ist hoch. | f · `-e` + `-n` |
| **die Heizung, -en** | Seit Montag funktioniert **die Heizung** nicht. | f · `-ung` (100 %) |

### Travel, transport & city

| Chunk + plural | Live agreement frame (`● ▲ ■ ◆` / adjective / pronoun) | Watch / cue |
|----------------|--------------------------------------------------------|-------------|
| **der Bahnhof, ¨-e** | Wir treffen uns vor **dem Bahnhof**. | m · compound (`der Hof`) |
| **der Zug, ¨-e** | Ich nehme **den nächsten Zug** nach Bonn. | m · `¨-e` plural |
| **der Weg, -e** | Können Sie mir **den Weg** erklären? | m |
| **der Platz, ¨-e** | Ich möchte **einen ruhigen Platz** reservieren. | m · `¨-e` plural |
| **der Urlaub, -e** | Wir planen **einen kurzen Urlaub** im Mai. | m |
| **der Ausflug, ¨-e** | Am Sonntag machen wir **einen schönen Ausflug**. | m · `¨-e` plural |
| **das Auto, -s** | Ich fahre mit **meinem neuen Auto**. (PT/ES clash: *o carro / el coche*!) | n · `-o` |
| **das Fahrrad, ¨-er** | Sie fährt mit **dem Fahrrad** zur Arbeit. | n · `¨-er` plural |
| **das Ticket, -s** | Ich habe **ein günstiges Ticket** gebucht. | n · loanword |
| **das Gleis, -e** | Der Zug fährt von **Gleis sieben** ab. | n |
| **die Stadt, ¨-e** | Ich wohne gern in **dieser großen Stadt**. | f · `¨-e` exception |
| **die Reise, -n** | Wir wünschen Ihnen **eine gute Reise**. | f · `-e` + `-n` |
| **die Bahn, -en** | Ich fahre jeden Tag mit **der Bahn**. | f · `-en` plural |
| **die Brücke, -n** | Wir gehen über **die alte Brücke**. (ES/FR clash: *el puente / le pont*!) | f · `-e` + `-n` |

### Communication, problems & bureaucracy

| Chunk + plural | Live agreement frame (`● ▲ ■ ◆` / adjective / pronoun) | Watch / cue |
|----------------|--------------------------------------------------------|-------------|
| **der Brief, -e** | Ich habe **Ihren Brief** gestern erhalten. (PT/ES/FR clash: *a carta / la lettre*!) | m |
| **der Grund, ¨-e** | Aus **diesem Grund** kann ich leider nicht kommen. | m · `¨-e` plural |
| **der Wunsch, ¨-e** | Ich habe noch **einen kleinen Wunsch**. | m · `¨-e` plural |
| **der Rat** (no pl.) | Vielen Dank für **deinen guten Rat**. | m |
| **der Name, -n** | Wie ist **Ihr Name**? Ich habe **den Namen** vergessen (n-noun!). | m · `-e` exception (n-Dekl.) |
| **das Problem, -e** | Wir haben **ein kleines Problem**. (PT/ES/FR clash: *o/el/le problème*!) | n |
| **das Thema, Themen** | Ich halte einen Vortrag über **ein spannendes Thema**. | n · Greek `-ma` |
| **das Formular, -e** | Bitte füllen Sie **dieses Formular** aus. | n |
| **das Paket, -e** | Ich hole **ein wichtiges Paket** bei der Post ab. | n |
| **die Nachricht, -en** | Vielen Dank für **Ihre schnelle Nachricht**. | f · `-en` plural |
| **die Antwort, -en** | Ich warte noch auf **eine schriftliche Antwort**. | f · `-en` plural |
| **die Frage, -n** | Ich habe noch **eine kurze Frage**. | f · `-e` + `-n` |
| **die Hilfe** (no pl.) | Vielen Dank für **Ihre freundliche Hilfe**. | f · `-e` |

### Time, money, weather & everyday essentials

| Chunk + plural | Live agreement frame (`● ▲ ■ ◆` / adjective / pronoun) | Watch / cue |
|----------------|--------------------------------------------------------|-------------|
| **der Preis, -e** | **Der hohe Preis** hat mich überrascht. | m |
| **der Mond, -e** | Heute Nacht sieht man **den vollen Mond**. (PT/ES/FR clash: *a lua / la luna / la lune*!) | m |
| **das Geld** (no pl.) | Ich habe leider **kein Geld** dabei. | n |
| **das Jahr, -e** | Vor **einem Jahr** bin ich nach Köln gezogen. | n |
| **das Wetter** (no pl.) | Bei **schlechtem Wetter** bleiben wir zu Hause. | n · `-er` exception! |
| **das Wasser** (no pl.) | Ich trinke gern **kaltes Wasser**. | n · `-er` exception! |
| **das Buch, ¨-er** | Ich lese **ein interessantes Buch**. (PT/ES/FR clash: *o livro / el libro / le livre*!) | n · `¨-er` plural |
| **die Zeit, -en** | Ich habe heute leider **keine Zeit**. (PT/ES/FR clash: *o tempo / el tiempo / le temps*!) | f |
| **die Sonne, -n** | Heute scheint **die warme Sonne**. (PT/ES/FR clash: *o sol / el sol / le soleil*!) | f · `-e` |
| **die Nacht, ¨-e** | In **der letzten Nacht** habe ich schlecht geschlafen. | f · `¨-e` exception |
| **die Milch** (no pl.) | Ich trinke Kaffee mit **warmer Milch**. (PT/ES/FR clash: *o leite / la leche / le lait*!) | f |
| **die Butter** (no pl.) | Kannst du bitte **die Butter** kaufen? | f · `-er` exception! |

> **How to use this page in 2 minutes a day:** Never read it top-to-bottom like a dictionary. Cover the left column, look only at the **Live agreement frame** (or ask your AI tutor to drill 5 items from one table in ▲/■ and with pronouns), and say the whole phrase aloud as one rhythm.

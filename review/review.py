#!/usr/bin/env python3
"""Genau — minimal spaced-repetition scheduler and language-pack manager over Markdown files.
Standard library only.

State lives in review/schedule.md (a Markdown table). Core cards live in review/cards/*.md
and language-specific contrast cards live in review/cards/contrasts/<lang>.md as blocks:

    ### A1-05-01
    Q: question
    A: answer
    T: optional tags

Commands:
  add <topic>                  queue core + active-language contrast cards for a topic (e.g. A1-05)
  due [--limit N]              list cards due today, interleaved
  quiz [--limit N]             interactive quiz session (saves on q or Ctrl+C)
  grade <id> <0-3>             record a grade (0-3) for a queued card
  stats                        queue size, due today, per-topic accuracy
  add-error <row>              turn error-log row into a card in cards/errors.md and queue it
  lang [list|set <codes>|sync] list language packs, switch active contrast languages, or sync lesson boxes
  check [--fix]                verify PROGRESS.md against queued cards and card definitions
  reset [--lang <codes>] [--yes] reset personal progress, schedule, error log, and optionally switch languages
  export                       write Anki tab-separated export to review/anki-export.tsv
"""
import sys, re, random, datetime, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
SCHEDULE = HERE / "schedule.md"
CARDS_DIR = HERE / "cards"
CONTRAST_CARDS_DIR = CARDS_DIR / "contrasts"
CONTRASTS_DIR = ROOT / "shared" / "contrasts"
ERROR_LOG = HERE / "error-log.md"
ADAPTATIONS = HERE / "adaptations.md"
PROGRESS = ROOT / "PROGRESS.md"
LADDER = [1, 3, 7, 14, 30, 60, 120]
TODAY = datetime.date.today()
DEFAULT_LANGS = ["pt-BR", "es", "fr", "en"]

# ---------- language packs ----------

def active_langs():
    if PROGRESS.exists():
        text = PROGRESS.read_text(encoding="utf-8")
        m = re.search(r"\*\*Contrast languages:\*\*\s*([^\n·]+)", text)
        if m:
            codes = [c.strip().strip("`") for c in m.group(1).split(",") if c.strip()]
            if codes:
                return codes
    return list(DEFAULT_LANGS)

def set_active_langs(codes):
    if not PROGRESS.exists():
        return
    text = PROGRESS.read_text(encoding="utf-8")
    lang_str = ", ".join(codes)
    if "**Contrast languages:**" in text:
        text = re.sub(r"(\*\*Contrast languages:\*\*\s*)([^\n·]+)", rf"\g<1>{lang_str} ", text)
        text = re.sub(r" +\n", "\n", text)
    else:
        text = re.sub(
            r"(\*\*Native language:\*\*\s*[^\n·]+)",
            rf"\1 · **Contrast languages:** {lang_str}",
            text,
        )
    PROGRESS.write_text(text, encoding="utf-8")

def parse_contrast_pack(path):
    text = path.read_text(encoding="utf-8")
    code_m = re.search(r"\*\*Code:\*\*\s*`?([^`\s·]+)`?", text)
    lang_m = re.search(r"\*\*Language:\*\*\s*([^·\n]+)", text)
    flag_m = re.search(r"\*\*Flag:\*\*\s*(\S+)", text)
    label_m = re.search(r"\*\*Label:\*\*\s*([^\n]+)", text)
    code = code_m.group(1).strip() if code_m else path.stem
    language = lang_m.group(1).strip() if lang_m else code
    flag = flag_m.group(1).strip() if flag_m else "🏳️"
    label = label_m.group(1).strip() if label_m else f"{language} contrast"

    notes = {}
    if "## Topic notes" in text:
        sec = text.split("## Topic notes", 1)[1]
        cur_tid = None
        buf = []
        for line in sec.splitlines():
            m = re.match(r"^###\s+([AB][12]-\d{2})\s*$", line.strip())
            if m:
                if cur_tid and buf:
                    notes[cur_tid] = " ".join(buf).strip()
                cur_tid = m.group(1)
                buf = []
            elif cur_tid:
                s = line.strip()
                if s and not s.startswith("<!--"):
                    buf.append(s)
        if cur_tid and buf:
            notes[cur_tid] = " ".join(buf).strip()
    return {"code": code, "language": language, "flag": flag, "label": label, "notes": notes, "path": path}

def load_all_packs():
    packs = {}
    if CONTRASTS_DIR.exists():
        for p in sorted(CONTRASTS_DIR.glob("*.md")):
            if p.name.upper() in ("TEMPLATE.MD", "README.MD"):
                continue
            info = parse_contrast_pack(p)
            packs[info["code"]] = info
    return packs

# ---------- cards ----------

def _parse_card_file(f, cards):
    cur = None
    for line in f.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^###\s+(\S+)\s*$", line)
        if m:
            cur = m.group(1)
            cards[cur] = {"id": cur, "Q": "", "A": "", "T": "", "file": f.name}
            continue
        if cur:
            for key in ("Q", "A", "T"):
                if line.startswith(key + ":"):
                    cards[cur][key] = (cards[cur][key] + " " + line[2:].strip()).strip()

def load_cards(langs=None, include_all_contrasts=False):
    cards = {}
    for f in sorted(CARDS_DIR.glob("*.md")):
        _parse_card_file(f, cards)
    if CONTRAST_CARDS_DIR.exists():
        if include_all_contrasts:
            for f in sorted(CONTRAST_CARDS_DIR.glob("*.md")):
                _parse_card_file(f, cards)
        else:
            for code in (langs if langs is not None else active_langs()):
                cf = CONTRAST_CARDS_DIR / f"{code}.md"
                if cf.exists():
                    _parse_card_file(cf, cards)
    return cards

def normalize_topic(raw):
    m = re.search(r"([AB][12]-\d{2}|ERR-\d{3})", raw.upper())
    return m.group(1) if m else raw.strip().upper()

# ---------- schedule ----------

COLS = ["id", "topic", "added", "due", "step", "reviews", "correct", "last_grade", "history"]

def load_schedule():
    rows = {}
    header_lines = []
    if not SCHEDULE.exists():
        return rows, [
            "# Review schedule (managed by review.py — edit by hand only if you know what you are doing)",
            "",
            "| " + " | ".join(COLS) + " |",
            "|" + "|".join("----" for _ in COLS) + "|",
        ]
    lines = SCHEDULE.read_text(encoding="utf-8").splitlines()
    in_table = False
    for line in lines:
        if line.startswith("| id |"):
            in_table = True
            header_lines.append(line)
            continue
        if in_table and re.match(r"^\|\s*-", line):
            header_lines.append(line)
            continue
        if in_table and line.startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= len(COLS):
                r = dict(zip(COLS, cells))
                rows[r["id"]] = r
            continue
        if not in_table:
            header_lines.append(line)
    return rows, header_lines

def save_schedule(rows, header_lines):
    out = list(header_lines)
    for r in sorted(rows.values(), key=lambda r: (r["due"], r["id"])):
        out.append("| " + " | ".join(str(r[c]) for c in COLS) + " |")
    SCHEDULE.write_text("\n".join(out) + "\n", encoding="utf-8")

def topic_of(card_id):
    return "-".join(card_id.split("-")[:2])

# ---------- commands ----------

def cmd_add(raw_topic):
    topic = normalize_topic(raw_topic)
    langs = active_langs()
    cards = load_cards(langs=langs)
    rows, hdr = load_schedule()
    n = 0
    for cid in cards:
        if topic_of(cid) == topic and cid not in rows:
            rows[cid] = {
                "id": cid,
                "topic": topic,
                "added": TODAY.isoformat(),
                "due": TODAY.isoformat(),
                "step": "0",
                "reviews": "0",
                "correct": "0",
                "last_grade": "-",
                "history": "",
            }
            n += 1
    save_schedule(rows, hdr)
    print(f"queued {n} new card(s) for {topic} (languages: {', '.join(langs)}); queue size {len(rows)}")
    if n == 0 and not any(topic_of(c) == topic for c in cards):
        print(f"  (no cards found for {topic} in {CARDS_DIR}/ — write some first)")

def parse_limit(args):
    if not args:
        return None
    if args[0] == "--limit" and len(args) >= 2:
        try:
            val = int(args[1])
            if val > 0:
                return val
        except ValueError:
            pass
        sys.exit("--limit requires a positive integer")
    if len(args) == 1 and args[0].isdigit() and int(args[0]) > 0:
        return int(args[0])
    sys.exit(f"unrecognised arguments: {' '.join(args)}")

def due_rows(rows, limit=None):
    d = [r for r in rows.values() if r["due"] <= TODAY.isoformat()]
    random.shuffle(d)  # interleave topics
    return d[:limit] if limit else d

def parse_grade(raw_grade):
    try:
        g = int(raw_grade)
    except (ValueError, TypeError):
        sys.exit(f"invalid grade {raw_grade!r}: grade must be 0, 1, 2, or 3")
    if g not in (0, 1, 2, 3):
        sys.exit(f"invalid grade {g}: grade must be 0, 1, 2, or 3")
    return g

def apply_grade(r, grade):
    grade = parse_grade(grade)
    step = int(r["step"])
    reviews = int(r["reviews"])
    if grade == 0:
        step = 0
    elif grade == 1:
        step = max(0, step - 1)
    elif grade == 2:
        # On first review of a newly added card (step 0, reviews 0), schedule for LADDER[0] (1 day)
        step = 0 if (reviews == 0 and step == 0) else min(len(LADDER) - 1, step + 1)
    elif grade == 3:
        # On first review of a newly added card, skip 1-day rung to LADDER[1] (3 days)
        step = 1 if (reviews == 0 and step == 0) else min(len(LADDER) - 1, step + 2)
    r["step"] = str(step)
    r["due"] = (TODAY + datetime.timedelta(days=LADDER[step])).isoformat()
    r["reviews"] = str(reviews + 1)
    r["correct"] = str(int(r["correct"]) + (1 if grade >= 2 else 0))
    r["last_grade"] = str(grade)
    r["history"] = (r["history"] + str(grade))[-20:]

def cmd_due(args=()):
    limit = parse_limit(args)
    cards = load_cards(include_all_contrasts=True)
    rows, _ = load_schedule()
    all_due = [r for r in rows.values() if r["due"] <= TODAY.isoformat()]
    if not all_due:
        print("nothing due today ✔")
        return
    d = due_rows(rows, limit=limit)
    suffix = f" (showing {len(d)} of {len(all_due)})" if limit and len(all_due) > len(d) else ""
    print(f"{len(all_due)} card(s) due{suffix}:")
    for r in d:
        q = cards.get(r["id"], {}).get("Q", "(card text missing)")
        print(f"  [{r['id']}] {q}")

def cmd_quiz(args=()):
    limit = parse_limit(args)
    cards = load_cards(include_all_contrasts=True)
    rows, hdr = load_schedule()
    d = due_rows(rows, limit=limit)
    if not d:
        print("nothing due today ✔")
        return
    print(f"{len(d)} card(s) in session. Grade: 0 blank/wrong · 1 wrong but recognised · 2 right with effort · 3 instant · q quit\n")
    done = 0
    try:
        for r in d:
            c = cards.get(r["id"])
            if not c:
                print(f"[{r['id']}] card text missing — skipping")
                continue
            print(f"[{r['id']}] Q: {c['Q']}")
            input("   … press Enter to reveal ")
            print(f"   A: {c['A']}")
            while True:
                g = input("   grade (0-3, q): ").strip()
                if g == "q":
                    save_schedule(rows, hdr)
                    print(f"saved. {done} reviewed.")
                    return
                if g in ("0", "1", "2", "3"):
                    apply_grade(r, int(g))
                    done += 1
                    break
            print()
    except (KeyboardInterrupt, EOFError):
        save_schedule(rows, hdr)
        print(f"\nsaved. {done} reviewed.")
        return
    save_schedule(rows, hdr)
    print(f"done. {done} reviewed.")

def cmd_grade(cid, raw_grade):
    grade = parse_grade(raw_grade)
    rows, hdr = load_schedule()
    if cid not in rows:
        sys.exit(f"{cid} is not in the queue (use: add {topic_of(cid)})")
    apply_grade(rows[cid], grade)
    save_schedule(rows, hdr)
    print(f"{cid}: step {rows[cid]['step']}, due {rows[cid]['due']}")

def cmd_stats():
    rows, _ = load_schedule()
    langs = active_langs()
    cards = load_cards(langs=langs)
    d = [r for r in rows.values() if r["due"] <= TODAY.isoformat()]
    print(f"cards active: {len(cards)} (languages: {', '.join(langs)}) · queued: {len(rows)} · due today: {len(d)}")
    by = {}
    for r in rows.values():
        t = by.setdefault(r["topic"], [0, 0])
        t[0] += int(r["reviews"])
        t[1] += int(r["correct"])
    for t, (rev, cor) in sorted(by.items()):
        acc = f"{100 * cor // rev}%" if rev else "-"
        print(f"  {t}: {rev} reviews, accuracy {acc}")

def cmd_add_error(row_no):
    try:
        row_int = int(row_no)
    except ValueError:
        sys.exit(f"invalid row number: {row_no}")
    lines = ERROR_LOG.read_text(encoding="utf-8").splitlines()
    for idx, line in enumerate(lines):
        if not line.strip().startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 6 and cells[0] == str(row_int):
            _, date, wrong, right, rule, topic = cells[:6]
            cid = f"ERR-{row_int:03d}-01"
            norm_topic = normalize_topic(topic) if topic.strip() else f"ERR-{row_int:03d}"
            existing_cards = load_cards(include_all_contrasts=True)
            p = CARDS_DIR / "errors.md"
            if cid not in existing_cards:
                block = f"\n### {cid}\nQ: Fix it: *{wrong}*  ({rule})\nA: {right}\nT: error {norm_topic}\n"
                p.write_text(p.read_text(encoding="utf-8").rstrip() + "\n" + block, encoding="utf-8")
            rows, hdr = load_schedule()
            already_queued = cid in rows
            if not already_queued:
                rows[cid] = {
                    "id": cid,
                    "topic": norm_topic,
                    "added": TODAY.isoformat(),
                    "due": TODAY.isoformat(),
                    "step": "0",
                    "reviews": "0",
                    "correct": "0",
                    "last_grade": "-",
                    "history": "",
                }
                save_schedule(rows, hdr)
            while len(cells) < 7:
                cells.append("")
            if cells[6] != cid:
                cells[6] = cid
                lines[idx] = "| " + " | ".join(cells) + " |"
                ERROR_LOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
            if already_queued and cid in existing_cards:
                print(f"card {cid} already exists and is queued (topic {norm_topic})")
            else:
                print(f"card {cid} created and queued under topic {norm_topic}")
            return
    sys.exit(f"row {row_no} not found in {ERROR_LOG}")

def cmd_lang_sync(codes=None):
    langs = codes if codes is not None else active_langs()
    packs = load_all_packs()
    missing = [c for c in langs if c not in packs]
    if missing:
        sys.exit(
            f"language pack(s) not found in {CONTRASTS_DIR}/: {', '.join(missing)}\n"
            f"  Copy {CONTRASTS_DIR / 'TEMPLATE.md'} to {CONTRASTS_DIR / (missing[0] + '.md')} "
            f"or ask your AI tutor: \"Add language {missing[0]}\""
        )
    updated_files = 0
    for level in ("A1", "A2", "B1"):
        for f in sorted((ROOT / level).glob(f"{level}-*.md")):
            if "consolidation" in f.name:
                continue
            tid = "-".join(f.name.split("-")[:2])
            box_lines = []
            for code in langs:
                pk = packs[code]
                note = pk["notes"].get(tid)
                if note:
                    box_lines.append(f"> {pk['flag']} **{pk['label']}** — {note}")
            if not box_lines:
                continue
            new_block = "\n".join(box_lines)
            text = f.read_text(encoding="utf-8")
            # Replace existing contrast blockquote at the end of section 2 (right before ## 3.)
            pattern = re.compile(r"(?:\n>[^\n]*\*\*[^\n]*contrast\*\*[^\n]*(?:\n>[^\n]*)*)+\n+(?=## 3\.)", re.M)
            if pattern.search(text):
                new_text = pattern.sub("\n" + new_block + "\n\n", text, count=1)
            else:
                new_text = re.sub(r"\n+(?=## 3\.)", "\n\n" + new_block + "\n\n", text, count=1)
            if new_text != text:
                f.write_text(new_text, encoding="utf-8")
                updated_files += 1
    print(f"synced contrast boxes ({', '.join(langs)}) across 62 lessons ({updated_files} file(s) modified) ✔")

def cmd_lang(args=()):
    packs = load_all_packs()
    cur = active_langs()
    if not args or args[0] == "list":
        print(f"active contrast languages (PROGRESS.md): {', '.join(cur)}")
        print(f"installed language packs in {CONTRASTS_DIR.relative_to(ROOT)}/:")
        for code, pk in sorted(packs.items()):
            cf = CONTRAST_CARDS_DIR / f"{code}.md"
            c_Map = {}
            if cf.exists():
                _parse_card_file(cf, c_Map)
            active_tag = " [ACTIVE]" if code in cur else ""
            print(f"  {pk['flag']} {code:6s} — {pk['language']} ({len(pk['notes'])}/62 topic notes, {len(c_Map)} contrast cards){active_tag}")
        print(f"\nTo switch or add languages: python3 review/review.py lang set <code1,code2> (template: shared/contrasts/TEMPLATE.md)")
        return
    sub = args[0]
    if sub == "sync":
        cmd_lang_sync()
    elif sub == "set" and len(args) >= 2:
        raw = ",".join(args[1:])
        codes = [c.strip() for c in raw.split(",") if c.strip()]
        if not codes:
            sys.exit("specify at least one language code, e.g.: lang set es,en")
        missing = [c for c in codes if c not in packs]
        if missing:
            sys.exit(
                f"language pack(s) not found in {CONTRASTS_DIR}/: {', '.join(missing)}\n"
                f"  Create {CONTRASTS_DIR / (missing[0] + '.md')} from shared/contrasts/TEMPLATE.md first."
            )
        set_active_langs(codes)
        print(f"active contrast languages set to: {', '.join(codes)}")
        cmd_lang_sync(codes)
    else:
        sys.exit("usage: python3 review/review.py lang [list | set <code1,code2> | sync]")

def cmd_check(args=()):
    fix = "--fix" in args
    langs = active_langs()
    cards = load_cards(langs=langs)
    all_cards = load_cards(include_all_contrasts=True)
    rows, hdr = load_schedule()
    queued_topics = {r["topic"] for r in rows.values()} | {topic_of(cid) for cid in rows}
    missing_defs = [cid for cid in rows if cid not in all_cards]

    status_counts = {"☐": 0, "◐": 0, "◑": 0, "●": 0, "✔": 0}
    unqueued_done = []
    if PROGRESS.exists():
        for line in PROGRESS.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\|\s*([AB][12]-\d{2})\s*\|[^|]+\|\s*([☐◐◑●✔])\s*\|", line)
            if m:
                tid, st = m.group(1), m.group(2)
                status_counts[st] = status_counts.get(st, 0) + 1
                topic_cards = [c for c in cards if topic_of(c) == tid]
                if st in ("●", "✔") and topic_cards and tid not in queued_topics:
                    unqueued_done.append(tid)

    total_topics = sum(status_counts.values())
    done_topics = status_counts["●"] + status_counts["✔"]
    print(f"progress: {done_topics}/{total_topics} topics done (● {status_counts['●']}, ✔ {status_counts['✔']}, ◑ {status_counts['◑']}, ◐ {status_counts['◐']}, ☐ {status_counts['☐']})")
    print(f"languages: {', '.join(langs)} · cards active: {len(cards)} · queued: {len(rows)}")

    if missing_defs:
        print(f"warning: {len(missing_defs)} queued card(s) missing from {CARDS_DIR}/: {', '.join(missing_defs)}")
    if unqueued_done:
        if fix:
            for tid in unqueued_done:
                cmd_add(tid)
        else:
            print(f"warning: completed topic(s) without queued cards: {', '.join(unqueued_done)} (run: check --fix)")
    if not missing_defs and not unqueued_done:
        print("all checks passed ✔")

def cmd_reset(args=()):
    lang_codes = None
    i = 0
    while i < len(args):
        if args[i] == "--lang" and i + 1 < len(args):
            lang_codes = [c.strip() for c in args[i + 1].split(",") if c.strip()]
            i += 2
        else:
            i += 1
    if lang_codes:
        packs = load_all_packs()
        missing = [c for c in lang_codes if c not in packs]
        if missing:
            sys.exit(f"language pack(s) not found in {CONTRASTS_DIR}/: {', '.join(missing)}")
    if "--yes" not in args:
        ans = input("Reset PROGRESS.md, schedule.md, error-log.md, adaptations.md, and cards/errors.md? [y/N] ").strip().lower()
        if ans != "y":
            print("aborted.")
            return
    SCHEDULE.write_text(
        "# Review schedule (managed by review.py — edit by hand only if you know what you are doing)\n\n"
        "| id | topic | added | due | step | reviews | correct | last_grade | history |\n"
        "|----|-------|-------|-----|------|---------|---------|------------|---------|\n",
        encoding="utf-8",
    )
    ERROR_LOG.write_text(
        "# Error log\n\n"
        "Every mistake goes here, in the session it happened. The tutor (or you) fills in the rule and the topic. "
        "Rows become cards with `python3 review/review.py add-error <row>`.\n\n"
        "Row numbers are the `#` column. Keep them stable (never renumber).\n\n"
        "| # | Date | What I wrote | Correct | Rule (one line) | Topic | Card? |\n"
        "|---|------|--------------|---------|-----------------|-------|-------|\n",
        encoding="utf-8",
    )
    ADAPTATIONS.write_text(
        "# Adaptation log\n\n"
        "Every live session (lesson, drill, correction, weekly test) ends with an **adaptation pass** "
        "(rule in [AGENTS.md](../AGENTS.md) → \"Adaptation rule\"). This file records what was changed in forthcoming lessons "
        "and why, so changes are traceable and can be reverted. Newest at the bottom.\n\n"
        "Adapted sections inside lesson files carry an HTML comment: `<!-- adapted YYYY-MM-DD from <session-id>: <rule> -->`.\n\n"
        "| # | Date | Session | Observed (rule → evidence) | Lessons changed | What changed |\n"
        "|---|------|---------|----------------------------|-----------------|--------------|\n",
        encoding="utf-8",
    )
    (CARDS_DIR / "errors.md").write_text(
        "# Cards generated from the error log\n\n"
        "(managed by `review.py add-error`; you can also add cards by hand)\n",
        encoding="utf-8",
    )
    if PROGRESS.exists():
        out = []
        section = ""
        for line in PROGRESS.read_text(encoding="utf-8").splitlines():
            if line.startswith("## "):
                section = line[3:].strip()
            m = re.match(r"^(\|\s*[AB][12]-\d{2}\s*\|[^|]+\|)\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*[^|]*\|$", line)
            if m:
                out.append(f"{m.group(1)} ☐ | | | |")
                continue
            if section in ("Weak rules (live)", "Strong rules (skip / compress)", "Mock exams", "Session log"):
                if line.startswith("|") and not line.startswith("| Rule") and not line.startswith("| Date") and not re.match(r"^\|\s*-", line):
                    continue
            out.append(line)
        PROGRESS.write_text("\n".join(out) + "\n", encoding="utf-8")
    if lang_codes:
        set_active_langs(lang_codes)
        cmd_lang_sync(lang_codes)
    print("reset complete ✔")

def cmd_export():
    cards = load_cards()
    out = HERE / "anki-export.tsv"
    with out.open("w", encoding="utf-8") as f:
        for c in cards.values():
            f.write(f"{c['Q']}\t{c['A']}\t{c['id']} {c['T']}\n")
    print(f"wrote {len(cards)} cards to {out}")

def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return
    cmd, args = argv[1], argv[2:]
    if cmd == "add" and args:
        cmd_add(args[0])
    elif cmd == "due":
        cmd_due(args)
    elif cmd == "quiz":
        cmd_quiz(args)
    elif cmd == "grade" and len(args) == 2:
        cmd_grade(args[0], args[1])
    elif cmd == "stats":
        cmd_stats()
    elif cmd == "add-error" and args:
        cmd_add_error(args[0])
    elif cmd == "lang":
        cmd_lang(args)
    elif cmd == "check":
        cmd_check(args)
    elif cmd == "reset":
        cmd_reset(args)
    elif cmd == "export":
        cmd_export()
    else:
        print(__doc__)

if __name__ == "__main__":
    main(sys.argv)

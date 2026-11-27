const RULE_STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "to", "of", "in", "on", "at", "for", "with",
  "or", "and", "by", "from", "as", "it", "this", "that", "which", "what", "how", "after", "before",
  "letter", "word", "sentence", "form", "correct", "write", "choose", "complete", "use", "give",
  "make", "change", "into", "not", "your", "you"
]);

const RULE_LOW = new Set([
  "ich", "du", "er", "sie", "es", "wir", "ihr", "ein", "eine", "einen", "einem", "einer",
  "der", "die", "das", "den", "dem", "des", "ist", "sind", "hat", "haben", "und", "habe", "habt"
]);

export function stripMdInline(text) {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\w*])\*([^*]+)\*(?!\w)/g, "$1$2")
    .trim();
}

export function parseDiagnostic(md) {
  const clean = md.replace(/<!--[\s\S]*?-->/g, "").replaceAll("\r\n", "\n");
  const section = clean.match(/^## 0\. Diagnostic[^\n]*\n([\s\S]*?)(?=^## )/m);
  const keyMatch = clean.match(/^\*\*0\.\*\*\s*([\s\S]*?)\n\s*\n/m);
  if (!section || !keyMatch) return null;
  const items = [...section[1].matchAll(/^\s*(\d+)\.\s+(.+)$/gm)].slice(0, 8).map(m => m[2].trim());
  if (items.length < 8) return null;
  const instruction = section[1]
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !/^\d+\.\s/.test(l))
    .join(" ")
    .replace(/\s*≥\s*7\/8\s*→\s*`?✔`?\.?/g, "")
    .trim();
  const key = keyMatch[1].replace(/\s+/g, " ");
  const marks = [];
  let pos = 0;
  for (let n = 1; n <= items.length; n++) {
    const re = new RegExp(`(?:^|\\s)${n}[.)]?\\s`, "g");
    re.lastIndex = pos;
    const m = re.exec(key);
    if (!m) return null;
    marks.push({ at: m.index, body: m.index + m[0].length });
    pos = m.index + m[0].length;
  }
  const answers = marks.map((mk, idx) =>
    key
      .slice(mk.body, idx + 1 < marks.length ? marks[idx + 1].at : key.length)
      .replace(/\s*[·•|]\s*$/, "")
      .trim()
  );
  return { instruction, items, answers };
}

export function normalizeGuess(text) {
  return stripMdInline(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[“”„"'’‘«»]/g, "")
    .replace(/[–—]/g, "-")
    .replaceAll("…", "...")
    .replace(/\s*(\.{2,}|[.,!?;:])\s*/g, "$1 ")
    .replace(/(?<!\.)[.!?]+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function guessMatches(guess, answer) {
  const g = normalizeGuess(guess);
  if (!g) return false;
  const raw = stripMdInline(answer).trim();
  const noParens = raw.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  const candidates = new Set([raw, noParens]);

  const parenMatch = raw.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();
    if (/^or\s+/i.test(inner)) {
      candidates.add(inner.replace(/^or\s+/i, "").trim());
    } else if (!/^(no|from|trick:|the|a)\b/i.test(inner) && inner.split(/\s+/).length <= 4) {
      candidates.add(inner);
    }
  }

  const colonMatch = noParens.match(/^([^:]+):\s*(.+)$/);
  if (colonMatch) {
    candidates.add(colonMatch[1].trim());
    candidates.add(colonMatch[2].trim());
    candidates.add(`${colonMatch[1].trim()} ${colonMatch[2].trim()}`);
  }

  const yesNoMatch = noParens.match(/^(yes|no|ja|nein)\s*,/i);
  if (yesNoMatch) candidates.add(yesNoMatch[1]);

  for (const part of noParens.split(/\s+\/\s+|\s+·\s+|\s+or\s+/i)) {
    if (part.trim()) candidates.add(part.trim());
  }
  if (/\s+\/\s+/.test(noParens)) {
    candidates.add(noParens.replace(/\s+\/\s+/g, " "));
    candidates.add(noParens.replace(/\s+\/\s+/g, ", "));
  }

  const expanded = new Set();
  for (const c of candidates) {
    const n = normalizeGuess(c);
    if (!n) continue;
    expanded.add(n);
    if (n.includes("...")) {
      expanded.add(n.replace(/\s*\.{3}\s*/g, " ").replace(/\s+/g, " ").trim());
      expanded.add(n.replace(/\s*\.{3}\s*/g, ", ").replace(/\s+/g, " ").trim());
    }
  }
  return expanded.has(g);
}

export function tokenizeRuleText(text) {
  return text
    .toLowerCase()
    .replace(/[“”„"'’‘`*_(){}[\],.!?;:–—/]/g, " ")
    .split(/\s+/)
    .filter(w => (w.length >= 2 && !RULE_STOP.has(w)) || w === "ß");
}

export function matchBestRuleBlock(indexedBlocks, prompt, answer) {
  const qTokens = tokenizeRuleText(stripMdInline(prompt));
  const aTokens = tokenizeRuleText(stripMdInline(answer));
  const query = new Set([...qTokens, ...aTokens]);
  const aSet = new Set(aTokens);
  let best = null;
  let bestScore = 0;

  for (const blk of indexedBlocks) {
    let score = 0;
    for (const tok of query) {
      const isLow = RULE_LOW.has(tok) && !aSet.has(tok);
      const base = isLow ? 0.3 : aSet.has(tok) ? 3 : 2;
      if (blk.tokens.has(tok)) {
        score += base + (!isLow && blk.emph.has(tok) ? 2 : 0);
      } else if (tok.length >= 4 && !isLow) {
        for (const bt of blk.tokens) {
          if (bt.startsWith(tok) || (tok.startsWith(bt) && bt.length >= 4)) {
            score += base * 0.8 + (blk.emph.has(bt) ? 1.5 : 0);
            break;
          }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = blk.el;
    }
  }
  return bestScore >= 4 ? best : null;
}

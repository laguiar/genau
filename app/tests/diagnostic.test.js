import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { ALL_LESSONS } from "../data/course.js";
import { guessMatches, matchBestRuleBlock, normalizeGuess, parseDiagnostic, tokenizeRuleText } from "../lib/diagnostic-model.js";

test("normalizeGuess standardizes unicode, quotes, dashes, and trailing punctuation", () => {
  assert.equal(normalizeGuess("  „Ich gehe!“ "), "ich gehe");
  assert.equal(normalizeGuess("sowohl – als… auch!"), "sowohl - als... auch");
});

test("guessMatches handles variants, parenthetical notes, slashes, and ellipses", () => {
  assert.equal(guessMatches("den Mann", "**den Mann** (Akkusativ)"), true);
  assert.equal(guessMatches("weil ich müde bin", "weil ich müde bin / da ich müde bin"), true);
  assert.equal(guessMatches("da ich müde bin", "weil ich müde bin / da ich müde bin"), true);
  assert.equal(guessMatches("sowohl als auch", "sowohl … als auch"), true);
  assert.equal(guessMatches("yes", "Yes, because it moves"), true);
  assert.equal(guessMatches("der Mann", "den Mann"), false);
  assert.equal(guessMatches("   ", "den Mann"), false);
});

test("parseDiagnostic extracts 8 items and 8 answers from regular course lessons", () => {
  const regular = ALL_LESSONS.filter(l => !l.path.includes("consolidation"));
  assert.ok(regular.length >= 60);
  for (const lesson of regular) {
    const md = readFileSync(resolve(import.meta.dirname, "../..", lesson.path), "utf8");
    const dx = parseDiagnostic(md);
    assert.ok(dx, `Expected diagnostic in ${lesson.id}`);
    assert.equal(dx.items.length, 8, `Expected 8 items in ${lesson.id}`);
    assert.equal(dx.answers.length, 8, `Expected 8 answers in ${lesson.id}`);
    assert.ok(dx.answers.every(a => a.length > 0), `Empty answer in ${lesson.id}`);
  }
});

test("matchBestRuleBlock selects the most relevant explanation block", () => {
  const blocks = [
    { id: "a", text: "Subordinate clauses with weil send the conjugated verb to the end.", emph: ["weil", "verb", "end"] },
    { id: "b", text: "Plural nouns often add -e or -en with an umlaut.", emph: ["plural", "umlaut"] }
  ].map(b => ({
    el: b.id,
    tokens: new Set(tokenizeRuleText(b.text)),
    emph: new Set(b.emph)
  }));

  assert.equal(matchBestRuleBlock(blocks, "Combine with weil", "weil ich keine Zeit habe"), "a");
  assert.equal(matchBestRuleBlock(blocks, "Unrelated xyz", "qqq"), null);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  buildDueQueue,
  buildPracticeQueue,
  CARD_FILES,
  computeNextScheduleRow,
  getDueCount,
  isScheduleRow,
  parseCardsMd
} from "../lib/flashcards-model.js";

test("parseCardsMd parses all shipped flashcard decks cleanly", () => {
  let total = 0;
  for (const [relPath, lang] of CARD_FILES) {
    const raw = readFileSync(resolve(import.meta.dirname, "../..", relPath), "utf8");
    const cards = parseCardsMd(raw, lang);
    assert.ok(cards.length > 0, `Expected cards in ${relPath}`);
    for (const card of cards) {
      assert.ok(card.id.startsWith(`${card.topic}-`), `Invalid id ${card.id}`);
      assert.ok(card.Q.length > 0, `Missing Q on ${card.id}`);
      assert.ok(card.A.length > 0, `Missing A on ${card.id}`);
      assert.equal(card.lang, lang);
    }
    total += cards.length;
  }
  assert.ok(total >= 500, `Expected >= 500 cards, got ${total}`);
});

test("computeNextScheduleRow advances and resets intervals without mutating input", () => {
  const now = new Date(2026, 10, 27, 10, 0, 0);
  const fresh = { id: "A1-01-01", topic: "A1-01", due: "2026-11-27", step: 0, reviews: 0, correct: 0 };

  const goodFirst = computeNextScheduleRow(fresh, 2, now);
  assert.equal(fresh.reviews, 0);
  assert.equal(goodFirst.step, 0);
  assert.equal(goodFirst.due, "2026-11-28");
  assert.equal(goodFirst.reviews, 1);
  assert.equal(goodFirst.correct, 1);

  const goodSecond = computeNextScheduleRow(goodFirst, 2, now);
  assert.equal(goodSecond.step, 1);
  assert.equal(goodSecond.due, "2026-11-30");

  const easy = computeNextScheduleRow(goodSecond, 3, now);
  assert.equal(easy.step, 3);
  assert.equal(easy.due, "2026-12-11");

  const hard = computeNextScheduleRow(easy, 1, now);
  assert.equal(hard.step, 2);
  assert.equal(hard.correct, easy.correct);

  const forgot = computeNextScheduleRow(easy, 0, now);
  assert.equal(forgot.step, 0);
  assert.equal(forgot.due, "2026-11-28");
});

test("isScheduleRow validates well-formed rows and rejects corrupted entries", () => {
  const valid = { id: "A2-04-01", topic: "A2-04", due: "2026-11-27", step: 2, reviews: 3, correct: 2 };
  assert.equal(isScheduleRow("A2-04-01", valid), true);
  assert.equal(isScheduleRow("A2-04-01", { ...valid, correct: 4 }), false);
  assert.equal(isScheduleRow("A2-04-01", { ...valid, due: "2026-02-30" }), false);
  assert.equal(isScheduleRow("A2-04-01", { ...valid, topic: "A1-01" }), false);
});

test("buildDueQueue and buildPracticeQueue filter by due date and active languages", () => {
  const now = new Date(2026, 10, 27);
  const cards = [
    { id: "A1-01-01", topic: "A1-01", lang: null },
    { id: "A1-01-es-01", topic: "A1-01", lang: "es" },
    { id: "A1-01-fr-01", topic: "A1-01", lang: "fr" }
  ];
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));
  const schedule = {
    "A1-01-01": { id: "A1-01-01", topic: "A1-01", due: "2026-11-27", step: 0, reviews: 0, correct: 0 },
    "A1-01-es-01": { id: "A1-01-es-01", topic: "A1-01", due: "2026-11-28", step: 0, reviews: 0, correct: 0 }
  };

  assert.equal(getDueCount(schedule, now), 1);
  assert.deepEqual(
    buildDueQueue(schedule, cardMap, { now, random: () => 0 }).map(c => c.id),
    ["A1-01-01"]
  );
  assert.deepEqual(
    buildPracticeQueue(cards, "A1-01", ["es"]).map(c => c.id),
    ["A1-01-01", "A1-01-es-01"]
  );
});

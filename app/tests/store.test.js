import assert from "node:assert/strict";
import test from "node:test";
import { addDaysISO, isValidISODate, todayISO } from "../lib/dates.js";
import {
  createDefaultState,
  detectLangs,
  logActivityOn,
  normalizeState,
  resumeLesson,
  studyStreak
} from "../store.js";

test("dates helpers compute local ISO dates and validate calendar dates", () => {
  const ref = new Date(2026, 10, 27, 23, 30, 0);
  assert.equal(todayISO(ref), "2026-11-27");
  assert.equal(addDaysISO(4, ref), "2026-12-01");
  assert.equal(addDaysISO(-1, ref), "2026-11-26");
  assert.equal(isValidISODate("2026-11-27"), true);
  assert.equal(isValidISODate("2026-02-29"), false);
  assert.equal(isValidISODate("2024-02-29"), true);
});

test("detectLangs always includes English alongside matched browser languages", () => {
  assert.deepEqual(detectLangs(["pt-BR", "de-DE"]), ["pt-BR", "en"]);
  assert.deepEqual(detectLangs(["ja-JP"]), ["en"]);
});

test("normalizeState validates strict backups and preserves legacy light/dark themes", () => {
  const fallback = createDefaultState();
  const normalized = normalizeState(
    {
      langs: ["es", "en", "es"],
      theme: "dark",
      progress: { "A1-01": "✔" },
      lastLesson: "A1-01"
    },
    fallback,
    true
  );
  assert.deepEqual(normalized.langs, ["es", "en"]);
  assert.equal(normalized.theme, "dark");
  assert.equal(normalized.progress["A1-01"], "✔");

  assert.throws(() => normalizeState({}, fallback, true), /Missing progress data/);
  assert.throws(() => normalizeState({ theme: "neon" }, fallback, true), /Invalid theme/);
  assert.throws(() => normalizeState({ progress: { "Z9-99": "✔" } }, fallback, true), /Invalid progress/);
});

test("logActivityOn caps history at 90 days and studyStreak counts consecutive days", () => {
  const state = createDefaultState();
  const today = new Date(2026, 10, 27);
  for (let i = 0; i < 95; i++) {
    const d = new Date(2026, 10, 27 - i);
    logActivityOn(state, "card", null, d);
  }
  assert.equal(Object.keys(state.activity).length, 90);
  assert.equal(studyStreak(state.activity, today), 90);

  const gapped = {
    "2026-11-26": { cards: 2, lessons: [] },
    "2026-11-25": { cards: 0, lessons: ["A1-01"] }
  };
  assert.equal(studyStreak(gapped, today), 2);
});

test("resumeLesson picks unfinished lastLesson or advances to the next unfinished lesson", () => {
  const state = createDefaultState();
  state.lastLesson = "A1-02";
  assert.equal(resumeLesson(state).id, "A1-02");

  state.progress["A1-02"] = "✔";
  assert.equal(resumeLesson(state).id, "A1-03");
});

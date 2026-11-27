import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import content from "./content.json" with { type: "json" };
import * as M from "./model.js";

const start = new Date(2026, 10, 25, 14).getTime();
const [initial, follow] = content.grammar;
const question = initial.items[0];
const copy = () => structuredClone(content);
const withTestReview = set => ({
  ...set,
  items: set.items.map(item => ({
    ...item,
    review: { revision: set.revision, reviewer: "Test fixture", qualification: "Test only", date: "2026-11-25" }
  }))
});

test("the shipped bank has matching diagnostic and follow-up rules and playable assets", () => {
  assert.equal(M.validateCatalogue(content), content);
  for (const set of content.listening) {
    const file = readFileSync(resolve(import.meta.dirname, "..", set.audio));
    assert.ok(file.length > 1000);
    const id3 = file.subarray(0, 3).toString() === "ID3";
    const frameSync = file[0] === 255 && (file[1] & 224) === 224;
    assert.ok(id3 || frameSync, "expected MP3 data");
  }
});

test("content checks reject duplicate IDs, equivalent variants, missing explanations and stale approvals", () => {
  const duplicate = copy();
  duplicate.grammar[1].items[1].id = question.id;
  assert.throws(() => M.validateCatalogue(duplicate), /duplicate practice ID/);
  const variants = copy();
  variants.grammar[0].items[0].accepted.push("  seit  ");
  assert.throws(() => M.validateCatalogue(variants), /Duplicate accepted answer/);
  const rationale = copy();
  delete rationale.listening[0].items[0].explanation;
  assert.throws(() => M.validateCatalogue(rationale), /Incomplete item/);
  const stale = copy();
  stale.grammar[0] = withTestReview(stale.grammar[0]);
  stale.grammar[0].items[0].review.revision++;
  assert.throws(() => M.validateCatalogue(stale), /review sign-off/);
  const repeated = copy();
  repeated.grammar[1].items[2].prompt = question.prompt;
  assert.throws(() => M.validateCatalogue(repeated), /Reused diagnostic prompt/);
});

test("score requires current independent review and eligibility at the start of the attempt", () => {
  const reviewed = withTestReview(initial);
  const draftAttempt = M.startSession(initial, "grammar", start);
  draftAttempt.finishedAt = start;
  assert.equal(M.score(initial, draftAttempt), null);
  assert.equal(M.score(reviewed, draftAttempt), null);
  const practice = M.emptyPractice();
  const prior = M.startSession(initial, "grammar", start);
  M.recordFirst(prior, question, "seit", start + 1);
  practice.sessions[M.sessionKey(initial)] = prior;
  const nextRevision = withTestReview({ ...initial, revision: 2 });
  assert.equal(M.startSession(nextRevision, "grammar", start + 2, practice).canScore, false);
  const attempt = M.startSession(reviewed, "grammar", start);
  attempt.hints.push(initial.items[1].id);
  assert.equal(M.recordFirst(attempt, question, "  seit ", start + 1), true);
  assert.equal(M.recordFirst(attempt, question, "vor", start + 2), false);
  assert.equal(M.recordFirst(attempt, initial.items[1], "vor", start + 3), true);
  assert.equal(M.recordFirst(attempt, initial.items[2], "", start + 4), true);
  attempt.answers[initial.items[2].id].retry = "bis zum";
  assert.equal(M.score(reviewed, attempt), null);
  attempt.finishedAt = start + 5;
  assert.deepEqual(M.score(reviewed, attempt), { firstCorrect: 1, total: 8, assisted: 1 });
  assert.equal(M.score(initial, attempt), null);
  assert.equal(M.correctAnswer(initial.items[2], "bis"), true);
  assert.equal(M.correctAnswer(initial.items[2], "bis zum"), true);
  assert.equal(M.correctAnswer(initial.items[4], "einer woche"), false);
});

test("follow-up opens after seven days and a miss schedules a fresh rule review", () => {
  const practice = M.emptyPractice();
  assert.equal(M.followUpDue(practice, content, follow), null);
  const attempt = M.startSession(initial, "grammar", start);
  practice.sessions[M.sessionKey(initial)] = attempt;
  M.recordFirst(attempt, question, "vor", start + 1);
  attempt.answers[question.id].retry = "seit";
  attempt.finishedAt = start + 1;
  assert.equal(M.followUpDue(practice, content, follow), new Date(2026, 11, 2, 14).getTime() + 1);
  const [review] = M.pendingRuleReviews(practice, content);
  assert.equal(review.due, new Date(2026, 10, 26, 14).getTime() + 1);
  assert.notEqual(review.set.items[0].prompt, question.prompt);
  const reviewAttempt = M.startSession(review.set, "grammar", review.due);
  practice.sessions[M.sessionKey(review.set)] = reviewAttempt;
  M.recordFirst(reviewAttempt, review.set.items[0], "vor", review.due + 1);
  reviewAttempt.finishedAt = review.due + 1;
  const [nextReview] = M.pendingRuleReviews(practice, content);
  assert.notEqual(nextReview.set.id, review.set.id);
  assert.equal(nextReview.set.items[0].rule, question.rule);
});

test("practice backup round-trips drafts, speaking feedback and first attempts", () => {
  const practice = M.emptyPractice();
  const attempt = M.startSession(initial, "grammar", start);
  practice.sessions[M.sessionKey(initial)] = attempt;
  M.recordFirst(attempt, question, "vor", start + 1);
  attempt.answers[question.id].retry = "seit";
  practice.writing["writing-id"] = { draft: "Hallo.", revision: "Guten Tag.", feedback: "Register" };
  practice.speaking["speaking-id"] = { at: start, ratings: [1, 2, 2, 1], notes: "A clear plan" };
  assert.deepEqual(M.normalizePractice(structuredClone(practice)), practice);
  assert.throws(() => M.normalizePractice({ ...practice, version: 2 }), /version/);
  practice.sessions[M.sessionKey(initial)].answers[question.id].at = start - 1;
  assert.throws(() => M.normalizePractice(practice), /Invalid first attempt/);
});

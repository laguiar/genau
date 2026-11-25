/* Practice data, scoring, and saved state shared by the browser and the content checks. */
(() => {
  "use strict";

  const RETENTION_DAYS = 7;
  const REVIEW_DAYS = 1;
  const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const SESSION_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*:v[1-9][0-9]*$/;
  const TOPIC = /^(A[12]|B1)-[0-9]{2}$/;
  const RECORD_LIMIT = 2000;
  const ANSWER_LIMIT = 500;
  const DRAFT_LIMIT = 10000;
  const kinds = ["diagnostic", "follow-up", "rule-review"];

  function requireValue(condition, message) {
    if (!condition) throw new Error(message);
  }

  const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const has = (object, key) => Object.hasOwn(object, key);
  const nonempty = value => typeof value === "string" && value.trim().length > 0;
  const date = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  const timestamp = value => Number.isSafeInteger(value) && value > 0 && value <= 8640000000000000;
  const integer = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;
  const bounded = (value, max) => typeof value === "string" && value.length <= max;
  const listOfText = list => Array.isArray(list) && list.length > 0 && list.every(nonempty);

  function normalizeAnswer(value) {
    // Keep capitalisation and diacritics meaningful. Normalise only input formatting.
    return value.normalize("NFC").trim().replace(/\s+/g, " ");
  }

  function correctAnswer(item, value) {
    const answer = normalizeAnswer(value);
    return item.accepted.some(accepted => normalizeAnswer(accepted) === answer);
  }

  function validateCatalogue(bank) {
    const ids = new Set();
    const rules = new Map();
    const sets = new Map();
    const uniqueId = id => {
      requireValue(typeof id === "string" && ID.test(id) && !ids.has(id), "Missing, invalid, or duplicate practice ID: " + id);
      ids.add(id);
    };
    requireValue(record(bank) && bank.version === 1, "Unsupported practice catalogue.");
    for (const collection of ["rules", "grammar", "listening", "speaking", "writing"]) {
      requireValue(Array.isArray(bank[collection]), "Missing practice collection: " + collection);
    }
    for (const rule of bank.rules) {
      uniqueId(rule.id);
      requireValue(TOPIC.test(rule.topic) && nonempty(rule.label), "Incomplete rule: " + rule.id);
      rules.set(rule.id, rule);
    }
    for (const set of [...bank.grammar, ...bank.listening]) {
      uniqueId(set.id);
      sets.set(set.id, set);
      requireValue(integer(set.revision, 1, 999) && nonempty(set.title), "Incomplete practice set: " + set.id);
      requireValue(Array.isArray(set.items) && set.items.length > 0, "Missing items: " + set.id);
      const listening = bank.listening.includes(set);
      if (listening) {
        requireValue(/^practice\/audio\/[a-z0-9-]+\.mp3$/.test(set.audio), "Invalid audio path: " + set.id);
        requireValue(integer(set.seconds, 1, 1800) && integer(set.maxPlays, 1, 2), "Invalid listening timing: " + set.id);
      } else {
        requireValue(kinds.includes(set.kind) && TOPIC.test(set.topic), "Invalid grammar set: " + set.id);
        if (set.kind !== "rule-review") requireValue(set.items.length === 8, "Expected eight core items: " + set.id);
        if (set.kind === "rule-review") requireValue(set.items.length === 1, "Expected one review item: " + set.id);
      }
      for (const item of set.items) {
        uniqueId(item.id);
        requireValue(nonempty(item.prompt) && listOfText(item.accepted) && nonempty(item.explanation), "Incomplete item: " + item.id);
        const variants = item.accepted.map(normalizeAnswer);
        requireValue(new Set(variants).size === variants.length, "Duplicate accepted answer: " + item.id);
        if (listening) {
          requireValue(variants.length === 1 && ["true", "false"].includes(variants[0]) && nonempty(item.transcript),
            "Missing listening key or transcript: " + item.id);
        } else {
          requireValue(rules.get(item.rule)?.topic === set.topic && nonempty(item.hint), "Missing rule or hint: " + item.id);
        }
        const approval = item.review;
        requireValue(approval === null || (record(approval) && nonempty(approval.reviewer)
          && nonempty(approval.qualification) && date(approval.date)
          && approval.revision === set.revision), "Incomplete review sign-off: " + item.id);
      }
    }
    const ruleSignature = set => set.items.map(item => item.rule).sort().join(",");
    for (const follow of bank.grammar.filter(set => set.kind === "follow-up")) {
      const initial = sets.get(follow.follows);
      requireValue(initial?.kind === "diagnostic" && initial.topic === follow.topic && initial.revision === follow.revision
        && ruleSignature(initial) === ruleSignature(follow), "Unmatched follow-up: " + follow.id);
      const priorPrompts = new Set(initial.items.map(item => item.prompt));
      requireValue(follow.items.every(item => !priorPrompts.has(item.prompt)), "Reused diagnostic prompt: " + follow.id);
    }
    for (const initial of bank.grammar.filter(set => set.kind === "diagnostic")) {
      requireValue(bank.grammar.filter(set => set.follows === initial.id).length === 1, "Expected one follow-up: " + initial.id);
    }
    for (const prompt of bank.writing) {
      uniqueId(prompt.id);
      requireValue(nonempty(prompt.title) && nonempty(prompt.situation) && listOfText(prompt.points)
        && prompt.points.length === 4, "Incomplete writing prompt: " + prompt.id);
    }
    for (const prompt of bank.speaking) {
      uniqueId(prompt.id);
      requireValue(nonempty(prompt.title) && Array.isArray(prompt.tasks) && prompt.tasks.length === 3,
        "Expected three speaking tasks: " + prompt.id);
      for (const task of prompt.tasks) {
        requireValue(nonempty(task.title) && nonempty(task.a) && nonempty(task.b), "Incomplete speaking role card: " + prompt.id);
      }
    }
    return bank;
  }

  function emptyPractice() {
    return { version: 1, sessions: {}, writing: {}, speaking: {} };
  }

  function normalizePractice(value) {
    requireValue(record(value) && value.version === 1, "Invalid practice backup version.");
    function map(input, keyPattern, parse) {
      requireValue(record(input) && Object.keys(input).length <= RECORD_LIMIT, "Invalid practice records.");
      return Object.fromEntries(Object.entries(input).map(([key, entry]) => {
        requireValue(keyPattern.test(key) && record(entry), "Invalid practice record.");
        return [key, parse(entry)];
      }));
    }
    const sessions = map(value.sessions, SESSION_KEY, session => {
      const { mode, startedAt, finishedAt, canScore, hints, plays } = session;
      requireValue(["grammar", "listening"].includes(mode) && timestamp(startedAt)
        && (finishedAt === null || timestamp(finishedAt) && finishedAt >= startedAt)
        && typeof canScore === "boolean" && Array.isArray(hints) && hints.length <= 30
        && hints.every(id => typeof id === "string" && ID.test(id))
        && integer(plays, 0, 2), "Invalid practice session.");
      const answers = map(session.answers, ID, answer => {
        const { text, at, assisted, retry } = answer;
        requireValue(bounded(text, ANSWER_LIMIT) && timestamp(at) && at >= startedAt
          && (finishedAt === null || at <= finishedAt)
          && typeof assisted === "boolean" && (retry === null || bounded(retry, ANSWER_LIMIT)), "Invalid first attempt.");
        return { text, at, assisted, retry };
      });
      return { mode, startedAt, finishedAt, canScore, hints: [...hints], plays, answers };
    });
    const writing = map(value.writing, ID, entry => {
      const { draft, revision, feedback } = entry;
      requireValue([draft, revision, feedback].every(text => bounded(text, DRAFT_LIMIT)), "Invalid writing record.");
      return { draft, revision, feedback };
    });
    const speaking = map(value.speaking, ID, entry => {
      const { at, ratings, notes } = entry;
      requireValue(timestamp(at) && Array.isArray(ratings) && ratings.length === 4
        && ratings.every(rating => integer(rating, 0, 2)) && bounded(notes, DRAFT_LIMIT), "Invalid speaking record.");
      return { at, ratings: [...ratings], notes };
    });
    return { version: 1, sessions, writing, speaking };
  }

  const sessionKey = set => set.id + ":v" + set.revision;
  const isReviewed = set => set.items.every(item => item.review?.revision === set.revision);
  const sessionFor = (practice, set) => practice.sessions[sessionKey(set)];

  function startSession(set, mode, now, practice = emptyPractice()) {
    const seen = new Set();
    for (const session of Object.values(practice.sessions)) {
      for (const id of [...Object.keys(session.answers), ...session.hints]) seen.add(id);
    }
    return {
      mode, startedAt: now, finishedAt: null,
      canScore: isReviewed(set) && set.items.every(item => !seen.has(item.id)),
      hints: [], plays: 0, answers: {}
    };
  }

  function recordFirst(session, item, text, now) {
    if (session.finishedAt !== null || has(session.answers, item.id)
      || !bounded(text, ANSWER_LIMIT) || now < session.startedAt) return false;
    session.answers[item.id] = { text, at: now, assisted: session.hints.includes(item.id), retry: null };
    return true;
  }

  function score(set, session) {
    if (!session?.finishedAt || !session.canScore || !isReviewed(set)) return null;
    return {
      firstCorrect: set.items.filter(item => {
        const answer = session.answers[item.id];
        return answer && !answer.assisted && correctAnswer(item, answer.text);
      }).length,
      total: set.items.length,
      assisted: set.items.filter(item => session.answers[item.id]?.assisted).length
    };
  }

  function plusDays(at, days) {
    const when = new Date(at);
    when.setDate(when.getDate() + days);
    return when.getTime();
  }

  function followUpDue(practice, bank, follow) {
    const initial = bank.grammar.find(set => set.id === follow.follows);
    const finished = sessionFor(practice, initial)?.finishedAt;
    return finished ? plusDays(finished, RETENTION_DAYS) : null;
  }

  function pendingRuleReviews(practice, bank) {
    const misses = new Map();
    for (const set of bank.grammar) {
      const session = sessionFor(practice, set);
      for (const item of set.items) {
        const attempt = session?.answers[item.id];
        if (attempt && !correctAnswer(item, attempt.text)) {
          misses.set(item.rule, Math.max(attempt.at, misses.get(item.rule) || 0));
        }
      }
    }
    const pending = [];
    for (const [rule, missedAt] of misses) {
      const reviews = bank.grammar.filter(set => set.kind === "rule-review" && set.items[0].rule === rule);
      const completedAt = Math.max(0, ...reviews.map(set => sessionFor(practice, set)?.finishedAt || 0));
      const fresh = reviews.find(set => !sessionFor(practice, set)?.finishedAt);
      if (fresh && (missedAt >= completedAt)) pending.push({ set: fresh, due: plusDays(missedAt, REVIEW_DAYS) });
    }
    return pending.sort((a, b) => a.due - b.due);
  }

  const api = {
    ANSWER_LIMIT, DRAFT_LIMIT, RETENTION_DAYS, correctAnswer, emptyPractice, followUpDue, isReviewed,
    normalizeAnswer, normalizePractice, pendingRuleReviews, recordFirst, score,
    sessionFor, sessionKey, startSession, validateCatalogue
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else globalThis.GenauPracticeModel = api;
})();

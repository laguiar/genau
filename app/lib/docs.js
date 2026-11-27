import { getState, saveState } from "../store.js";
import { todayISO } from "./dates.js";
import { CARD_FILES, parseCardsMd } from "./flashcards-model.js";

const FETCH_TIMEOUT_MS = 15_000;
const docCache = new Map();
let allCardsPromise = null;

export async function fetchDoc(path, { signal } = {}) {
  if (docCache.has(path)) return docCache.get(path);
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let res;
  try {
    res = await fetch(path, { signal: combined });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error(`Timed out loading ${path}`, { cause: err });
    }
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const txt = await res.text();
  docCache.set(path, txt);
  return txt;
}

export function loadAllCards() {
  if (allCardsPromise) return allCardsPromise;
  allCardsPromise = Promise.allSettled(
    CARD_FILES.map(async ([path, lang]) => parseCardsMd(await fetchDoc(path), lang))
  ).then(results => {
    const failed = CARD_FILES.filter((_, index) => results[index].status === "rejected");
    if (failed.length) {
      allCardsPromise = null;
      throw new Error(`Could not load ${failed.map(([path]) => path).join(", ")}. Try again.`);
    }
    return results.flatMap(result => result.value);
  });
  return allCardsPromise;
}

export async function queueTopicCards(topicId) {
  const cards = await loadAllCards();
  const state = getState();
  const today = todayISO();
  let added = 0;
  for (const c of cards) {
    if (c.topic !== topicId) continue;
    if (c.lang && !state.langs.includes(c.lang)) continue;
    if (!state.schedule[c.id]) {
      state.schedule[c.id] = { id: c.id, topic: c.topic, due: today, step: 0, reviews: 0, correct: 0 };
      added++;
    }
  }
  saveState("schedule");
  return added;
}

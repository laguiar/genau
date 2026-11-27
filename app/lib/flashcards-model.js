import { LADDER, LESSON_IDS } from "../data/course.js";
import { addDaysISO, isValidISODate, todayISO } from "./dates.js";

export const CARD_FILES = [
  ["review/cards/A1.md", null],
  ["review/cards/A2.md", null],
  ["review/cards/B1.md", null],
  ["review/cards/contrasts/pt-BR.md", "pt-BR"],
  ["review/cards/contrasts/es.md", "es"],
  ["review/cards/contrasts/fr.md", "fr"],
  ["review/cards/contrasts/en.md", "en"]
];

export function isScheduleRow(id, row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return false;
  if (row.id !== id || !LESSON_IDS.has(row.topic) || !id.startsWith(`${row.topic}-`)) return false;
  if (!/^(?:A[12]|B1)-\d{2}-(?:[a-zA-Z]+(?:-[a-zA-Z]+)*-)?\d{2,}$/.test(id)) return false;
  if (!isValidISODate(row.due)) return false;
  return (
    Number.isInteger(row.step) &&
    row.step >= 0 &&
    row.step < LADDER.length &&
    Number.isSafeInteger(row.reviews) &&
    row.reviews >= 0 &&
    Number.isSafeInteger(row.correct) &&
    row.correct >= 0 &&
    row.correct <= row.reviews
  );
}

export function parseCardsMd(txt, langCode = null) {
  const out = [];
  let cur = null;
  for (const line of txt.replaceAll("\r\n", "\n").split("\n")) {
    const m = line.match(/^###\s+(\S+)\s*$/);
    if (m) {
      if (cur) out.push(cur);
      const id = m[1];
      const topic = id.split("-").slice(0, 2).join("-");
      cur = { id, topic, Q: "", A: "", T: "", lang: langCode };
      continue;
    }
    if (cur) {
      if (line.startsWith("Q:")) cur.Q = `${cur.Q} ${line.slice(2).trim()}`.trim();
      else if (line.startsWith("A:")) cur.A = `${cur.A} ${line.slice(2).trim()}`.trim();
      else if (line.startsWith("T:")) cur.T = `${cur.T} ${line.slice(2).trim()}`.trim();
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function computeNextScheduleRow(row, grade, now = new Date()) {
  let step = row.step || 0;
  const reviews = row.reviews || 0;
  if (grade === 0) step = 0;
  else if (grade === 1) step = Math.max(0, step - 1);
  else if (grade === 2) step = reviews === 0 && step === 0 ? 0 : Math.min(LADDER.length - 1, step + 1);
  else if (grade === 3) step = reviews === 0 && step === 0 ? 1 : Math.min(LADDER.length - 1, step + 2);
  return {
    ...row,
    step,
    due: addDaysISO(LADDER[step], now),
    reviews: reviews + 1,
    correct: (row.correct || 0) + (grade >= 2 ? 1 : 0)
  };
}

export function getDueCount(schedule, now = new Date()) {
  const today = todayISO(now);
  return Object.values(schedule).filter(r => r.due <= today).length;
}

export function buildDueQueue(schedule, cardMap, { now = new Date(), random = Math.random } = {}) {
  const today = todayISO(now);
  const due = Object.values(schedule).filter(r => r.due <= today && cardMap[r.id]);
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due.map(r => cardMap[r.id]);
}

export function buildPracticeQueue(cards, topicId, activeLangs) {
  return cards.filter(c => c.topic === topicId && (!c.lang || activeLangs.includes(c.lang)));
}

import { LANGUAGES } from "./data/assets.js";
import { ALL_LESSONS, LESSON_BY_ID, LESSON_IDS, SIDEBAR_GROUPS, STATUSES } from "./data/course.js";
import { addDaysISO, isValidISODate, todayISO } from "./lib/dates.js";
import { isScheduleRow } from "./lib/flashcards-model.js";

export const STORAGE_KEY = "genau_app_state_v1";
export const COLOR_SCHEME_KEY = "genau_color_scheme";
const THEMES = ["system", "light", "dark"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function defaultEmptyPractice() {
  return globalThis.GenauPracticeModel?.emptyPractice() ?? { version: 1, sessions: {}, drafts: {} };
}

function defaultNormalizePractice(value) {
  if (globalThis.GenauPracticeModel?.normalizePractice) {
    return globalThis.GenauPracticeModel.normalizePractice(value);
  }
  return isRecord(value) ? structuredClone(value) : defaultEmptyPractice();
}

export function detectLangs(browserLanguages) {
  const raw =
    browserLanguages ??
    (typeof navigator !== "undefined" ? navigator.languages || [navigator.language || ""] : ["en"]);
  const prefs = raw.map(l => String(l).toLowerCase());
  const found = LANGUAGES.filter(code => prefs.some(p => p.startsWith(code.slice(0, 2).toLowerCase())));
  return [...new Set([...found, "en"])];
}

export function createDefaultState() {
  return {
    langs: detectLangs(),
    progress: {},
    schedule: {},
    theme: "system",
    sidebarCollapsed: false,
    collapsed: {},
    diagnostics: {},
    activity: {},
    langsChosen: false,
    practice: defaultEmptyPractice()
  };
}

export function normalizeState(candidate, fallback, strict = false, practiceNormalizer = defaultNormalizePractice) {
  if (!isRecord(candidate)) throw new Error("Invalid progress data");
  const next = structuredClone(fallback);
  const validators = {
    langs: value => Array.isArray(value) && value.length > 0 && value.every(lang => LANGUAGES.includes(lang)),
    theme: value => THEMES.includes(value),
    sidebarCollapsed: value => typeof value === "boolean",
    progress: (id, status) => LESSON_IDS.has(id) && STATUSES.includes(status),
    schedule: isScheduleRow,
    collapsed: (key, value) => SIDEBAR_GROUPS.includes(key) && typeof value === "boolean",
    diagnostics: (id, value) =>
      LESSON_IDS.has(id) &&
      isRecord(value) &&
      Number.isInteger(value.score) &&
      Number.isInteger(value.total) &&
      value.score >= 0 &&
      value.score <= value.total &&
      typeof value.date === "string",
    activity: (date, value) =>
      isValidISODate(date) &&
      isRecord(value) &&
      Number.isInteger(value.cards) &&
      Array.isArray(value.lessons) &&
      value.lessons.every(id => LESSON_IDS.has(id)),
    langsChosen: value => typeof value === "boolean",
    lastLesson: value => typeof value === "string" && LESSON_IDS.has(value)
  };
  const fields = [...Object.keys(validators), "practice"].filter(key => Object.hasOwn(candidate, key));
  if (strict && fields.length === 0) throw new Error("Missing progress data");

  for (const key of fields) {
    const value = candidate[key];
    if (key === "practice") {
      try {
        next.practice = practiceNormalizer(value);
      } catch (err) {
        if (strict) throw err;
      }
    } else if (
      key === "langs" ||
      key === "theme" ||
      key === "sidebarCollapsed" ||
      key === "langsChosen" ||
      key === "lastLesson"
    ) {
      if (validators[key](value)) next[key] = key === "langs" ? [...new Set(value)] : value;
      else if (strict) throw new Error(`Invalid ${key}`);
    } else if (isRecord(value)) {
      const entries = Object.entries(value);
      const valid = entries.filter(([id, entry]) => validators[key](id, entry));
      if (strict && valid.length !== entries.length) throw new Error(`Invalid ${key}`);
      next[key] = Object.fromEntries(valid);
    } else if (strict) {
      throw new Error(`Invalid ${key}`);
    }
  }
  return next;
}

export function logActivityOn(stateObj, kind, lessonId, now = new Date()) {
  const day = todayISO(now);
  if (!stateObj.activity[day]) stateObj.activity[day] = { cards: 0, lessons: [] };
  const entry = stateObj.activity[day];
  if (kind === "card") entry.cards += 1;
  if (kind === "lesson" && lessonId && !entry.lessons.includes(lessonId)) entry.lessons.push(lessonId);
  const days = Object.keys(stateObj.activity).toSorted();
  for (let i = 0; i < days.length - 90; i++) {
    delete stateObj.activity[days[i]];
  }
}

export function studyStreak(activity, now = new Date()) {
  let streak = 0;
  const today = todayISO(now);
  for (let offset = 0; ; offset++) {
    const key = addDaysISO(-offset, now);
    const day = activity[key];
    if (day && (day.cards > 0 || day.lessons.length > 0)) {
      streak++;
    } else if (streak > 0 || key !== today) {
      break;
    }
  }
  return streak;
}

export function nextLessonFor(list, progress) {
  return list.find(l => !["●", "✔"].includes(progress[l.id])) || list[0];
}

export function resumeLesson(stateObj) {
  const isDone = l => ["●", "✔"].includes(stateObj.progress[l.id]);
  const last = stateObj.lastLesson && LESSON_BY_ID[stateObj.lastLesson];
  if (last && !isDone(last)) return last;
  if (last) {
    const after = ALL_LESSONS.slice(ALL_LESSONS.indexOf(last) + 1).find(l => !isDone(l));
    if (after) return after;
  }
  return nextLessonFor(ALL_LESSONS, stateObj.progress);
}

export function hasStarted(lesson, stateObj) {
  return (
    stateObj.lastLesson === lesson.id ||
    Boolean(stateObj.diagnostics[lesson.id]) ||
    ["◐", "◑", "●", "✔"].includes(stateObj.progress[lesson.id])
  );
}

// ==================== LIVE BROWSER STORE ====================
const bus = new EventTarget();
let state = loadFromStorage();

function browserStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadFromStorage() {
  const defaults = createDefaultState();
  const storage = browserStorage();
  if (!storage) return defaults;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const next = normalizeState(parsed, defaults);
      if (!Object.hasOwn(parsed, "langsChosen") && Object.keys(next.progress).length) {
        next.langsChosen = true;
      }
      return next;
    }
  } catch {
    // Ignore corrupt localStorage and fall back to defaults.
  }
  return defaults;
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  const wrapped = event => listener(event.detail);
  bus.addEventListener("change", wrapped);
  return () => bus.removeEventListener("change", wrapped);
}

function notify(reason = "update") {
  bus.dispatchEvent(new CustomEvent("change", { detail: { state, reason } }));
}

function syncColorSchemeStorage(theme) {
  const storage = browserStorage();
  if (!storage) return;
  try {
    if (theme === "light" || theme === "dark") storage.setItem(COLOR_SCHEME_KEY, theme);
    else storage.removeItem(COLOR_SCHEME_KEY);
  } catch {
    // Ignore storage quota / privacy blocks.
  }
}

export function saveState(reason = "update") {
  syncColorSchemeStorage(state.theme);
  const storage = browserStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors; UI stays functional in memory.
    }
  }
  notify(reason);
}

export function logActivity(kind, lessonId) {
  logActivityOn(state, kind, lessonId);
}

export function savePracticeState(practice) {
  const next = { ...state, practice };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  notify("practice");
  return true;
}

export function restoreStateFromJson(text) {
  let restored;
  try {
    restored = normalizeState(JSON.parse(text), state, true);
  } catch (err) {
    throw new Error("Invalid backup file.", { cause: err });
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
  } catch (err) {
    throw new Error("Could not save this backup in your browser.", { cause: err });
  }
  state = restored;
  syncColorSchemeStorage(state.theme);
  notify("restore");
  return state;
}

export function getSystemTheme() {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getResolvedTheme(theme = state.theme) {
  return theme === "light" || theme === "dark" ? theme : getSystemTheme();
}

export function toggleTheme() {
  const system = getSystemTheme();
  const rendered = getResolvedTheme(state.theme);
  const target = rendered === "dark" ? "light" : "dark";
  // Two-state toggle semantics: reverting back to OS scheme clears the override.
  state.theme = target === system ? "system" : target;
  saveState("theme");
  return state.theme;
}

export function syncFromStorageEvent(event) {
  if (event.key !== STORAGE_KEY && event.key !== COLOR_SCHEME_KEY) return false;
  state = loadFromStorage();
  notify("storage");
  return true;
}

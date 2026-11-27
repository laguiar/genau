import { FLAGS, ICONS } from "../data/assets.js";
import { ALL_LESSONS } from "../data/course.js";
import { getDueCount } from "../lib/flashcards-model.js";
import { getResolvedTheme, getState } from "../store.js";

let toastTimer;

export function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

const THEME_COLORS = { light: "#fdfcfa", dark: "#121316" };

export function applyTheme() {
  const { theme } = getState();
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.content = theme === "light" || theme === "dark" ? theme : "light dark";
  }
  const resolved = getResolvedTheme(theme);
  const themeColorMeta = document.getElementById("themeColorMeta");
  if (themeColorMeta) {
    themeColorMeta.content = THEME_COLORS[resolved];
  }
  const btn = document.getElementById("themeBtn");
  if (btn) {
    btn.innerHTML = resolved === "dark" ? ICONS.sun : ICONS.moon;
    const label = resolved === "dark" ? "Switch to light mode" : "Switch to dark mode";
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }
}

export function renderLangPills() {
  const { langs } = getState();
  for (const btn of document.querySelectorAll(".lang-pill")) {
    const code = btn.dataset.lang;
    const active = langs.includes(code);
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
  const summary = document.getElementById("langSummaryFlags");
  if (summary) summary.innerHTML = langs.map(code => FLAGS[code]).join("");
  for (const box of document.querySelectorAll(".contrast-box")) {
    const code = box.dataset.lang;
    box.classList.toggle("hidden-lang", !langs.includes(code));
  }
}

export function updateBadges() {
  const state = getState();
  const done = ALL_LESSONS.filter(l => ["●", "✔"].includes(state.progress[l.id])).length;
  const summary = document.getElementById("progressSummary");
  if (summary) summary.textContent = `${done} / ${ALL_LESSONS.length}`;
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.transform = `scaleX(${done / ALL_LESSONS.length})`;

  const due = getDueCount(state.schedule);
  const fcBtn = document.getElementById("fcNavBtn");
  if (fcBtn) fcBtn.setAttribute("aria-label", due > 0 ? `Flashcards, ${due} due` : "Flashcards, none due");

  const dueEl = document.getElementById("dueBadge");
  if (dueEl) {
    dueEl.textContent = String(due);
    dueEl.classList.toggle("has-due", due > 0);
    dueEl.hidden = due === 0;
  }

  const sideDue = document.getElementById("sideDueBadge");
  if (sideDue) {
    sideDue.textContent = due > 0 ? `${due} due` : "";
    sideDue.hidden = due === 0;
    sideDue.classList.toggle("due", due > 0);
  }
}

export function updatePrimaryNavActive() {
  const h = location.hash || "#doc=README.md";
  const isHome = h === "" || h === "#" || h === "#doc=README.md";
  const isPractice = h.startsWith("#practice=");
  const isFc = h === "#flashcards";
  const entries = [
    ["homeNav", isHome],
    ["practiceNav", isPractice],
    ["flashcardsSideNav", isFc]
  ];
  for (const [id, active] of entries) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.classList.toggle("active", active);
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  }
}

export function closeOpenPopovers() {
  for (const el of document.querySelectorAll("[popover]:popover-open")) {
    el.hidePopover();
  }
}

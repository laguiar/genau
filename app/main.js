import { LANG_META } from "./data/assets.js";
import { todayISO } from "./lib/dates.js";
import {
  getState,
  restoreStateFromJson,
  saveState,
  subscribe,
  syncFromStorageEvent,
  toggleTheme
} from "./store.js";
import {
  applyTheme,
  closeOpenPopovers,
  renderLangPills,
  showToast,
  updateBadges,
  updatePrimaryNavActive
} from "./ui/shell.js";
import { initSidebarControls, renderSidebar, syncSidebarState } from "./ui/sidebar.js";
import { handleFlashcardKeydown, openFlashcards } from "./views/flashcards.js";
import { renderHome } from "./views/home.js";
import { openPractice } from "./views/practice.js";
import { openDoc } from "./views/reader.js";

let navigationId = 0;
let navAbort = null;
let currentPath = "README.md";
let closePractice = () => {};

function isHomeHash() {
  return !location.hash || location.hash === "#" || location.hash === "#doc=README.md";
}

async function route() {
  closeOpenPopovers();
  closePractice();
  closePractice = () => {};

  navAbort?.abort();
  navAbort = new AbortController();
  const { signal } = navAbort;
  const requestId = ++navigationId;
  const isCurrent = () => requestId === navigationId;

  const h = location.hash || "#doc=README.md";
  updatePrimaryNavActive();

  if (h === "#flashcards") {
    await openFlashcards({ signal, isCurrent, onRetry: route });
  } else if (h.startsWith("#practice=")) {
    closePractice = await openPractice(h.slice("#practice=".length), { signal, isCurrent });
  } else if (h.startsWith("#doc=")) {
    const path = decodeURIComponent(h.slice(5));
    currentPath = path;
    if (path === "README.md") renderHome();
    else await openDoc(path, { signal, isCurrent });
  } else {
    currentPath = "README.md";
    renderHome();
  }
}

// Store reactions
subscribe(({ reason }) => {
  updateBadges();
  if (reason === "theme" || reason === "restore" || reason === "storage") {
    applyTheme();
  }
  if (reason === "restore" || reason === "storage") {
    syncSidebarState();
    renderLangPills();
    route();
  }
});

// React to OS color-scheme changes (without clearing an explicit user override)
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

// Sync theme & progress across tabs
window.addEventListener("storage", syncFromStorageEvent);

// Keyboard shortcuts in flashcard mode
window.addEventListener("keydown", handleFlashcardKeydown);

// Header controls
document.getElementById("themeBtn").addEventListener("click", () => {
  toggleTheme();
});

document.getElementById("fcNavBtn").addEventListener("click", () => {
  location.hash = "#flashcards";
});

for (const btn of document.querySelectorAll(".lang-pill")) {
  btn.addEventListener("click", () => {
    const state = getState();
    const code = btn.dataset.lang;
    if (state.langs.includes(code)) {
      if (state.langs.length === 1) {
        showToast("Keep at least one contrast language enabled.");
        return;
      }
      state.langs = state.langs.filter(l => l !== code);
    } else {
      state.langs = [...state.langs, code];
    }
    state.langsChosen = true;
    saveState("langs");
    renderLangPills();
    if (currentPath === "README.md" && isHomeHash()) renderHome();
    showToast(`Contrast notes: ${state.langs.map(l => LANG_META[l].name).join(", ")}`);
  });
}

// Export / Import JSON backup (modern File.text() + URL.revokeObjectURL())
document.getElementById("exportProgressBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genau-progress-${todayISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Backup downloaded.");
});

document.getElementById("importProgressBtn").addEventListener("click", () => {
  document.getElementById("importFileInput").click();
});

document.getElementById("importFileInput").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  try {
    const text = await file.text();
    restoreStateFromJson(text);
    showToast("Progress restored.");
  } catch (err) {
    showToast(err.message || "Could not read the backup file.");
  }
});

// Sidebar & Router boot
initSidebarControls(() => currentPath);
window.addEventListener("hashchange", route);

applyTheme();
syncSidebarState();
renderLangPills();
updateBadges();
renderSidebar(currentPath);
route();

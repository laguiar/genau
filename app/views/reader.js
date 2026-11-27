import { ICONS } from "../data/assets.js";
import { ALL_LESSONS, LESSON_BY_PATH, statusLabel } from "../data/course.js";
import { parseDiagnostic } from "../lib/diagnostic-model.js";
import { escapeHtml } from "../lib/diagrams.js";
import { fetchDoc, queueTopicCards } from "../lib/docs.js";
import { renderLessonMasthead, renderMarkdown } from "../lib/markdown.js";
import { getState, logActivity, saveState } from "../store.js";
import { showToast, updatePrimaryNavActive } from "../ui/shell.js";
import { closeDrawerSidebar, renderSidebar } from "../ui/sidebar.js";
import { mountDiagnostic } from "./diagnostic.js";

const STATUS_OPTIONS = [
  ["☐", "Not started"],
  ["◐", "In progress"],
  ["●", "Done"],
  ["✔", "Known"]
];

export async function openDoc(path, { signal, isCurrent }) {
  const state = getState();
  updatePrimaryNavActive();
  renderSidebar(path, document.getElementById("searchInput").value);
  closeDrawerSidebar();

  const container = document.getElementById("mainContainer");
  if (window.location.protocol === "file:") {
    container.innerHTML = `
      <div class="notice">
        <strong>Heads up — local file mode:</strong> Your browser blocks loading separate Markdown lessons directly from <code>file://</code>.
        <br><br>
        Open the hosted web app or open this unzipped <code>genau</code> folder in <a href="https://obsidian.md/" target="_blank" rel="noopener noreferrer">Obsidian</a> for offline study.
      </div>`;
    return;
  }

  container.innerHTML = `<div class="loading-state">Loading ${escapeHtml(path)}…</div>`;

  try {
    const md = await fetchDoc(path, { signal });
    if (!isCurrent()) return;

    const lesson = LESSON_BY_PATH[path];
    let html = "";

    if (lesson) {
      const curSt = state.progress[lesson.id] || "☐";
      const hasQueuedCards = Object.keys(state.schedule).some(id => id.startsWith(`${lesson.id}-`));
      html += `
        <div class="lesson-toolbar">
          <div class="status-group" role="group" aria-labelledby="statusLabel">
            <span class="status-label" id="statusLabel">My status</span>
            <div class="status-seg">
              ${STATUS_OPTIONS.map(
                ([st, lbl]) =>
                  `<button class="status-btn ${curSt === st ? "active" : ""}" data-status="${st}" type="button" aria-pressed="${curSt === st}">${lbl}</button>`
              ).join("")}
            </div>
          </div>
          <button class="top-btn icon-btn" type="button" popovertarget="lessonActionsMenu" aria-label="More lesson actions" title="More lesson actions">${ICONS.more}</button>
          <div id="lessonActionsMenu" class="popover-panel" popover="auto">
            ${hasQueuedCards ? "" : `<button class="more-item" id="queueLessonBtn" type="button">${ICONS.cards}<span>Add this lesson's cards to review</span></button>`}
            ${lesson.id === "A2-04" ? `<a class="more-item" href="#practice=a2-04-diagnostic">${ICONS.diagnostic}<span>Guided diagnostic with hints</span></a>` : ""}
            <button class="more-item" id="copyAiBtn" type="button">${ICONS.copy}<span>Copy lesson for an AI tutor</span></button>
            <button class="more-item" id="printDocBtn" type="button">${ICONS.print}<span>Print or save as PDF</span></button>
          </div>
        </div>`;
    } else if (path.startsWith("shared/")) {
      html += `
        <div class="lesson-toolbar doc-print-bar">
          <button class="top-btn" id="printDocBtn" type="button" title="Print or save as PDF">${ICONS.print}<span>Print / Save PDF</span></button>
        </div>`;
    }

    if (lesson) {
      const parsed = renderLessonMasthead(md, lesson, path);
      if (parsed) {
        html += `<article class="md is-lesson">${parsed.mastheadHtml}${renderMarkdown(parsed.restMd, path, state.langs)}</article>`;
      } else {
        html += `<article class="md is-lesson">${renderMarkdown(md, path, state.langs)}</article>`;
      }
    } else {
      html += `<article class="md">${renderMarkdown(md, path, state.langs)}</article>`;
    }

    if (lesson) {
      const idx = ALL_LESSONS.findIndex(l => l.id === lesson.id);
      const prev = idx > 0 ? ALL_LESSONS[idx - 1] : null;
      const next = idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : null;
      html += `
        <div class="lesson-footer">
          ${prev ? `<a class="top-btn" href="#doc=${encodeURIComponent(prev.path)}">${ICONS.arrowLeft}<span>${prev.id}</span></a>` : `<span></span>`}
          ${next ? `<a class="top-btn primary" href="#doc=${encodeURIComponent(next.path)}"><span>Next: ${next.id}</span>${ICONS.arrowRight}</a>` : `<a class="top-btn primary" href="#doc=${encodeURIComponent("shared/mock-exam-telc-b1.md")}"><span>Take Full Mock Exam</span>${ICONS.arrowRight}</a>`}
        </div>`;
    }

    container.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "instant" });

    document.getElementById("printDocBtn")?.addEventListener("click", () => window.print());

    const actionsMenu = document.getElementById("lessonActionsMenu");
    actionsMenu?.addEventListener("click", e => {
      if (e.target.closest(".more-item")) actionsMenu.hidePopover();
    });

    if (lesson && state.lastLesson !== lesson.id) {
      state.lastLesson = lesson.id;
      saveState("lastLesson");
    }

    if (lesson) {
      const setStatus = (status, quiet) => {
        state.progress[lesson.id] = status;
        if (status === "●" || status === "✔") logActivity("lesson", lesson.id);
        saveState("progress");
        for (const b of container.querySelectorAll(".status-btn")) {
          const on = b.dataset.status === status;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        }
        renderSidebar(path, document.getElementById("searchInput").value);
        if (!quiet) showToast(`${lesson.id}: ${statusLabel(status)}`);
      };

      for (const btn of container.querySelectorAll(".status-btn")) {
        btn.addEventListener("click", () => setStatus(btn.dataset.status, false));
      }

      const dx = parseDiagnostic(md);
      if (dx) mountDiagnostic(container.querySelector("article.md"), lesson, dx, path, setStatus);

      document.getElementById("queueLessonBtn")?.addEventListener("click", async () => {
        try {
          const added = await queueTopicCards(lesson.id);
          showToast(
            added > 0 ? `Added ${added} card(s) for ${lesson.id} to Flashcards` : `No new cards for ${lesson.id}`
          );
        } catch (err) {
          showToast(err.message);
        }
      });

      document.getElementById("copyAiBtn")?.addEventListener("click", async () => {
        const langNames = state.langs.join(", ");
        const payload = `You are my German grammar tutor for the Genau A1→B1 course (telc Deutsch B1 focus).
Contrast languages I want: ${langNames}.
Rules: Ask ONE item at a time and keep the answer key hidden. For a regular lesson, start with the eight core diagnostic items. If I score at least 7/8, tell me I can mark it Known ✔. Review any extra diagnostic items separately. Otherwise explain in short dual-coded chunks, drill exercises one by one, correct mistakes with the rule, and finish with the 5-minute writing prompt. For a consolidation lesson, follow its test and scoring instructions.

Here is lesson ${lesson.id}:

${md}`;
        try {
          await navigator.clipboard.writeText(payload);
          showToast("Lesson + AI tutor prompt copied! Paste into ChatGPT, Claude, or Gemini.");
        } catch {
          showToast("Could not access clipboard — open PROMPT.md to copy manually.");
        }
      });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    if (isCurrent()) {
      container.innerHTML = `<div class="notice">Could not load <code>${escapeHtml(path)}</code> (${escapeHtml(err.message)}).</div>`;
    }
  }
}

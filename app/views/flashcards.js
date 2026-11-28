import { ICONS } from "../data/assets.js";
import { ALL_LESSONS } from "../data/course.js";
import { addDaysISO, todayISO } from "../lib/dates.js";
import { escapeHtml } from "../lib/diagrams.js";
import { loadAllCards, queueTopicCards } from "../lib/docs.js";
import { buildDueQueue, buildPracticeQueue, computeNextScheduleRow, GENDER_SLOTS } from "../lib/flashcards-model.js";
import { formatInline } from "../lib/markdown.js";
import { getState, logActivity, resumeLesson, saveState, studyStreak } from "../store.js";
import { showToast, updatePrimaryNavActive } from "../ui/shell.js";
import { closeDrawerSidebar, renderSidebar } from "../ui/sidebar.js";

const fcSession = { mode: "due", queue: [], idx: 0, revealed: false, reviewed: 0, practiceTopic: "A1-01" };

function renderGenderStrip(genderKey) {
  const active = GENDER_SLOTS.find(slot => slot.key === genderKey);
  if (!active) return "";
  const slots = GENDER_SLOTS.map(
    slot =>
      `<span class="fc-g-slot${slot.key === genderKey ? " active" : ""}" data-g="${slot.key}"><span class="fc-g-art">${slot.article}</span><span class="fc-g-key">${slot.key}</span></span>`
  ).join("");
  return `<div class="fc-gender-strip" role="note" aria-label="Gender slot: ${active.article} (${active.label})">${slots}</div>`;
}

export async function openFlashcards({ isCurrent, onRetry }) {
  updatePrimaryNavActive();
  closeDrawerSidebar();
  renderSidebar("", document.getElementById("searchInput").value);
  const container = document.getElementById("mainContainer");

  if (window.location.protocol === "file:") {
    container.innerHTML = `<div class="notice">Browser flashcards require the hosted web app or a local HTTP server. For offline flashcards, import the ready-made Anki decks in <code>review/anki/</code>.</div>`;
    return;
  }

  container.innerHTML = `<div class="loading-state">Loading flashcards…</div>`;
  let cards;
  try {
    cards = await loadAllCards();
  } catch (err) {
    if (!isCurrent()) return;
    container.innerHTML = `<div class="notice">${escapeHtml(err.message)}
      <button class="top-btn" id="retryFlashcardsBtn" type="button" style="margin-inline-start:10px">Retry</button></div>`;
    document.getElementById("retryFlashcardsBtn")?.addEventListener("click", onRetry);
    return;
  }
  if (!isCurrent()) return;

  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));

  const refreshDueQueue = () => buildDueQueue(getState().schedule, cardMap);
  const refreshPracticeQueue = topicId => buildPracticeQueue(cards, topicId, getState().langs);

  if (fcSession.mode === "due") {
    fcSession.queue = refreshDueQueue();
    fcSession.idx = 0;
    fcSession.revealed = false;
  }

  function renderFc() {
    if (!isCurrent()) return;
    const state = getState();
    const today = todayISO();
    const totalQueued = Object.keys(state.schedule).length;
    const dueCount = Object.values(state.schedule).filter(r => r.due <= today).length;
    const totalReviews = Object.values(state.schedule).reduce((s, r) => s + (r.reviews || 0), 0);
    const totalCorrect = Object.values(state.schedule).reduce((s, r) => s + (r.correct || 0), 0);
    const acc = totalReviews ? `${Math.round((100 * totalCorrect) / totalReviews)}%` : "—";

    const curCard = fcSession.queue[fcSession.idx];
    const nextLesson = resumeLesson(state);
    const doneNotQueued = ALL_LESSONS.filter(
      l => ["●", "✔"].includes(state.progress[l.id]) && !Object.keys(state.schedule).some(id => id.startsWith(`${l.id}-`))
    ).length;
    const tomorrow = addDaysISO(1);
    const dueTomorrow = Object.values(state.schedule).filter(r => r.due === tomorrow).length;
    const todayAct = state.activity[today] || { cards: 0, lessons: [] };
    const streak = studyStreak(state.activity);

    const topicOptions = ALL_LESSONS.filter(l => !l.path.includes("consolidation"))
      .map(
        l =>
          `<option value="${l.id}" ${fcSession.practiceTopic === l.id ? "selected" : ""}>${l.id} · ${escapeHtml(l.title)}</option>`
      )
      .join("");

    let emptyHtml = "";
    if (!curCard && fcSession.mode === "due" && !totalQueued) {
      emptyHtml = `
        <div class="fc-empty first">
          <p class="fc-empty-title">No cards yet.</p>
          <p class="fc-empty-body">Cards join your review when you pass a lesson's check. You can also add a lesson's cards yourself and start remembering it today.</p>
          <div class="dx-actions">
            ${
              doneNotQueued
                ? `<button class="top-btn primary" id="addDoneBtn" type="button">${ICONS.cards}Add cards from your ${doneNotQueued} finished ${doneNotQueued === 1 ? "lesson" : "lessons"}</button>`
                : `<button class="top-btn primary" id="addNextBtn" type="button" data-topic="${nextLesson.id}">${ICONS.cards}Add ${nextLesson.id}'s cards</button>`
            }
            <a class="top-btn ghost" href="#doc=${encodeURIComponent(nextLesson.path)}">Open ${nextLesson.id} first</a>
          </div>
        </div>`;
    } else if (!curCard && fcSession.mode === "due") {
      const reviewedToday = Math.max(todayAct.cards, fcSession.reviewed);
      emptyHtml = `
        <div class="fc-empty done">
          <p class="fc-empty-title">${reviewedToday ? "Fertig für heute." : "Nothing due today."}</p>
          <p class="fc-empty-body">${
            reviewedToday
              ? `You reviewed ${reviewedToday} ${reviewedToday === 1 ? "card" : "cards"} today${todayAct.lessons.length ? ` and worked on ${todayAct.lessons.join(", ")}` : ""}.${streak > 1 ? ` That's ${streak} days in a row.` : ""}`
              : "Your cards come back on their own schedule, spaced further apart each time you remember them."
          }${dueTomorrow ? ` Tomorrow: ${dueTomorrow} ${dueTomorrow === 1 ? "card" : "cards"}.` : ""}</p>
          <div class="dx-actions">
            <a class="top-btn primary" href="#doc=${encodeURIComponent(nextLesson.path)}">Next: ${nextLesson.id} · ${escapeHtml(nextLesson.title)}${ICONS.arrowRight}</a>
          </div>
        </div>`;
    } else if (!curCard) {
      emptyHtml = `
        <div class="fc-empty">
          <p class="fc-empty-title">Topic finished.</p>
          <p class="fc-empty-body">Pick another topic above, or add this one to your review so it comes back at the right time.</p>
        </div>`;
    }

    container.innerHTML = `
      <div class="fc-panel">
        <div class="fc-head">
          <h1>Flashcards</h1>
          <a class="home-text-link" href="#doc=review%2Fanki%2FREADME.md">Prefer Anki? Get the decks</a>
        </div>
        ${totalQueued ? `<p class="fc-summary"><strong>${dueCount}</strong> due today · <strong>${totalQueued}</strong> in your review${totalReviews ? ` · <strong>${acc}</strong> remembered` : ""}</p>` : ""}

        <div class="status-seg fc-tabs" role="group" aria-label="Flashcard mode">
          <button class="status-btn ${fcSession.mode === "due" ? "active" : ""}" id="tabDue" type="button" aria-pressed="${fcSession.mode === "due"}">Today's review${dueCount ? ` (${dueCount})` : ""}</button>
          <button class="status-btn ${fcSession.mode === "practice" ? "active" : ""}" id="tabPractice" type="button" aria-pressed="${fcSession.mode === "practice"}">Practise a topic</button>
        </div>

        ${
          fcSession.mode === "practice"
            ? `
        <div class="fc-controls">
          <label class="sr-only" for="topicSelect">Topic</label>
          <select class="select" id="topicSelect">${topicOptions}</select>
          <button class="top-btn" id="startPracticeBtn" type="button">Load cards</button>
        </div>`
            : ""
        }

        ${
          curCard
            ? `
          <div class="flashcard" data-level="${curCard.id.split("-")[0]}">
            <div>
              <div class="fc-meta">
                <span class="fc-tag">${curCard.id}${curCard.lang ? ` · ${curCard.lang}` : ""}</span>
                <span>Card ${fcSession.idx + 1} of ${fcSession.queue.length}</span>
              </div>
              <div class="fc-q">${formatInline(curCard.Q, "README.md")}</div>
              ${
                fcSession.revealed
                  ? `<div class="fc-a" lang="de">${formatInline(curCard.A, "README.md")}</div>${renderGenderStrip(curCard.G)}`
                  : ""
              }
            </div>
            <div>
              ${
                !fcSession.revealed
                  ? `<button class="top-btn primary fc-wide" id="revealBtn" type="button">Show answer <span class="kbd">Space</span></button>`
                  : fcSession.mode === "due"
                    ? `<p class="grade-q" id="gradeQ">How well did you remember it?</p>
                      <div class="grade-row" role="group" aria-labelledby="gradeQ">
                        <button class="grade-btn g0" data-g="0" type="button"><span>Forgot <span class="kbd">0</span></span><small>see it tomorrow</small></button>
                        <button class="grade-btn g1" data-g="1" type="button"><span>Hard <span class="kbd">1</span></span><small>sooner</small></button>
                        <button class="grade-btn g2" data-g="2" type="button"><span>Good <span class="kbd">2</span></span><small>next step</small></button>
                        <button class="grade-btn g3" data-g="3" type="button"><span>Easy <span class="kbd">3</span></span><small>skip a step</small></button>
                      </div>`
                    : `<button class="top-btn primary fc-wide" id="nextPracticeBtn" type="button">Next card ${ICONS.arrowRight} <span class="kbd">Space</span></button>`
              }
            </div>
          </div>
        `
            : emptyHtml
        }

        ${
          fcSession.mode === "due" && totalQueued
            ? `
        <details class="fc-add">
          <summary>${ICONS.chevRight}<span>Add a topic to your review</span></summary>
          <div class="fc-controls">
            <label class="sr-only" for="topicSelect">Topic</label>
            <select class="select" id="topicSelect">${topicOptions}</select>
            <button class="top-btn" id="addTopicBtn" type="button">Add its cards</button>
            ${doneNotQueued ? `<button class="top-btn ghost" id="addDoneBtn" type="button">Add all finished lessons (${doneNotQueued})</button>` : ""}
          </div>
        </details>`
            : ""
        }
      </div>
    `;

    document.getElementById("tabDue")?.addEventListener("click", () => {
      fcSession.mode = "due";
      fcSession.queue = refreshDueQueue();
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    document.getElementById("tabPractice")?.addEventListener("click", () => {
      fcSession.mode = "practice";
      fcSession.queue = refreshPracticeQueue(fcSession.practiceTopic);
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    document.getElementById("topicSelect")?.addEventListener("change", e => {
      fcSession.practiceTopic = e.target.value;
      if (fcSession.mode === "practice") {
        fcSession.queue = refreshPracticeQueue(fcSession.practiceTopic);
        fcSession.idx = 0;
        fcSession.revealed = false;
        renderFc();
      }
    });

    document.getElementById("addTopicBtn")?.addEventListener("click", async () => {
      const tid = document.getElementById("topicSelect").value;
      const n = await queueTopicCards(tid);
      showToast(n ? `Queued ${n} cards for ${tid}` : `${tid} cards already queued`);
      fcSession.queue = refreshDueQueue();
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    const addNextBtn = document.getElementById("addNextBtn");
    addNextBtn?.addEventListener("click", async () => {
      const topic = addNextBtn.dataset.topic;
      const n = await queueTopicCards(topic);
      showToast(n ? `${n} cards from ${topic} are ready.` : `${topic} cards were already in your review.`);
      fcSession.queue = refreshDueQueue();
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    document.getElementById("addDoneBtn")?.addEventListener("click", async () => {
      const st = getState();
      let total = 0;
      for (const l of ALL_LESSONS) {
        if (["●", "✔"].includes(st.progress[l.id])) {
          total += await queueTopicCards(l.id);
        }
      }
      showToast(total ? `Queued ${total} cards from completed lessons` : "No new cards from completed lessons");
      fcSession.queue = refreshDueQueue();
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    document.getElementById("startPracticeBtn")?.addEventListener("click", () => {
      fcSession.practiceTopic = document.getElementById("topicSelect").value;
      fcSession.queue = refreshPracticeQueue(fcSession.practiceTopic);
      fcSession.idx = 0;
      fcSession.revealed = false;
      renderFc();
    });

    document.getElementById("revealBtn")?.addEventListener("click", () => {
      fcSession.revealed = true;
      renderFc();
    });

    document.getElementById("nextPracticeBtn")?.addEventListener("click", () => {
      fcSession.idx++;
      fcSession.revealed = false;
      fcSession.reviewed++;
      renderFc();
    });

    for (const btn of container.querySelectorAll(".grade-btn")) {
      btn.addEventListener("click", () => {
        const g = Number(btn.dataset.g);
        const st = getState();
        const row = st.schedule[curCard.id];
        if (row) st.schedule[curCard.id] = computeNextScheduleRow(row, g);
        logActivity("card");
        saveState("grade");
        fcSession.idx++;
        fcSession.revealed = false;
        fcSession.reviewed++;
        renderFc();
      });
    }
  }

  renderFc();
}

export function handleFlashcardKeydown(e) {
  if (location.hash !== "#flashcards") return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (e.code === "Space" || e.key === "Enter") {
    const rev = document.getElementById("revealBtn");
    const nxt = document.getElementById("nextPracticeBtn");
    if (rev) {
      e.preventDefault();
      rev.click();
    } else if (nxt) {
      e.preventDefault();
      nxt.click();
    }
  } else if (["0", "1", "2", "3"].includes(e.key)) {
    const btn = document.querySelector(`.grade-btn[data-g="${e.key}"]`);
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  }
}

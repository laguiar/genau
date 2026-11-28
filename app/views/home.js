import { FLAGS, ICONS, LANG_META, LANGUAGES } from "../data/assets.js";
import { ALL_LESSONS, COURSE } from "../data/course.js";
import { todayISO } from "../lib/dates.js";
import { escapeHtml } from "../lib/diagrams.js";
import { getDueCount } from "../lib/flashcards-model.js";
import { getState, hasStarted, nextLessonFor, resumeLesson, saveState, studyStreak } from "../store.js";
import { renderLangPills, showToast, updatePrimaryNavActive } from "../ui/shell.js";
import { closeDrawerSidebar, renderSidebar } from "../ui/sidebar.js";

const LEVELS = [
  {
    code: "A1",
    cls: "a1",
    title: "Foundations",
    list: COURSE.A1,
    desc: "Sentence skeleton, verb-second word order, gender, Nominativ and Akkusativ, first past forms."
  },
  {
    code: "A2",
    cls: "a2",
    title: "Core Structures",
    list: COURSE.A2,
    desc: "Dativ, two-way prepositions, adjective endings, subordinate clauses, Konjunktiv II, relative clauses."
  },
  {
    code: "B1",
    cls: "b1",
    title: "Exam Readiness",
    list: COURSE.B1,
    desc: "Genitiv, Passiv, two-part connectors, Sprachbausteine patterns, telc B1 writing and reading strategy."
  }
];

export function renderHome() {
  const state = getState();
  updatePrimaryNavActive();
  renderSidebar("README.md", document.getElementById("searchInput").value);
  closeDrawerSidebar();

  const totalDone = ALL_LESSONS.filter(l => ["●", "✔"].includes(state.progress[l.id])).length;
  const nextOverall = resumeLesson(state);
  const due = getDueCount(state.schedule);
  const queued = Object.keys(state.schedule).length;
  const returning = totalDone > 0 || queued > 0 || Object.keys(state.diagnostics).length > 0;
  const lastDx = state.diagnostics[nextOverall.id];
  const today = state.activity[todayISO()];
  const streak = studyStreak(state.activity);
  const lessonHref = `#doc=${encodeURIComponent(nextOverall.path)}`;

  const contents = LEVELS.map(lv => {
    const done = lv.list.filter(l => ["●", "✔"].includes(state.progress[l.id])).length;
    const target = nextLessonFor(lv.list, state.progress);
    const cta =
      done === 0 ? `Start ${target.id}` : done === lv.list.length ? `Review ${lv.code}` : `Continue ${target.id}`;
    return `
      <li class="toc-row">
        <a href="#doc=${encodeURIComponent(target.path)}">
          <span class="level-code ${lv.cls}">${lv.code}</span>
          <span class="toc-main">
            <span class="toc-title">${lv.title}</span>
            <span class="toc-desc">${lv.desc}</span>
          </span>
          <span class="toc-progress"><span class="toc-count">${done} of ${lv.list.length}</span>
            <span class="level-bar" aria-hidden="true"><span style="width:${Math.round((done / lv.list.length) * 100)}%"></span></span></span>
          <span class="toc-cta">${cta}${ICONS.arrowRight}</span>
        </a>
      </li>`;
  }).join("");

  const primary =
    due > 0
      ? `<a class="top-btn primary big" href="#flashcards">${ICONS.cards}<span>Review ${due} due ${due === 1 ? "card" : "cards"}</span></a>`
      : `<a class="top-btn primary big" href="${lessonHref}"><span>${hasStarted(nextOverall, state) ? "Continue" : "Start"} ${nextOverall.id}: ${escapeHtml(nextOverall.title)}</span>${ICONS.arrowRight}</a>`;

  const step = (mins, title, body, tone = "") => `
    <li class="plan-step ${tone}">
      <span class="plan-min">${mins}</span>
      <div><p class="plan-title">${title}</p><p class="plan-body">${body}</p></div>
    </li>`;

  const plan = `
    <ol class="plan">
      ${step(
        "5 min",
        "Review cards",
        due > 0
          ? `<a href="#flashcards">${due} ${due === 1 ? "card is" : "cards are"} due today.</a>`
          : queued > 0
            ? "Nothing due today. Your next cards come back on their own schedule."
            : "Cards arrive when you pass a lesson's check, so this step starts empty.",
        due > 0 ? "" : "quiet"
      )}
      ${step(
        "20 min",
        `<a href="${lessonHref}">${nextOverall.id} · ${escapeHtml(nextOverall.title)}</a>`,
        lastDx
          ? `Last check: ${lastDx.score} of ${lastDx.total}. Study the rule, then take it again.`
          : "Open with the eight-item check. Score 7 or more and you can mark it Known and move on."
      )}
      ${step(
        "5 min",
        "Write five sentences",
        "Use today's structure in a short text. For live practice, copy the lesson for an AI tutor from its ⋯ menu."
      )}
    </ol>`;

  const langChooser = state.langsChosen
    ? ""
    : `
    <div class="lang-first" role="group" aria-labelledby="langFirstTitle">
      <p class="lang-first-title" id="langFirstTitle">Which of these languages do you know?</p>
      <p class="lang-first-body">Lessons explain German in English and add short notes where a language you know helps, or sets a trap. You can change this later under Contrasts.</p>
      <div class="lang-first-chips">
        ${LANGUAGES.map(
          code =>
            `<button type="button" class="lang-choice${state.langs.includes(code) ? " active" : ""}" data-lang="${code}" aria-pressed="${state.langs.includes(code)}">${FLAGS[code]}<span>${LANG_META[code].name}</span><svg class="svg-icon lang-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></button>`
        ).join("")}
      </div>
    </div>`;

  const container = document.getElementById("mainContainer");
  container.innerHTML = `
    <section class="home-hero">
      <h1 class="home-title">${returning ? "Willkommen zurück." : "Genau."} <em>${returning ? "Here is today's half hour." : "German grammar from A1 to B1, built to stick."}</em></h1>
      ${
        returning
          ? ""
          : `<p class="home-lead">
        A free self-study course for the <strong>telc Deutsch B1</strong> exam, equally useful for Goethe, ÖSD and DTZ.
        Each lesson opens with a short check, teaches the rule with case-coloured diagrams, and feeds spaced-repetition cards — built on retrieval practice, spacing, interleaving, and L2 acquisition research (<a class="home-text-link" href="#doc=METHOD.md">read the method and references</a>). Thirty minutes a day.
      </p>`
      }
      ${langChooser}
      <div class="home-cta-row">
        ${primary}
        ${due > 0 ? `<a class="home-text-link" href="${lessonHref}">or go straight to ${nextOverall.id}</a>` : ""}
      </div>
      ${today && (today.cards || today.lessons.length) ? `<p class="home-today-note">Today so far: ${today.cards} ${today.cards === 1 ? "card" : "cards"}${today.lessons.length ? `, ${today.lessons.join(", ")}` : ""}${streak > 1 ? ` · ${streak}-day streak` : ""}</p>` : ""}
    </section>

    <section class="home-section" aria-labelledby="planTitle">
      <div class="home-sec-head">
        <h2 class="home-sec-title" id="planTitle">${returning ? "Today's 30 minutes" : "How a day works"}</h2>
        <a class="home-sec-link" href="#doc=METHOD.md">Why this order works ${ICONS.arrowRight}</a>
      </div>
      ${plan}
    </section>

    <section class="home-section" aria-labelledby="tocTitle">
      <div class="home-sec-head">
        <h2 class="home-sec-title" id="tocTitle">Contents</h2>
        <a class="home-sec-link" href="#doc=PLAN.md">All ${ALL_LESSONS.length} lessons ${ICONS.arrowRight}</a>
      </div>
      <ol class="toc">${contents}</ol>
    </section>

    <section class="home-section" aria-labelledby="alsoTitle">
      <h2 class="home-sec-title" id="alsoTitle">Also in Genau</h2>
      <ul class="also-list">
        <li><a href="#practice=home">B1 exam practice</a><span>Timed listening with audio, speaking role cards, and letter-writing with revision.</span></li>
        <li><a href="#doc=shared%2Fcases.md">Reference sheets and mock exams</a><span>Case tables, noun gender guide, irregular verbs, word-order charts, the Sprachbausteine bank, two timed B1 mocks.</span></li>
        <li><a href="#doc=review%2Fanki%2FREADME.md">Anki decks</a><span>Ready-made decks for A1, A2, B1 and each contrast language.</span></li>
        <li><a href="#doc=PROMPT.md">AI tutor prompt</a><span>Drill any lesson one item at a time with ChatGPT, Claude or Gemini.</span></li>
        <li><a href="https://github.com/laguiar/genau" target="_blank" rel="noopener noreferrer">Source on GitHub</a><span>Every lesson is plain Markdown. Download it for Obsidian or study offline.</span></li>
      </ul>
    </section>

    <section class="home-section">
      <p class="home-colophon">
        <strong>Sources and license.</strong> Grammar inventory aligned with <em>Profile deutsch</em> (Glaboniat et al., CEFR A1–B1), paired with free <a href="https://learngerman.dw.com/de/nicos-weg/c-36519687" target="_blank" rel="noopener noreferrer">DW Nicos Weg</a> lessons and the telc Deutsch B1 handbooks. Your progress and cards stay in this browser; use Backup in the sidebar to keep a copy. Free to use, copy and adapt for personal learning and teaching.
      </p>
    </section>
  `;

  for (const btn of container.querySelectorAll(".lang-choice")) {
    btn.addEventListener("click", () => {
      const code = btn.dataset.lang;
      const on = state.langs.includes(code);
      if (on && state.langs.length === 1) {
        showToast("Keep at least one language on.");
        return;
      }
      state.langs = on ? state.langs.filter(l => l !== code) : [...state.langs, code];
      btn.classList.toggle("active", !on);
      btn.setAttribute("aria-pressed", String(!on));
      state.langsChosen = true;
      saveState("langs");
      renderLangPills();
    });
  }

  container.querySelector(".home-cta-row .primary")?.addEventListener("click", () => {
    if (!state.langsChosen) {
      state.langsChosen = true;
      saveState("langs");
    }
  });

  window.scrollTo({ top: 0, behavior: "instant" });
}

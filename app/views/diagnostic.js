import { ICONS } from "../data/assets.js";
import { todayISO } from "../lib/dates.js";
import { guessMatches, matchBestRuleBlock, stripMdInline, tokenizeRuleText } from "../lib/diagnostic-model.js";
import { escapeHtml } from "../lib/diagrams.js";
import { queueTopicCards } from "../lib/docs.js";
import { formatInline } from "../lib/markdown.js";
import { getState, logActivity, saveState } from "../store.js";
import { showToast } from "../ui/shell.js";

const GERMAN_KEYS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

export function mountDiagnostic(article, lesson, dx, baseFile, onStatus) {
  const h2 = [...article.querySelectorAll("h2")].find(h => /Diagnostic/i.test(h.textContent));
  if (!h2) return;

  // The static list stays for print; the screen gets the one-at-a-time check.
  let node = h2.nextElementSibling;
  while (node && node.tagName !== "H2") {
    node.classList.add("dx-static");
    node = node.nextElementSibling;
  }

  const root = document.createElement("section");
  root.className = "dx";
  root.setAttribute("aria-label", `${lesson.id} diagnostic`);
  root.innerHTML = `<div class="dx-body"></div><p class="sr-only" aria-live="polite"></p>`;
  const view = root.querySelector(".dx-body");
  const live = root.querySelector("[aria-live]");
  const announce = text => {
    live.textContent = "";
    requestAnimationFrame(() => {
      live.textContent = text;
    });
  };

  const ruleFigure = article.querySelector("figure.diagram");
  const ruleHeading = [...article.querySelectorAll("h2")].find(h => /rule in words/i.test(h.textContent));
  const watchHeading = [...article.querySelectorAll("h2")].find(h => /watch out/i.test(h.textContent));

  const ruleBlocks = [];
  for (const startH2 of [ruleHeading, watchHeading]) {
    if (!startH2) continue;
    let cur = startH2.nextElementSibling;
    while (cur && cur.tagName !== "H2") {
      if (cur.tagName === "P") {
        if (cur.textContent.trim().length > 25) ruleBlocks.push(cur);
      } else if (cur.tagName === "UL" || cur.tagName === "OL") {
        for (const li of cur.querySelectorAll(":scope > li")) {
          if (li.textContent.trim().length > 25) ruleBlocks.push(li);
        }
      }
      cur = cur.nextElementSibling;
    }
  }

  const indexedRuleBlocks = ruleBlocks.map(el => ({
    el,
    tokens: new Set(tokenizeRuleText(el.textContent)),
    emph: new Set([...el.querySelectorAll("strong, em, code")].flatMap(n => tokenizeRuleText(n.textContent)))
  }));

  h2.after(root);

  const total = dx.items.length;
  let idx = 0;
  let results = [];

  const pips = () =>
    `<ol class="dx-pips" aria-hidden="true">${dx.items
      .map(
        (_, i) =>
          `<li class="${results[i] === true ? "ok" : results[i] === false ? "miss" : i === idx ? "now" : ""}"></li>`
      )
      .join("")}</ol>`;

  function focusFirst(sel) {
    const el = root.querySelector(sel);
    if (el) el.focus({ preventScroll: true });
  }

  function intro() {
    const state = getState();
    const last = state.diagnostics[lesson.id];
    view.innerHTML = `
      <p class="dx-lede">${dx.instruction ? `${formatInline(dx.instruction, baseFile)} ` : ""}Eight quick items, about three minutes. Answer from memory: each answer shows right after you try.</p>
      ${last ? `<p class="dx-last">Last time: <strong>${last.score} of ${last.total}</strong> on ${escapeHtml(last.date)}.</p>` : ""}
      <div class="dx-actions">
        <button type="button" class="top-btn primary" data-act="start">${last ? "Take it again" : "Start the check"}${ICONS.arrowRight}</button>
        <button type="button" class="top-btn ghost" data-act="skip">I'm new to this, teach me first</button>
      </div>`;
  }

  function askItem() {
    view.innerHTML = `
      <div class="dx-head"><span class="dx-count">Item ${idx + 1} of ${total}</span>${pips()}</div>
      <form class="dx-form" novalidate>
        <label class="dx-prompt" for="dxInput-${lesson.id}" lang="de">${formatInline(dx.items[idx], baseFile)}</label>
        <div class="dx-row">
          <input id="dxInput-${lesson.id}" class="dx-input" type="text" lang="de" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Your answer">
          <button type="submit" class="top-btn primary">Check</button>
        </div>
        <div class="dx-keys" role="group" aria-label="Insert German letters">
          ${GERMAN_KEYS.map(ch => `<button type="button" class="dx-key" data-ch="${ch}" tabindex="-1">${ch}</button>`).join("")}
        </div>
      </form>
      <button type="button" class="link-quiet" data-act="dontknow">I don't know this one</button>`;
    focusFirst(".dx-input");
  }

  function feedback(guess) {
    const answer = dx.answers[idx];
    const right = guessMatches(guess, answer);
    const youSaid = guess.trim() ? `<p class="dx-you">You wrote <span lang="de">${escapeHtml(guess.trim())}</span></p>` : "";

    if (right) {
      results[idx] = true;
      view.innerHTML = `
        <div class="dx-head"><span class="dx-count">Item ${idx + 1} of ${total}</span>${pips()}</div>
        <p class="dx-prompt dx-prompt-sm" lang="de">${formatInline(dx.items[idx], baseFile)}</p>
        <div class="dx-verdict ok" role="status"><strong>Richtig.</strong> <span lang="de">${formatInline(answer, baseFile)}</span></div>
        <div class="dx-actions"><button type="button" class="top-btn primary" data-act="next">${idx + 1 < total ? "Next item" : "See my result"}${ICONS.arrowRight}</button></div>`;
      announce(`Richtig: ${stripMdInline(answer)}`);
      focusFirst("[data-act=next]");
      return;
    }

    const matchedRule = matchBestRuleBlock(indexedRuleBlocks, dx.items[idx], answer);
    const hasPeek = Boolean(matchedRule || ruleFigure);
    const peekLabel = matchedRule ? "See the rule" : "Lesson rule overview";

    view.innerHTML = `
      <div class="dx-head"><span class="dx-count">Item ${idx + 1} of ${total}</span>${pips()}</div>
      <p class="dx-prompt dx-prompt-sm" lang="de">${formatInline(dx.items[idx], baseFile)}</p>
      <div class="dx-verdict miss" role="status">
        <span class="dx-verdict-label">${guess.trim() ? "Not quite" : "Here's the answer"}</span>
        <p class="dx-answer" lang="de">${formatInline(answer, baseFile)}</p>
        ${youSaid}
      </div>
      ${hasPeek ? `<details class="dx-peek"><summary>${ICONS.chevRight}<span>${peekLabel}</span></summary><div class="dx-peek-body"></div>${ruleHeading ? `<button type="button" class="link-quiet" data-act="words">Read the rule in words</button>` : ""}</details>` : ""}
      <p class="dx-honest">${guess.trim() ? "Only a typo, or another correct form? Count it yourself." : ""}</p>
      <div class="dx-actions">
        <button type="button" class="top-btn primary" data-act="miss">${idx + 1 < total ? "Next item" : "See my result"}${ICONS.arrowRight}</button>
        ${guess.trim() ? `<button type="button" class="top-btn" data-act="count">${ICONS.check}I had it right</button>` : ""}
      </div>`;

    const peek = root.querySelector(".dx-peek-body");
    if (peek) {
      if (matchedRule) {
        const box = document.createElement("div");
        box.className = "dx-peek-rule";
        const p = document.createElement("p");
        p.innerHTML = matchedRule.innerHTML;
        box.append(p);
        peek.replaceChildren(box);
      } else if (ruleFigure) {
        peek.replaceChildren(ruleFigure.cloneNode(true));
      }
    }
    announce(`${guess.trim() ? "Not quite" : "Answer"}: ${stripMdInline(answer)}`);
    focusFirst("[data-act=miss]");
  }

  function result() {
    const state = getState();
    const score = results.filter(Boolean).length;
    const passed = score >= 7;
    state.diagnostics[lesson.id] = { score, total, date: todayISO() };
    logActivity("lesson", lesson.id);
    const before = state.progress[lesson.id] || "☐";
    if (!passed && before === "☐") onStatus("◐", true);
    saveState("diagnostic");

    const missed = dx.items.map((item, i) => ({ item, answer: dx.answers[i], ok: results[i] })).filter(r => !r.ok);
    view.innerHTML = `
      <div class="dx-score ${passed ? "pass" : ""}" role="status">
        <span class="dx-score-num">${score}<span>/${total}</span></span>
        <div>
          <p class="dx-score-title">${passed ? "You already know this." : score >= 5 ? "Close. A short study pass will fix it." : "Good: now you know exactly what to study."}</p>
          <p class="dx-score-sub">${
            passed
              ? `Mark ${lesson.id} as Known and its cards go into your review queue. You can still read the lesson.`
              : `${before === "☐" ? `${lesson.id} is now In progress. ` : ""}Read the rule, do the exercises, then take the check again.`
          }</p>
        </div>
      </div>
      ${
        missed.length
          ? `<details class="dx-missed"${passed ? "" : " open"}><summary>${ICONS.chevRight}<span>${missed.length === 1 ? "The one you missed" : `The ${missed.length} you missed`}</span></summary>
        <ol>${missed.map(m => `<li><span lang="de">${formatInline(m.item, baseFile)}</span><span class="dx-missed-a" lang="de">→ ${formatInline(m.answer, baseFile)}</span></li>`).join("")}</ol></details>`
          : ""
      }
      <div class="dx-actions">
        ${
          passed
            ? `<button type="button" class="top-btn primary" data-act="known">${ICONS.check}Mark Known and add cards</button>
               <button type="button" class="top-btn ghost" data-act="study">Read the lesson anyway</button>`
            : `<button type="button" class="top-btn primary" data-act="study">Study the rule${ICONS.arrowRight}</button>
               <button type="button" class="top-btn ghost" data-act="start">Take it again</button>`
        }
      </div>`;
    announce(`Score ${score} of ${total}.`);
    focusFirst(".dx-actions .primary");
  }

  function toRule() {
    const target =
      [...article.querySelectorAll("h2")].find(h => /rule in one picture|rule in words/i.test(h.textContent)) ||
      h2.nextElementSibling;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  root.addEventListener("click", async e => {
    const key = e.target.closest(".dx-key");
    if (key) {
      const input = root.querySelector(".dx-input");
      const at = input.selectionStart ?? input.value.length;
      input.setRangeText(key.dataset.ch, at, input.selectionEnd ?? at, "end");
      input.focus();
      return;
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (!act) return;
    if (act === "start") {
      idx = 0;
      results = [];
      askItem();
    } else if (act === "skip") {
      if ((getState().progress[lesson.id] || "☐") === "☐") onStatus("◐", false);
      toRule();
    } else if (act === "dontknow") {
      results[idx] = false;
      feedback("");
    } else if (act === "count" || act === "miss" || act === "next") {
      if (act === "count") results[idx] = true;
      if (act === "miss") results[idx] = false;
      idx += 1;
      if (idx < total) askItem();
      else result();
    } else if (act === "known") {
      onStatus("✔", false);
      try {
        const added = await queueTopicCards(lesson.id);
        showToast(
          added > 0
            ? `${lesson.id} is Known. ${added} cards added to review.`
            : `${lesson.id} is Known. Its cards were already in review.`
        );
      } catch (err) {
        showToast(err.message);
      }
      intro();
    } else if (act === "study") {
      toRule();
    } else if (act === "words" && ruleHeading) {
      ruleHeading.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  root.addEventListener("submit", e => {
    e.preventDefault();
    const input = root.querySelector(".dx-input");
    const value = input.value;
    if (!value.trim()) {
      input.focus();
      return;
    }
    feedback(value);
  });

  intro();
}

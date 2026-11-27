import { createLetterKeys } from "../app/ui/german-keys.js";
import * as M from "./model.js";

function element(tag, text, props = {}) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  return Object.assign(el, props);
}

function link(text, page) {
  return element("a", text, { href: `#practice=${page}`, className: "top-btn" });
}

function action(text, invoke, primary = false) {
  const button = element("button", text, { type: "button", className: `top-btn${primary ? " primary" : ""}` });
  button.addEventListener("click", invoke);
  return button;
}

function label(text, field) {
  const el = element("label", text);
  el.append(field);
  return el;
}

function progressHead(set, session, current) {
  const head = element("div", undefined, { className: "dx-head" });
  head.append(element("span", `Question ${set.items.indexOf(current) + 1} of ${set.items.length}`, { className: "dx-count" }));
  const pips = element("ol", undefined, { className: "dx-pips" });
  pips.setAttribute("aria-hidden", "true");
  for (const question of set.items) {
    const attempt = session.answers[question.id];
    const state =
      question === current && !attempt
        ? "now"
        : attempt
          ? M.correctAnswer(question, attempt.text)
            ? "ok"
            : "miss"
          : "";
    pips.append(element("li", undefined, { className: state }));
  }
  head.append(pips);
  return head;
}

function list(tag, texts) {
  const el = element(tag);
  el.append(...texts.map(text => element("li", text)));
  return el;
}

function correctLabel(value) {
  return value === "true" ? "Richtig" : "Falsch";
}

const formatDate = at => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(at);
const formatDue = at => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(at);

export function mount({ container, page, bank, getPractice, savePractice }) {
  const panel = element("section", undefined, { className: "fc-panel practice-panel" });
  const status = element("p", undefined, { className: "practice-status" });
  status.setAttribute("role", "status");
  const content = element("div");
  const nav = element("div", undefined, { className: "practice-actions" });
  if (page !== "home") nav.append(link("← All practice", "home"));
  panel.append(nav, status, content);
  container.replaceChildren(panel);

  let cleanup = () => {};
  let feedbackId;
  let destroyed = false;

  function update(edit) {
    const next = structuredClone(getPractice());
    edit(next);
    if (savePractice(next)) return true;
    status.textContent = "Your browser could not save this change. Try again before leaving.";
    return false;
  }

  function updateSession(set, edit) {
    return update(next => edit(M.sessionFor(next, set)));
  }

  function renderScore(set, session, grammar) {
    const result = M.score(set, session);
    if (result) {
      content.append(
        element(
          "p",
          `${result.firstCorrect}/${result.total}${
            grammar
              ? ` correct on the first attempt without hints.${result.assisted ? ` Hints used on ${result.assisted}.` : ""}`
              : " correct on the timed attempt."
          }`
        )
      );
      if (grammar && set.kind === "diagnostic" && result.firstCorrect >= 7) {
        content.append(element("p", "Diagnostic met the 7/8 Known threshold. Check retention with the follow-up."));
      }
    } else {
      content.append(element("p", "This practice set gives feedback on every answer. It isn't scored."));
    }
  }

  function showHome() {
    content.replaceChildren(element("h1", "Practice"));
    const cards = element("div", undefined, { className: "practice-grid" });
    content.append(cards);
    const createCard = (heading, text) => {
      const card = element("section", undefined, { className: "practice-card" });
      card.append(element("h2", heading), element("p", text));
      cards.append(card);
      return card;
    };
    const practice = getPractice();
    for (const set of bank.grammar.filter(set => set.kind === "diagnostic")) {
      const card = createCard(
        set.title,
        "Answer eight questions, then check the same rules in new sentences seven days later."
      );
      const diagnostic = M.sessionFor(practice, set);
      const firstScore = M.score(set, diagnostic);
      card.append(
        link(diagnostic?.finishedAt ? "View diagnostic feedback" : diagnostic ? "Continue diagnostic" : "Start diagnostic", set.id)
      );
      if (firstScore) card.append(element("p", `Diagnostic: ${firstScore.firstCorrect}/${firstScore.total} without hints.`));
      if (diagnostic?.finishedAt && !firstScore) card.append(element("p", "Diagnostic completed for practice."));
      const follow = bank.grammar.find(other => other.follows === set.id);
      const due = M.followUpDue(practice, bank, follow);
      const delayed = M.sessionFor(practice, follow);
      const delayedScore = M.score(follow, delayed);
      if (due && due <= Date.now()) {
        card.append(link(delayed?.finishedAt ? "View follow-up feedback" : "Seven-day follow-up", follow.id));
      }
      if (due && due > Date.now()) card.append(element("p", `Follow-up available ${formatDue(due)}.`));
      if (delayedScore) card.append(element("p", `Follow-up: ${delayedScore.firstCorrect}/${delayedScore.total} without hints.`));
      if (delayed?.finishedAt && !delayedScore) card.append(element("p", "Follow-up completed for practice."));
    }
    for (const set of bank.listening) {
      const card = createCard("B1 listening", "Listen to five short announcements and answer true or false under time.");
      card.append(link(M.sessionFor(practice, set)?.finishedAt ? "View listening feedback" : "Open listening practice", set.id));
    }
    for (const prompt of bank.speaking) {
      const card = createCard(
        "B1 speaking",
        "Rehearse alone or use two role cards with a partner. Record feedback from paired practice."
      );
      card.append(link("Open speaking practice", prompt.id));
      if (practice.speaking[prompt.id]) {
        card.append(element("p", `Paired feedback saved ${formatDate(practice.speaking[prompt.id].at)}.`));
      }
    }
    for (const prompt of bank.writing) {
      const card = createCard("B1 writing", "Keep your first draft, get feedback, and compare your revision.");
      card.append(link("Open writing practice", prompt.id));
    }
    const reviews = M.pendingRuleReviews(practice, bank);
    if (reviews.length) {
      content.append(element("h2", "Review rules from earlier answers"));
      const reviewList = element("ul", undefined, { className: "practice-reviews" });
      for (const { set, due } of reviews) {
        const entry = element("li");
        entry.append(due <= Date.now() ? link(set.title, set.id) : element("span", `${set.title} · ${formatDue(due)}`));
        reviewList.append(entry);
      }
      content.append(reviewList);
    }
  }

  function showGrammar(set) {
    content.replaceChildren(element("h1", set.title));
    const practice = getPractice();
    const session = M.sessionFor(practice, set);
    if (!session && set.kind === "follow-up") {
      const due = M.followUpDue(practice, bank, set);
      if (!due || due > Date.now()) {
        content.append(
          element("p", due ? `Available ${formatDue(due)}.` : "Complete the first diagnostic to schedule this follow-up.")
        );
        return;
      }
    }
    if (!session && set.kind === "rule-review") {
      const review = M.pendingRuleReviews(practice, bank).find(entry => entry.set.id === set.id);
      if (!review || review.due > Date.now()) {
        content.append(
          element(
            "p",
            review ? `Available ${formatDue(review.due)}.` : "This review is scheduled after a missed answer on the rule."
          )
        );
        return;
      }
    }
    if (!session) {
      content.append(
        element(
          "p",
          M.isReviewed(set)
            ? "Submit one answer at a time. The diagnostic records your first unassisted answers."
            : "A practice set: you get feedback on every answer, but nothing here counts toward a score."
        )
      );
      content.append(
        action(
          "Begin",
          () => {
            if (
              update(next => {
                next.sessions[M.sessionKey(set)] = M.startSession(set, "grammar", Date.now(), next);
              })
            ) {
              showGrammar(set);
            }
          },
          true
        )
      );
      return;
    }
    const feedback = set.items.find(item => item.id === feedbackId);
    const pending = session.finishedAt === null && set.items.find(item => !session.answers[item.id]);
    const item = feedback || pending;
    if (!item) {
      renderScore(set, session, true);
      const answers = element("ol", undefined, { className: "practice-results" });
      for (const question of set.items) {
        const attempt = session.answers[question.id];
        const detail = element("li");
        detail.append(
          element("strong", question.prompt),
          element(
            "p",
            attempt
              ? `First answer: ${attempt.text || "Skipped"}${attempt.assisted ? " · Hint used" : ""}${
                  M.correctAnswer(question, attempt.text) ? " · Correct" : " · Review"
                }`
              : "Unanswered"
          ),
          element("p", `Accepted: ${question.accepted.join(" / ")}. ${question.explanation}`),
          element("small", `Item ${question.id}`)
        );
        if (attempt && attempt.retry !== null) {
          detail.append(
            element("p", `Retry: ${attempt.retry}${M.correctAnswer(question, attempt.retry) ? " · Correct" : " · Review"}`)
          );
        }
        answers.append(detail);
      }
      content.append(answers, link("Back to practice", "home"));
      return;
    }
    const prompt = element("h2", item.prompt, { className: "dx-prompt" });
    prompt.lang = "de";
    content.append(progressHead(set, session, item), prompt);
    const answer = session.answers[item.id];
    if (!answer) {
      const form = element("form");
      const field = element("input", undefined, {
        type: "text",
        maxLength: M.ANSWER_LIMIT,
        autocomplete: "off",
        spellcheck: false
      });
      field.lang = "de";
      form.append(
        label("Your answer", field),
        createLetterKeys(field),
        element("button", "Check answer", { className: "top-btn primary" })
      );
      function submit(text) {
        const now = Date.now();
        if (
          updateSession(set, draft => {
            if (M.recordFirst(draft, item, text, now) && set.items.every(question => draft.answers[question.id])) {
              draft.finishedAt = now;
            }
          })
        ) {
          feedbackId = item.id;
          showGrammar(set);
        }
      }
      form.addEventListener("submit", event => {
        event.preventDefault();
        if (field.value.trim()) submit(field.value);
        else status.textContent = "Enter an answer or choose Skip.";
      });
      const actions = element("div", undefined, { className: "practice-actions" });
      if (!session.hints.includes(item.id)) {
        actions.append(
          action("Show hint", () => {
            if (
              updateSession(set, draft => {
                draft.hints.push(item.id);
              })
            ) {
              actions.prepend(element("p", item.hint));
              actions.querySelector("button").remove();
            }
          })
        );
      } else {
        actions.append(element("p", item.hint));
      }
      actions.append(action("Skip", () => submit("")));
      content.append(form, actions);
      field.focus();
      return;
    }
    const right = M.correctAnswer(item, answer.text);
    const retried = answer.retry !== null;
    const retryRight = retried && M.correctAnswer(item, answer.retry);
    const verdict = element("div", undefined, { className: `dx-verdict ${right || retryRight ? "ok" : "miss"}` });
    verdict.setAttribute("role", "status");
    if (right) {
      verdict.append(element("strong", "Richtig."), document.createTextNode(` ${answer.text}`));
    } else {
      verdict.append(
        element("span", retried ? (retryRight ? "Right on the second try" : "Still not quite") : answer.text ? "Not quite" : "Skipped", {
          className: "dx-verdict-label"
        })
      );
      if (answer.text) {
        const you = element("p", "You wrote ", { className: "dx-you" });
        you.append(element("span", answer.text));
        verdict.append(you);
      }
      if (retried) verdict.append(element("p", `Second try: ${answer.retry}`, { className: "dx-you" }));
    }
    verdict.append(element("p", item.explanation, { className: "dx-rule" }));
    content.append(verdict);
    const next = action(
      pending ? "Next question" : "See my result",
      () => {
        feedbackId = undefined;
        showGrammar(set);
      },
      right || retried
    );
    if (!right && !retried) {
      const retry = element("form", undefined, { className: "dx-retry" });
      const field = element("input", undefined, {
        type: "text",
        maxLength: M.ANSWER_LIMIT,
        autocomplete: "off",
        spellcheck: false
      });
      field.lang = "de";
      const row = element("div", undefined, { className: "practice-actions" });
      row.append(element("button", "Check again", { className: "top-btn primary" }), next);
      retry.append(label("Use the rule and try once more", field), createLetterKeys(field), row);
      retry.addEventListener("submit", event => {
        event.preventDefault();
        if (!field.value.trim()) {
          field.focus();
          return;
        }
        if (
          updateSession(set, draft => {
            draft.answers[item.id].retry = field.value;
          })
        ) {
          showGrammar(set);
        }
      });
      content.append(retry);
      field.focus();
    } else {
      if (!right) content.append(element("p", `Accepted: ${item.accepted.join(" / ")}`, { className: "dx-accepted" }));
      content.append(next);
      next.focus();
    }
  }

  function showListening(set) {
    cleanup();
    cleanup = () => {};
    content.replaceChildren(element("h1", set.title));
    const session = M.sessionFor(getPractice(), set);
    if (!session) {
      content.append(
        element(
          "p",
          "Five announcements with original scripts and a synthesized German voice. Read the statements, then play the audio up to twice within four minutes."
        ),
        action(
          "Begin timed practice",
          () => {
            if (
              update(next => {
                next.sessions[M.sessionKey(set)] = M.startSession(set, "listening", Date.now(), next);
              })
            ) {
              showListening(set);
            }
          },
          true
        )
      );
      return;
    }
    if (session.finishedAt !== null) {
      renderScore(set, session, false);
      const replay = element("audio", undefined, { src: set.audio, controls: true, preload: "none" });
      replay.setAttribute("aria-label", "Replay the announcements and review the transcripts");
      content.append(replay);
      cleanup = () => replay.pause();
      const results = element("ol", undefined, { className: "practice-results" });
      for (const item of set.items) {
        const detail = element("li");
        const answer = session.answers[item.id];
        const transcript = element("details");
        transcript.append(element("summary", "Transcript"), element("p", item.transcript));
        detail.append(
          element("strong", item.prompt),
          element(
            "p",
            `${answer ? `${correctLabel(answer.text)}${M.correctAnswer(item, answer.text) ? " · Correct" : " · Review"}` : "Unanswered"}. Answer: ${correctLabel(item.accepted[0])}. ${item.explanation}`
          ),
          transcript,
          element("small", `Item ${item.id}`)
        );
        results.append(detail);
      }
      content.append(results, link("Back to practice", "home"));
      return;
    }
    const deadline = session.startedAt + set.seconds * 1000;
    function finish() {
      if (
        updateSession(set, draft => {
          draft.finishedAt = Math.min(Date.now(), deadline);
        })
      ) {
        showListening(set);
      }
    }
    const clock = element("span", undefined, { className: "practice-clock" });
    clock.setAttribute("role", "timer");
    clock.setAttribute("aria-label", "Time remaining");
    const audio = element("audio", undefined, { src: set.audio, preload: "metadata" });
    let starting = false;
    const play = action("Play announcements", async () => {
      if (starting || Date.now() >= deadline) return;
      const current = M.sessionFor(getPractice(), set);
      if (current.plays >= set.maxPlays) return;
      starting = true;
      play.disabled = true;
      audio.currentTime = 0;
      try {
        await audio.play();
        if (destroyed || !content.contains(play) || Date.now() >= deadline) {
          audio.pause();
          return;
        }
        if (
          !updateSession(set, draft => {
            draft.plays++;
          })
        ) {
          audio.pause();
        }
      } catch {
        status.textContent = "The audio could not play. Try again.";
      } finally {
        starting = false;
        updatePlayButton();
      }
    });
    function updatePlayButton() {
      const current = M.sessionFor(getPractice(), set);
      if (!current || destroyed) return;
      const remaining = set.maxPlays - current.plays;
      play.textContent = audio.paused ? `Play announcements (${remaining} left)` : "Playing announcements";
      play.disabled = starting || remaining === 0 || !audio.paused;
    }
    audio.addEventListener("ended", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);
    content.append(clock, play, audio);
    const prompts = element("ol", undefined, { className: "practice-results" });
    for (const item of set.items) {
      const row = element("li");
      const fieldset = element("fieldset");
      fieldset.append(element("legend", item.prompt));
      for (const value of ["true", "false"]) {
        const input = element("input", undefined, {
          type: "radio",
          name: item.id,
          value,
          checked: session.answers[item.id]?.text === value
        });
        const caption = element("label");
        caption.append(input, document.createTextNode(correctLabel(value)));
        input.addEventListener("change", () => {
          const now = Date.now();
          if (now >= deadline) {
            finish();
          } else if (
            !updateSession(set, draft => {
              draft.answers[item.id] = { text: value, at: now, assisted: false, retry: null };
            })
          ) {
            showListening(set);
          }
        });
        fieldset.append(caption);
      }
      row.append(fieldset);
      prompts.append(row);
    }
    content.append(prompts, action("Submit answers", finish, true));
    function tick() {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      clock.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
      if (seconds === 0) {
        clearInterval(timer);
        audio.pause();
        play.disabled = true;
        for (const fieldset of prompts.querySelectorAll("fieldset")) {
          fieldset.disabled = true;
        }
        finish();
      }
    }
    const timer = setInterval(tick, 1000);
    cleanup = () => {
      clearInterval(timer);
      audio.pause();
    };
    updatePlayButton();
    tick();
  }

  function showWriting(prompt) {
    const saved = getPractice().writing[prompt.id];
    content.replaceChildren(element("h1", prompt.title), element("p", prompt.situation), list("ol", prompt.points));
    const draft = element("textarea", undefined, {
      rows: 9,
      maxLength: M.DRAFT_LIMIT,
      value: saved?.draft || "",
      readOnly: Boolean(saved),
      lang: "de"
    });
    content.append(label("First draft", draft));
    if (!saved) {
      content.append(
        action(
          "Keep first draft",
          () => {
            if (!draft.value.trim()) {
              status.textContent = "Write your first draft before saving.";
              return;
            }
            if (
              update(next => {
                next.writing[prompt.id] = { draft: draft.value, revision: "", feedback: "" };
              })
            ) {
              showWriting(prompt);
            }
          },
          true
        )
      );
      return;
    }
    const feedback = element("textarea", undefined, { rows: 4, maxLength: M.DRAFT_LIMIT, value: saved.feedback });
    const revision = element("textarea", undefined, { rows: 9, maxLength: M.DRAFT_LIMIT, value: saved.revision, lang: "de" });
    content.append(
      element("p", "Review all four content points, organisation and register, and grammar and spelling."),
      label("Feedback or correction notes", feedback),
      label("Revised draft", revision),
      action(
        "Save revision and notes",
        () => {
          if (
            update(next => {
              next.writing[prompt.id] = { draft: saved.draft, revision: revision.value, feedback: feedback.value };
            })
          ) {
            status.textContent = "Revision and notes saved.";
          }
        },
        true
      )
    );
  }

  function showSpeaking(prompt) {
    content.replaceChildren(
      element("h1", prompt.title),
      element("p", "Allow 20 minutes to prepare and about 15 minutes to speak with a partner. Each partner uses their own role card.")
    );
    const roles = element("div", undefined, { className: "practice-actions" });
    const card = element("div");
    function displayRole(role) {
      card.replaceChildren(element("h2", `Role ${role.toUpperCase()}`));
      for (const task of prompt.tasks) {
        card.append(element("h3", task.title), element("p", task[role], { lang: "de" }));
      }
    }
    roles.append(action("Show role A", () => displayRole("a")), action("Show role B", () => displayRole("b")));
    content.append(roles, card);
    displayRole("a");

    if (globalThis.MediaRecorder && navigator.mediaDevices?.getUserMedia) {
      const rehearsal = element("details");
      rehearsal.append(
        element("summary", "Solo rehearsal recording"),
        element("p", "Listen back before leaving this page. Audio stays on this device and is kept in this page only.")
      );
      const player = element("audio", undefined, { controls: true, hidden: true });
      let recorder;
      let stream;
      let url;
      const stopTracks = () => {
        for (const track of stream?.getTracks() ?? []) track.stop();
      };
      const record = action("Start recording", async () => {
        if (recorder?.state === "recording") {
          record.disabled = true;
          recorder.stop();
          return;
        }
        record.disabled = true;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (destroyed) {
            stopTracks();
            return;
          }
          const chunks = [];
          recorder = new MediaRecorder(stream);
          recorder.addEventListener("dataavailable", event => {
            if (event.data.size) chunks.push(event.data);
          });
          recorder.addEventListener(
            "stop",
            () => {
              stopTracks();
              if (destroyed) return;
              if (url) URL.revokeObjectURL(url);
              url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
              player.src = url;
              player.hidden = false;
              record.textContent = "Start recording";
              record.disabled = false;
            },
            { once: true }
          );
          recorder.start();
          record.textContent = "Stop recording";
        } catch {
          stopTracks();
          status.textContent = "The microphone is unavailable. You can still rehearse with the role cards.";
        } finally {
          record.disabled = false;
        }
      });
      rehearsal.append(record, player);
      content.append(rehearsal);
      cleanup = () => {
        if (recorder?.state === "recording") recorder.stop();
        stopTracks();
        if (url) URL.revokeObjectURL(url);
        player.pause();
      };
    }

    const prior = getPractice().speaking[prompt.id];
    const form = element("form");
    form.append(element("h2", "Feedback from paired practice"));
    const confirmation = element("input", undefined, { type: "checkbox", required: true, checked: Boolean(prior) });
    const confirmLabel = element("label", undefined, { className: "practice-check" });
    confirmLabel.append(confirmation, document.createTextNode("I completed the three tasks with a partner."));
    form.append(confirmLabel);
    const criteria = [
      "Expression and range",
      "Task fulfilment and interaction",
      "Grammar accuracy",
      "Pronunciation and intonation"
    ];
    const fields = criteria.map((criterion, index) => {
      const select = element("select", undefined, { required: true });
      for (const [value, text] of [
        ["", "Choose feedback"],
        ["0", "Needs practice"],
        ["1", "Sometimes clear"],
        ["2", "Consistently clear"]
      ]) {
        select.append(element("option", text, { value }));
      }
      select.value = prior ? String(prior.ratings[index]) : "";
      form.append(label(criterion, select));
      return select;
    });
    const notes = element("textarea", undefined, { rows: 4, maxLength: M.DRAFT_LIMIT, value: prior?.notes || "" });
    form.append(label("Partner feedback or notes", notes), element("button", "Save paired feedback", { className: "top-btn primary" }));
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (
        update(next => {
          next.speaking[prompt.id] = {
            at: Date.now(),
            ratings: fields.map(field => Number(field.value)),
            notes: notes.value
          };
        })
      ) {
        status.textContent = "Paired feedback saved.";
      }
    });
    content.append(form);
  }

  const grammar = bank.grammar.find(set => set.id === page);
  const listening = bank.listening.find(set => set.id === page);
  const writing = bank.writing.find(prompt => prompt.id === page);
  const speaking = bank.speaking.find(prompt => prompt.id === page);
  if (grammar) showGrammar(grammar);
  else if (listening) showListening(listening);
  else if (writing) showWriting(writing);
  else if (speaking) showSpeaking(speaking);
  else showHome();
  return () => {
    destroyed = true;
    cleanup();
  };
}

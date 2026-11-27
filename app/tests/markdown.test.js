import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { LESSON_BY_ID } from "../data/course.js";
import { isParadigmHeader, renderDiagram } from "../lib/diagrams.js";
import {
  detectContrastLang,
  formatInline,
  renderLessonMasthead,
  renderMarkdown,
  resolveRelativePath,
  stripContrastPrefix
} from "../lib/markdown.js";

test("resolveRelativePath resolves sibling and parent markdown paths", () => {
  assert.equal(resolveRelativePath("A1/A1-05-nouns-gender-articles.md", "../shared/cases.md"), "shared/cases.md");
  assert.equal(resolveRelativePath("A2/A2-02-two-way-prepositions.md", "./A2-01-dativ-2.md#section"), "A2/A2-01-dativ-2.md");
  assert.equal(resolveRelativePath("README.md", "https://example.com/a.md"), null);
  assert.equal(resolveRelativePath("README.md", "#anchor"), null);
  assert.equal(resolveRelativePath("review/anki/README.md", "genau-A1.tsv"), null);
});

test("formatInline highlights case symbols, escapes HTML, and protects inline code", () => {
  const html = formatInline("Use `<b>●</b>` with **Nominativ ●** and ~~wrong~~", "A1/A1-05-nouns-gender-articles.md");
  assert.match(html, /<code>&lt;b&gt;●&lt;\/b&gt;<\/code>/);
  assert.match(html, /<strong>Nominativ <span class="sym-nom">●<\/span><\/strong>/);
  assert.match(html, /<del>wrong<\/del>/);
});

test("renderMarkdown filters multilingual contrast boxes using activeLangs", () => {
  const md = [
    "> 🇧🇷 **Portuguese contrast** — Nota em PT.",
    "> 🇬🇧 **English contrast** — Note in EN."
  ].join("\n");
  const html = renderMarkdown(md, "A1/A1-01-alphabet-spelling.md", ["en"]);
  assert.equal(detectContrastLang("🇧🇷 **Portuguese contrast** — hi"), "pt-BR");
  assert.equal(stripContrastPrefix("🇧🇷 **Portuguese contrast** — hi"), "hi");
  assert.match(html, /class="contrast-box hidden-lang" data-lang="pt-BR"/);
  assert.match(html, /class="contrast-box" data-lang="en"/);
});

test("renderDiagram builds Satzklammer bracket tables and gender paradigms", () => {
  const bracketHtml = renderDiagram([
    "[Pos 1]  [V2]   [Mittelfeld]      [V-END]",
    "Ich      kann   heute nicht       kommen."
  ]);
  assert.match(bracketHtml, /<table class="klammer" lang="de">/);
  assert.match(bracketHtml, /k-open/);
  assert.match(bracketHtml, /k-close/);

  assert.equal(isParadigmHeader("● Nominativ     m       n       f       pl"), true);
  const paradigmHtml = renderDiagram([
    "● Nominativ     m       n       f       pl",
    "definite        der     das     die     die"
  ]);
  assert.match(paradigmHtml, /class="paradigm case-nom"/);
  assert.match(paradigmHtml, /data-g="m"/);
});

test("renderLessonMasthead parses real A1-05 lesson metadata", () => {
  const lesson = LESSON_BY_ID["A1-05"];
  const md = readFileSync(resolve(import.meta.dirname, "../..", lesson.path), "utf8");
  const parsed = renderLessonMasthead(md, lesson, lesson.path);
  assert.ok(parsed);
  assert.match(parsed.mastheadHtml, /meta-pill level-A1">A1-05/);
  assert.match(parsed.mastheadHtml, /class="cando-box"/);
  assert.ok(parsed.restMd.includes("## 0. Diagnostic"));
});

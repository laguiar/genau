import { CASE_NAME, CASE_SYM } from "../data/course.js";

const BRACKET_HEADER = /^\s*(?:\[[^\]]+\]\s*){2,}$/;

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function diaInline(text) {
  return escapeHtml(text)
    .replace(/[●▲■◆]/g, sym => `<span class="sym-${CASE_SYM[sym]}">${sym}</span>`)
    .replaceAll("✘", '<span class="dia-bad">✘</span>')
    .replaceAll("✔", '<span class="dia-good">✔</span>');
}

export function diaSegments(line) {
  const segs = [];
  for (const m of line.matchAll(/\S+(?: \S+)*/g)) {
    segs.push({ start: m.index, text: m[0] });
  }
  return segs;
}

export function assignToColumns(line, starts) {
  const cells = starts.map(() => []);
  const segs = diaSegments(line);
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    let col = 0;
    for (let c = 0; c < starts.length; c++) {
      if (starts[c] <= seg.start + 3) col = c;
    }
    // Handle a long row label separated by a single space from a value aligned at starts[1]
    // (e.g. " indefinite ein      ein      eine" where "ein" sits directly under column 1).
    if (
      col === 0 &&
      cells[0].length === 0 &&
      starts.length > 2 &&
      i + 1 < segs.length &&
      seg.start < starts[1] - 3 &&
      seg.start + seg.text.length > starts[1] &&
      line[starts[1] - 1] === " " &&
      line[starts[1]] !== " "
    ) {
      const splitAt = starts[1] - seg.start;
      cells[0].push(seg.text.slice(0, splitAt).trimEnd());
      cells[1].push(seg.text.slice(splitAt).trimStart());
      continue;
    }
    cells[col].push(seg.text);
  }
  return cells.map(parts => parts.join(" "));
}

export function isParadigmHeader(line) {
  const cells = line
    .trim()
    .split(/\s{2,}/)
    .map(c => c.toLowerCase().replace(/\s*\(.*\)$/, ""));
  return ["m", "n", "f"].every(g => cells.includes(g));
}

export function renderBracketGrid(header, rows) {
  const cols = [];
  for (const m of header.matchAll(/\[\s*([^\]]+?)\s*\]/g)) {
    cols.push({ start: m.index, label: m[1] });
  }
  const isVerb = l => /\bV\b|\bV2\b|V-END|VERB|conjugated|Partizip|Infinitiv/i.test(l);
  const isLink = l => /Subjunktor|Relativ|Fragewort|Article|Artikel/i.test(l);
  for (const col of cols) {
    col.verb = isVerb(col.label);
    col.end = /END/i.test(col.label);
  }
  let open = cols.findIndex(c => (c.verb && !c.end) || isLink(c.label));
  let close = open > -1 ? cols.findLastIndex((c, idx) => c.verb && idx > open) : -1;
  if (open === -1 || close === -1) {
    open = -1;
    close = -1;
  }

  const starts = cols.map(c => c.start);
  const thead = `${cols
    .map((c, idx) => {
      const cls = ["k-col"];
      if (c.verb) cls.push("k-verb");
      if (idx === open) cls.push("k-open");
      else if (idx === close) cls.push("k-close");
      else if (open > -1 && idx > open && idx < close) cls.push("k-mid");
      return `<th scope="col" class="${cls.join(" ")}"><span>${diaInline(c.label)}</span></th>`;
    })
    .join("")}<th class="k-note-h" aria-hidden="true"></th>`;

  const body = rows
    .map(row => {
      const trimmed = row.trim();
      if (trimmed.startsWith("=")) {
        return `<tr class="k-gloss"><td colspan="${cols.length + 1}">${diaInline(trimmed)}</td></tr>`;
      }
      const cells = assignToColumns(row, starts);
      let note = "";
      const last = cells.length - 1;
      const noteMatch = cells[last].match(/^(.*?\S)?\s*(\([^()]*\)|←.*)$/);
      if (noteMatch?.[1]) {
        cells[last] = noteMatch[1];
        note = noteMatch[2];
      } else if (noteMatch && !noteMatch[1] && cells[last].startsWith("(")) {
        note = cells[last];
        cells[last] = "";
      }
      return `<tr>${cells
        .map((cell, idx) => `<td class="${cols[idx].verb ? "k-verb" : ""}">${diaInline(cell)}</td>`)
        .join("")}<td class="k-note">${diaInline(note)}</td></tr>`;
    })
    .join("");

  return `<div class="dia-scroll"><table class="klammer" lang="de"><thead><tr>${thead}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function renderParadigm(header, rows) {
  const segs = diaSegments(header);
  const genderIdx = segs.findIndex(s => /^(m|n|f|pl)\b/i.test(s.text));
  const titleText = genderIdx > 0 ? segs.slice(0, genderIdx).map(s => s.text).join(" ") : "";
  const gender = segs.slice(genderIdx);
  const starts = [0, ...gender.map(s => s.start)];
  const caseSym = (titleText.match(/[●▲■◆]/) || [])[0];
  const caseKey = caseSym ? CASE_SYM[caseSym] : "";

  const thead =
    `<th scope="col" class="p-title">${diaInline(titleText)}</th>` +
    gender.map(g => `<th scope="col">${diaInline(g.text)}</th>`).join("");
  const genderLabels = gender.map(g => g.text.replace(/\s*\(.*\)$/, ""));

  const body = rows
    .map(row => {
      const cells = assignToColumns(row, starts);
      const filled = cells.filter(Boolean).length;
      if (!cells[0] && filled === 1) {
        const at = cells.findIndex(Boolean);
        return `<tr class="p-cont"><td class="p-blank"></td><td colspan="${cells.length - 1}">${diaInline(cells[at])}</td></tr>`;
      }
      const used = cells.map((_, idx) => idx).filter(idx => idx > 0 && cells[idx]);
      if (used.length === 1) {
        const k = used[0];
        const room = (starts[k + 1] ?? starts[k] + 14) - starts[k];
        if (cells[k].length > room + 4) {
          return `<tr class="p-span"><th scope="row">${diaInline(cells[0])}</th><td colspan="${cells.length - 1}">${diaInline(cells[k])}</td></tr>`;
        }
      }
      const rowSym = (cells[0].match(/[●▲■◆]/) || [])[0];
      return `<tr${rowSym ? ` class="case-row case-${CASE_SYM[rowSym]}"` : ""}><th scope="row">${diaInline(cells[0])}</th>${cells
        .slice(1)
        .map((c, idx) => `<td data-g="${escapeHtml(genderLabels[idx] || "")}">${diaInline(c)}</td>`)
        .join("")}</tr>`;
    })
    .join("");

  return `<div class="dia-scroll"><table lang="de" class="paradigm${caseKey ? ` case-${caseKey}` : ""}"${caseKey ? ` aria-label="${CASE_NAME[caseKey]} paradigm"` : ""}><thead><tr>${thead}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function renderDiagram(codeLines) {
  const parts = [];
  let textBuf = [];

  const flushText = () => {
    while (textBuf.length && !textBuf.at(-1).trim()) textBuf.pop();
    while (textBuf.length && !textBuf[0].trim()) textBuf.shift();
    if (!textBuf.length) return;
    const minIndent = Math.min(...textBuf.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    const html = textBuf
      .map(l => {
        const line = l.slice(minIndent);
        if (!line.trim()) return `<span class="dl dl-gap"></span>`;
        const indent = line.match(/^ */)[0].length;
        const text = line.trim();
        const isLabel =
          /^[A-ZÄÖÜ0-9●▲■◆][A-ZÄÖÜẞ0-9 ●▲■◆&+\-—–·/().,'"!?]*[:A-ZÄÖÜ)]\s*$/.test(text) &&
          /[A-ZÄÖÜ]{3}/.test(text);
        return `<span class="dl${isLabel ? " dia-label" : ""}" style="--in:${indent}ch">${diaInline(text)}</span>`;
      })
      .join("");
    parts.push(`<div class="dia-text" lang="de">${html}</div>`);
    textBuf = [];
  };

  let i = 0;
  while (i < codeLines.length) {
    const line = codeLines[i];
    const bracket = BRACKET_HEADER.test(line);
    const paradigm = !bracket && isParadigmHeader(line);
    if (bracket || paradigm) {
      const rows = [];
      let j = i + 1;
      while (j < codeLines.length && codeLines[j].trim() && !BRACKET_HEADER.test(codeLines[j])) {
        rows.push(codeLines[j]);
        j++;
      }
      if (rows.length) {
        flushText();
        parts.push(bracket ? renderBracketGrid(line, rows) : renderParadigm(line, rows));
        i = j;
        continue;
      }
    }
    textBuf.push(line);
    i++;
  }
  flushText();
  return `<figure class="diagram">${parts.join("")}</figure>`;
}

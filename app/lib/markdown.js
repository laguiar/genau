import { FLAGS, ICONS, LANG_META } from "../data/assets.js";
import { CASE_NAME, CASE_SYM, LESSON_BY_ID } from "../data/course.js";
import { escapeHtml, renderDiagram } from "./diagrams.js";

const LIST_ITEM = /^( *)(?:(\d+)\.|[-*+])[ \t]+(.*)$/;

export function resolveRelativePath(baseFile, href) {
  if (
    !href ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return null;
  }
  const cleanHref = href.split("#")[0];
  if (!cleanHref.endsWith(".md")) return null;
  const baseParts = baseFile.split("/").slice(0, -1);
  const relParts = cleanHref.split("/");
  const out = [...baseParts];
  for (const part of relParts) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
}

export function formatInline(text, baseFile = "README.md") {
  const codeTokens = [];
  let s = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeTokens.length;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return `\uE000CODE${idx}\uE001`;
  });

  s = escapeHtml(s);

  // Links [text](href)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const resolved = resolveRelativePath(baseFile, href);
    if (resolved) {
      return `<a href="#doc=${encodeURIComponent(resolved)}">${label}</a>`;
    }
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    const baseDir = baseFile.includes("/") ? baseFile.slice(0, baseFile.lastIndexOf("/") + 1) : "";
    const url = href.startsWith("/") ? href : baseDir + href;
    return `<a href="${url}" download>${label}</a>`;
  });

  // Bare https URLs
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');

  // Strikethrough, Bold, Italic
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^\w*])\*([^*]+)\*(?!\w)/g, "$1<em>$2</em>");

  // Highlight Genau case symbols
  s = s
    .replaceAll("●", '<span class="sym-nom">●</span>')
    .replaceAll("▲", '<span class="sym-akk">▲</span>')
    .replaceAll("■", '<span class="sym-dat">■</span>')
    .replaceAll("◆", '<span class="sym-gen">◆</span>');

  // Restore inline code
  s = s.replace(/\uE000CODE(\d+)\uE001/g, (_, idx) => codeTokens[Number(idx)]);
  return s;
}

export function detectContrastLang(line) {
  if (line.includes("🇧🇷")) return "pt-BR";
  if (line.includes("🇪🇸")) return "es";
  if (line.includes("🇫🇷")) return "fr";
  if (line.includes("🇬🇧")) return "en";
  return null;
}

export function stripContrastPrefix(line) {
  return line
    .replace(/^(?:🇧🇷|🇪🇸|🇫🇷|🇬🇧)\s*/u, "")
    .replace(/^\*\*(?:Portuguese|Brazilian Portuguese|Spanish|French|English)\s+contrast\*\*\s*[—–:-]?\s*/i, "")
    .trim();
}

export function renderList(lines, start, baseFile) {
  const first = lines[start].match(LIST_ITEM);
  const indent = first[1].length;
  const ordered = first[2] !== undefined;
  const tag = ordered ? "ol" : "ul";
  const startAttr = ordered && Number(first[2]) !== 1 ? ` start="${Number(first[2])}"` : "";
  const items = [];
  let end = start;
  while (end < lines.length) {
    const item = lines[end].match(LIST_ITEM);
    if (!item || item[1].length !== indent || (item[2] !== undefined) !== ordered) break;
    let content = formatInline(item[3], baseFile);
    end++;
    while (end < lines.length && (lines[end].match(LIST_ITEM)?.[1].length ?? 0) > indent) {
      const nested = renderList(lines, end, baseFile);
      content += nested.html;
      end = nested.end;
    }
    items.push(`<li>${content}</li>`);
  }
  return { html: `<${tag}${startAttr}>${items.join("")}</${tag}>`, end };
}

export function renderLessonMasthead(md, lesson, baseFile) {
  const lines = md.replace(/<!--[\s\S]*?-->/g, "").replaceAll("\r\n", "\n").split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i >= lines.length || !lines[i].startsWith("# ")) return null;

  const rawTitle = lines[i].replace(/^#\s+/, "").trim();
  const cleanTitle = rawTitle.replace(/^(?:A[12]|B1)-\d{2}\s*[—–-]\s*/, "");
  i++;
  while (i < lines.length && !lines[i].trim()) i++;

  const metaLines = [];
  while (i < lines.length && lines[i].trim() && /^\*\*(?:Level|Can-do|Time|Prerequisites)/i.test(lines[i].trim())) {
    metaLines.push(lines[i].trim());
    i++;
  }
  if (!metaLines.length) return null;

  const levelCode = lesson.id.split("-")[0];
  let timeVal = "";
  let prereqHtml = "";
  let nicosHtml = "";
  let candoHtml = "";

  for (const ml of metaLines) {
    if (/^\*\*Can-do:\*\*/i.test(ml)) {
      candoHtml = formatInline(ml.replace(/^\*\*Can-do:\*\*\s*/i, ""), baseFile);
    } else {
      const parts = ml.split(/\s*·\s*/);
      for (const p of parts) {
        if (/^\*\*Time:\*\*/i.test(p)) {
          timeVal = p.replace(/^\*\*Time:\*\*\s*/i, "").trim();
        } else if (/^\*\*Prerequisites:\*\*/i.test(p)) {
          const pr = p.replace(/^\*\*Prerequisites:\*\*\s*/i, "").trim();
          prereqHtml = pr.replace(/\b((?:A[12]|B1)-\d{2})\b/g, (_, id) => {
            const target = LESSON_BY_ID[id];
            return target ? `<a href="#doc=${encodeURIComponent(target.path)}">${id}</a>` : id;
          });
        } else if (/^\*\*Nicos Weg:\*\*/i.test(p)) {
          nicosHtml = formatInline(p.replace(/^\*\*Nicos Weg:\*\*\s*/i, "").trim(), baseFile);
        }
      }
    }
  }

  const pills = [
    `<span class="meta-pill level-${levelCode}">${lesson.id}</span>`,
    timeVal ? `<span>${escapeHtml(timeVal)}</span>` : "",
    prereqHtml && prereqHtml.toLowerCase() !== "none"
      ? `<span class="meta-sep">·</span><span>Prereq: ${prereqHtml}</span>`
      : "",
    nicosHtml ? `<span class="meta-sep">·</span><span>DW Nicos Weg: ${nicosHtml}</span>` : ""
  ]
    .filter(Boolean)
    .join("");

  const usedCases = Object.entries(CASE_SYM).filter(([sym]) => md.includes(sym));
  const legendHtml = usedCases.length
    ? `<dl class="case-key" aria-label="Case symbols in this lesson">${usedCases
        .map(([sym, key]) => `<div><dt class="sym-${key}">${sym}</dt><dd>${CASE_NAME[key]}</dd></div>`)
        .join("")}</dl>`
    : "";

  const mastheadHtml = `
    <div class="lesson-masthead">
      <div class="masthead-meta">${pills}</div>
      <h1>${formatInline(cleanTitle, baseFile)}</h1>
      ${candoHtml ? `<div class="cando-box"><span class="cando-label">Learning Goal</span>${candoHtml}</div>` : ""}
      ${legendHtml}
    </div>
  `;
  return { mastheadHtml, restMd: lines.slice(i).join("\n") };
}

export function renderMarkdown(md, baseFile = "README.md", activeLangs = ["en"]) {
  const cleaned = md.replace(/<!--[\s\S]*?-->/g, "");
  const lines = cleaned.replaceAll("\r\n", "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Collapsible <details> block
    if (/^<details>\s*$/i.test(line.trim())) {
      i++;
      let summaryHtml = "Click to reveal";
      if (i < lines.length && /^<summary>/i.test(lines[i].trim())) {
        const summary = lines[i].trim().replace(/^<summary>/i, "").replace(/<\/summary>$/i, "");
        const bold = summary.match(/^<b>(.*)<\/b>$/i);
        summaryHtml = bold ? formatInline(bold[1], baseFile) : formatInline(summary, baseFile);
        i++;
      }
      const inner = [];
      while (i < lines.length && !/^<\/details>\s*$/i.test(lines[i].trim())) {
        inner.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      out.push(
        `<details><summary>${ICONS.chevRight}<span>${summaryHtml}</span></summary><div class="details-body">${renderMarkdown(inner.join("\n"), baseFile, activeLangs)}</div></details>`
      );
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith("```")) {
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      out.push(renderDiagram(codeLines));
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push("<hr>");
      i++;
      continue;
    }

    // Headings
    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      const lvl = hm[1].length;
      const text = hm[2].trim();
      if (lvl === 2) {
        const numMatch = text.match(/^(\d+)\.\s+(.+)$/);
        if (numMatch) {
          out.push(
            `<h2><span class="sec-num" aria-hidden="true">${numMatch[1].padStart(2, "0")}</span><span>${formatInline(numMatch[2], baseFile)}</span></h2>`
          );
          i++;
          continue;
        }
      }
      out.push(`<h${lvl}>${formatInline(text, baseFile)}</h${lvl}>`);
      i++;
      continue;
    }

    // Table
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|\s*[-:]+/.test(lines[i + 1].trim())) {
      const parseRow = r =>
        r
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map(c => c.trim());
      const headers = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      out.push(
        `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${formatInline(h, baseFile)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${formatInline(c, baseFile)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      );
      continue;
    }

    // Blockquote & Multilingual contrast callouts
    if (line.trim().startsWith(">")) {
      const bqLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        bqLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      const isContrastBlock = bqLines.some(l => detectContrastLang(l));
      if (isContrastBlock) {
        const boxes = [];
        for (const bl of bqLines) {
          if (!bl.trim()) continue;
          const lang = detectContrastLang(bl);
          if (lang) {
            const hidden = activeLangs.includes(lang) ? "" : " hidden-lang";
            const meta = LANG_META[lang];
            const bodyText = stripContrastPrefix(bl);
            boxes.push(
              `<div class="contrast-box${hidden}" data-lang="${lang}">` +
                `<div class="contrast-hdr">${FLAGS[lang]}<span>${meta.label}</span></div>` +
                `<span class="contrast-body">${formatInline(bodyText, baseFile)}</span>` +
                `</div>`
            );
          } else {
            boxes.push(`<blockquote><p>${formatInline(bl, baseFile)}</p></blockquote>`);
          }
        }
        out.push(`<div class="contrast-group">${boxes.join("")}</div>`);
      } else {
        out.push(
          `<blockquote>${bqLines.map(l => (l.trim() ? `<p>${formatInline(l, baseFile)}</p>` : "")).join("")}</blockquote>`
        );
      }
      continue;
    }

    // Lists
    if (LIST_ITEM.test(line)) {
      const list = renderList(lines, i, baseFile);
      out.push(list.html);
      i = list.end;
      continue;
    }

    // Paragraph
    const para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("|") &&
      !/^---+$/.test(lines[i].trim()) &&
      !LIST_ITEM.test(lines[i]) &&
      !/^<details>/i.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${formatInline(para.join(" "), baseFile)}</p>`);
  }

  return out.join("\n");
}

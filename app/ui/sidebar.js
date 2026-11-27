import { ICONS } from "../data/assets.js";
import { COURSE, statusLabel } from "../data/course.js";
import { escapeHtml } from "../lib/diagrams.js";
import { getState, saveState } from "../store.js";

const DRAWER_MQ = window.matchMedia("(width <= 1024px)");

const GROUPS = [
  { key: "start", label: "Study Guides", items: COURSE.start, isLesson: false },
  { key: "A1", label: "A1 · Foundations", items: COURSE.A1, isLesson: true },
  { key: "A2", label: "A2 · Core Structures", items: COURSE.A2, isLesson: true },
  { key: "B1", label: "B1 · Exam Readiness", items: COURSE.B1, isLesson: true },
  { key: "shared", label: "Reference & Mocks", items: COURSE.shared, isLesson: false }
];

function setDrawerModal(open) {
  const sidebar = document.getElementById("sidebar");
  const modal = open && DRAWER_MQ.matches;
  sidebar.inert = DRAWER_MQ.matches && !open;
  document.querySelector("main.content").inert = modal;
  document.querySelector(".topbar-main .top-controls").inert = modal;
  if (modal) {
    sidebar.setAttribute("role", "dialog");
    sidebar.setAttribute("aria-modal", "true");
  } else {
    sidebar.removeAttribute("role");
    sidebar.removeAttribute("aria-modal");
  }
}

export function syncSidebarState() {
  const state = getState();
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const sidebar = document.getElementById("sidebar");
  if (DRAWER_MQ.matches) {
    document.body.classList.remove("sidebar-collapsed");
    const open = sidebar.classList.contains("drawer-open");
    toggleBtn.setAttribute("aria-expanded", String(open));
    setDrawerModal(open);
  } else {
    setDrawerModal(false);
    sidebar.classList.remove("drawer-open");
    document.getElementById("backdrop").classList.remove("open");
    document.body.classList.toggle("sidebar-collapsed", Boolean(state.sidebarCollapsed));
    toggleBtn.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  }
}

export function closeDrawerSidebar() {
  const sidebar = document.getElementById("sidebar");
  const wasOpen = sidebar.classList.contains("drawer-open");
  const hadFocus = sidebar.contains(document.activeElement);
  sidebar.classList.remove("drawer-open");
  document.getElementById("backdrop").classList.remove("open");
  setDrawerModal(false);
  if (DRAWER_MQ.matches) {
    const toggle = document.getElementById("sidebarToggleBtn");
    toggle.setAttribute("aria-expanded", "false");
    if (wasOpen && hadFocus) toggle.focus({ preventScroll: true });
  }
}

export function renderSidebar(currentPath, filter = "") {
  const state = getState();
  const q = filter.trim().toLowerCase();
  const nav = document.getElementById("sidebarNav");
  const h = location.hash || "#doc=README.md";
  const inSpecial = h.startsWith("#practice=") || h === "#flashcards";

  nav.innerHTML = GROUPS.map(g => {
    const items = g.items.filter(it => !q || it.id.toLowerCase().includes(q) || it.title.toLowerCase().includes(q));
    if (!items.length) return "";
    const isCollapsed = !q && Boolean(state.collapsed[g.key]);
    const doneCnt = g.isLesson ? g.items.filter(it => ["●", "✔"].includes(state.progress[it.id])).length : null;
    const rightTxt = g.isLesson ? `${doneCnt}/${g.items.length}` : `${g.items.length}`;

    return `
      <div class="nav-group ${isCollapsed ? "collapsed" : ""}" data-group="${g.key}">
        <button class="nav-group-hdr" type="button" data-toggle="${g.key}" aria-expanded="${!isCollapsed}">
          <span class="nav-group-left">${ICONS.chevDown}<span>${g.label}</span></span>
          <span class="nav-group-count">${rightTxt}</span>
        </button>
        <ul class="nav-list">
          ${items
            .map(it => {
              const active = !inSpecial && currentPath === it.path;
              const st = g.isLesson ? state.progress[it.id] || "☐" : "";
              return `
                <li>
                  <a class="nav-item ${active ? "active" : ""}" href="#doc=${encodeURIComponent(it.path)}"${active ? ' aria-current="page"' : ""}>
                    ${g.isLesson ? `<span class="nav-dot" data-st="${st}" title="${statusLabel(st)}"></span><span class="sr-only">${statusLabel(st)}: </span><span class="nav-id">${it.id}</span>` : ""}
                    <span class="nav-title">${escapeHtml(it.title)}</span>
                  </a>
                </li>
              `;
            })
            .join("")}
        </ul>
      </div>
    `;
  }).join("");
}

export function initSidebarControls(getCurrentPath) {
  const nav = document.getElementById("sidebarNav");
  nav.addEventListener("click", e => {
    const hdr = e.target.closest(".nav-group-hdr");
    if (!hdr) return;
    const state = getState();
    const key = hdr.dataset.toggle;
    state.collapsed[key] = !state.collapsed[key];
    saveState("sidebar");
    renderSidebar(getCurrentPath(), document.getElementById("searchInput").value);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.getElementById("sidebar").classList.contains("drawer-open")) {
      closeDrawerSidebar();
    }
  });

  document.getElementById("sidebarToggleBtn").addEventListener("click", () => {
    if (DRAWER_MQ.matches) {
      const sidebar = document.getElementById("sidebar");
      const open = sidebar.classList.toggle("drawer-open");
      document.getElementById("backdrop").classList.toggle("open", open);
      document.getElementById("sidebarToggleBtn").setAttribute("aria-expanded", String(open));
      setDrawerModal(open);
      if (open) {
        const current = sidebar.querySelector(".nav-item.active, [aria-current='page']");
        if (current) current.scrollIntoView({ block: "center" });
        (current || sidebar.querySelector("a, button, input"))?.focus({ preventScroll: true });
      }
    } else {
      const state = getState();
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveState("sidebar");
      syncSidebarState();
    }
  });

  document.getElementById("backdrop").addEventListener("click", closeDrawerSidebar);
  DRAWER_MQ.addEventListener("change", syncSidebarState);

  document.getElementById("searchInput").addEventListener("input", e => {
    renderSidebar(getCurrentPath(), e.target.value);
  });
}

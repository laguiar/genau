import { fetchDoc } from "../lib/docs.js";
import { getState, savePracticeState } from "../store.js";
import { updatePrimaryNavActive } from "../ui/shell.js";
import { closeDrawerSidebar, renderSidebar } from "../ui/sidebar.js";

export async function openPractice(page, { signal, isCurrent }) {
  updatePrimaryNavActive();
  closeDrawerSidebar();
  renderSidebar("", document.getElementById("searchInput").value);

  const container = document.getElementById("mainContainer");
  container.replaceChildren(Object.assign(document.createElement("div"), { className: "loading-state", textContent: "Loading practice…" }));

  try {
    const raw = await fetchDoc("practice/content.json", { signal });
    const bank = globalThis.GenauPracticeModel.validateCatalogue(JSON.parse(raw));
    if (!isCurrent()) return () => {};
    const cleanup = globalThis.GenauPracticeView.mount({
      container,
      page,
      bank,
      getPractice: () => getState().practice,
      savePractice: savePracticeState
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    return cleanup;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return () => {};
    if (isCurrent()) {
      const notice = document.createElement("div");
      notice.className = "notice";
      notice.textContent = "Could not load practice. Use the hosted app or reload this page.";
      container.replaceChildren(notice);
    }
    return () => {};
  }
}

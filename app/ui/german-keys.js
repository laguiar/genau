export const GERMAN_KEYS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

export function insertGermanLetter(field, ch) {
  const at = field.selectionStart ?? field.value.length;
  field.setRangeText(ch, at, field.selectionEnd ?? at, "end");
  field.focus();
}

export function createLetterKeys(field) {
  const keys = document.createElement("div");
  keys.className = "dx-keys";
  keys.setAttribute("role", "group");
  keys.setAttribute("aria-label", "Insert German letters");
  for (const ch of GERMAN_KEYS) {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "dx-key";
    key.tabIndex = -1;
    key.textContent = ch;
    key.addEventListener("click", () => insertGermanLetter(field, ch));
    keys.append(key);
  }
  return keys;
}

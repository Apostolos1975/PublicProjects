let eli5Overlay = null;
let eli5Anchor = null;
let eli5Record = null;

const SVG_NS = "http://www.w3.org/2000/svg";
const SAVE_PATH = "M8 2.5v6.5m0 0 2.5-2.5M8 9 5.5 6.5M3 11v2h10v-2";
const SAVED_PATH = "M3.5 8.5 6.5 11.5 12.5 4.5";

function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  return rect.width === 0 && rect.height === 0 ? null : rect;
}

function iconPath(d) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.6");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);
  return svg;
}

function setSaveLabel(btn, label) {
  btn.title = label;
  btn.setAttribute("aria-label", label);
}

async function saveCurrent(overlay, saveBtn) {
  if (!eli5Record || saveBtn.classList.contains("eli5-saved")) return;

  const explanation = overlay.querySelector(".eli5-body").textContent;
  const reply = await browser.runtime.sendMessage({
    type: "ELI5_SAVE",
    record: eli5Record,
    explanation
  });

  if (!reply?.ok) {
    setSaveLabel(saveBtn, "Could not save");
    return;
  }
  saveBtn.classList.add("eli5-saved");
  saveBtn.replaceChildren(iconPath(SAVED_PATH));
  setSaveLabel(saveBtn, `Saved (${reply.count})`);
}

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "eli5-overlay";

  const header = document.createElement("div");
  header.className = "eli5-header";

  const title = document.createElement("span");
  title.className = "eli5-title";
  title.textContent = "ELI5";

  const saveBtn = document.createElement("button");
  saveBtn.className = "eli5-save";
  saveBtn.hidden = true;
  saveBtn.appendChild(iconPath(SAVE_PATH));
  setSaveLabel(saveBtn, "Save explanation");
  saveBtn.addEventListener("click", () => saveCurrent(overlay, saveBtn));

  const closeBtn = document.createElement("button");
  closeBtn.className = "eli5-close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    eli5Overlay = null;
  });

  const actions = document.createElement("div");
  actions.className = "eli5-actions";
  actions.appendChild(saveBtn);
  actions.appendChild(closeBtn);

  header.appendChild(title);
  header.appendChild(actions);

  const body = document.createElement("div");
  body.className = "eli5-body";

  overlay.appendChild(header);
  overlay.appendChild(body);

  return overlay;
}

function positionOverlay(overlay) {
  const margin = 8;
  const rect = eli5Anchor;

  overlay.style.position = "fixed";

  if (!rect) {
    overlay.style.bottom = "24px";
    overlay.style.right = "24px";
    overlay.style.top = "";
    overlay.style.left = "";
    return;
  }

  overlay.style.bottom = "";
  overlay.style.right = "";

  const width = overlay.offsetWidth || 380;
  const height = overlay.offsetHeight;

  let left = Math.min(rect.left, window.innerWidth - width - margin);
  left = Math.max(left, margin);

  // Prefer below the selection, flip above when it would run off the bottom.
  let top = rect.bottom + margin;
  if (top + height > window.innerHeight - margin) {
    const above = rect.top - margin - height;
    top = above >= margin ? above : Math.max(margin, window.innerHeight - height - margin);
  }

  overlay.style.top = top + "px";
  overlay.style.left = left + "px";
}

function ensureOverlay() {
  if (!eli5Overlay || !document.body.contains(eli5Overlay)) {
    eli5Overlay = createOverlay();
    document.body.appendChild(eli5Overlay);
  }
  return eli5Overlay;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && eli5Overlay) {
    eli5Overlay.remove();
    eli5Overlay = null;
  }
});

function fill(overlay, text, variant, saveable) {
  const body = overlay.querySelector(".eli5-body");
  body.className = variant ? `eli5-body ${variant}` : "eli5-body";
  body.textContent = text;

  const saveBtn = overlay.querySelector(".eli5-save");
  saveBtn.hidden = !saveable;
  if (saveable) {
    saveBtn.classList.remove("eli5-saved");
    saveBtn.replaceChildren(iconPath(SAVE_PATH));
    setSaveLabel(saveBtn, "Save explanation");
  }

  positionOverlay(overlay);
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ELI5_PING") {
    return Promise.resolve({ ready: true });
  }
  if (msg.type === "ELI5_GET_SELECTION") {
    return Promise.resolve({ text: window.getSelection().toString() });
  }
  if (msg.type === "ELI5_LOADING") {
    eli5Anchor = getSelectionRect();
    eli5Record = null;
    fill(ensureOverlay(), "Explaining...", "eli5-loading", false);
  } else if (msg.type === "ELI5_RESULT") {
    if (!eli5Overlay) return;
    eli5Record = msg.record;
    fill(eli5Overlay, msg.text, null, Boolean(msg.record));
  } else if (msg.type === "ELI5_ERROR") {
    eli5Record = null;
    fill(ensureOverlay(), msg.message, "eli5-error", false);
  }
});

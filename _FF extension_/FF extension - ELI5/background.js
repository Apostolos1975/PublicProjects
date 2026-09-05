browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: "eli5-explain",
    title: "ELI5: Explain this",
    contexts: ["selection", "image"]
  });
});

const NO_KEY_MESSAGE = "API key not set. Click the ELI5 toolbar button and paste your Claude API key.";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 400;
const SYSTEM_PROMPT = "You explain things simply and clearly, like the person has never encountered the topic before. Plain prose only — no markdown, no headers, no bold, no bullet points.";
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_BYTES = 4_000_000;
const THUMBNAIL_MAX_PX = 96;

async function getApiKey() {
  const { claudeApiKey } = await browser.storage.local.get("claudeApiKey");
  return (claudeApiKey || "").trim();
}

async function send(tabId, message) {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch {
    return null;
  }
}

// Tabs loaded before the extension was installed or reloaded have no content
// script, so inject on demand rather than failing silently.
async function ensureContentScript(tabId) {
  try {
    await browser.tabs.sendMessage(tabId, { type: "ELI5_PING" });
    return true;
  } catch {}

  try {
    await browser.tabs.insertCSS(tabId, { file: "content.css" });
    await browser.tabs.executeScript(tabId, { file: "content.js" });
    return true;
  } catch {
    return false;
  }
}

function notifyUnavailable() {
  return browser.notifications.create({
    type: "basic",
    title: "ELI5",
    message: "Explanations can't be shown on this page."
  });
}

async function callClaude(apiKey, content) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  return data.stop_reason === "max_tokens" ? text + "…" : text;
}

async function explain(tabId, buildContent) {
  if (!(await ensureContentScript(tabId))) {
    await notifyUnavailable();
    return;
  }

  await send(tabId, { type: "ELI5_LOADING" });

  const claudeApiKey = await getApiKey();
  if (!claudeApiKey) {
    await send(tabId, { type: "ELI5_ERROR", message: NO_KEY_MESSAGE });
    return;
  }

  try {
    const { content, record } = await buildContent();
    const text = await callClaude(claudeApiKey, content);
    await send(tabId, { type: "ELI5_RESULT", text, record });
  } catch (err) {
    await send(tabId, {
      type: "ELI5_ERROR",
      message: err.message || "Something went wrong. Try again."
    });
  }
}

function runExplain(tabId, selectedText) {
  return explain(tabId, () => ({
    content: `Explain the following in 3 to 5 sentences using simple, everyday language:\n\n${selectedText}`,
    record: { kind: "text", source: selectedText }
  }));
}

function toBase64(bytes) {
  const chunk = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function makeThumbnail(bytes, mimeType) {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: mimeType }));
  const scale = Math.min(1, THUMBNAIL_MAX_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = new OffscreenCanvas(width, height);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 });
  const encoded = toBase64(new Uint8Array(await blob.arrayBuffer()));
  return `data:image/jpeg;base64,${encoded}`;
}

async function fetchImage(imageUrl) {
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) throw new Error(`Could not fetch image (${imgResponse.status})`);

  const mimeType = (imgResponse.headers.get("content-type") || "image/jpeg").split(";")[0];
  if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const bytes = new Uint8Array(await imgResponse.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`Image is too large (${Math.round(bytes.length / 1e6)} MB). Limit is 4 MB.`);
  }

  // A failed thumbnail shouldn't cost the user their explanation.
  let thumbnail = null;
  try {
    thumbnail = await makeThumbnail(bytes, mimeType);
  } catch {}

  return {
    block: {
      type: "image",
      source: { type: "base64", media_type: mimeType, data: toBase64(bytes) }
    },
    thumbnail
  };
}

// srcUrl is only set when the click target was an image, so it takes precedence
// over any selection elsewhere on the page.
function explainTarget(tabId, info) {
  if (info.srcUrl) {
    return explain(tabId, async () => {
      const { block, thumbnail } = await fetchImage(info.srcUrl);
      return {
        content: [
          block,
          { type: "text", text: "Explain what's in this image in 3 to 5 sentences using simple, everyday language." }
        ],
        record: { kind: "image", source: info.srcUrl, thumbnail }
      };
    });
  }
  return runExplain(tabId, info.selectionText);
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "eli5-explain") return;
  explainTarget(tab.id, info);
});

async function saveItem({ record, explanation }) {
  const { eli5Saved = [] } = await browser.storage.local.get("eli5Saved");
  eli5Saved.push({
    kind: record.kind,
    source: record.source,
    thumbnail: record.thumbnail || null,
    explanation,
    savedAt: new Date().toISOString()
  });
  await browser.storage.local.set({ eli5Saved });
  return { ok: true, count: eli5Saved.length };
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ELI5_SAVE") return saveItem(msg);
});

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "eli5-explain") return;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  if (!(await ensureContentScript(tab.id))) {
    await notifyUnavailable();
    return;
  }
  const reply = await send(tab.id, { type: "ELI5_GET_SELECTION" });
  if (reply?.text?.trim()) runExplain(tab.id, reply.text);
});

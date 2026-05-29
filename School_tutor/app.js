/**
 * localStorage (classic script — reliable with file:// in Firefox; no ES modules).
 */
const SETTINGS_STORAGE_KEY = "schoolTutor.settings";

const DEFAULT_PROMPT = `Generate <num. items> items of swedish grade <level> math exercises and answer keys in swedish of level <level>, with difficulty <difficulty>.

Details:
1. Put the answer key only at the end under ## Facit.
2. Write the problems in Swedish.
3. Difficulty level lätt should be for 80% of students, medel correspond to 99% and svår is only for 1% of the students.
4. Focus all exercises on the topic: <category>.`;

const SYSTEM_PROMPT = "You follow instructions precisely. Produce clear Swedish math content as requested.";

const PROVIDERS = {
  openai: {
    label: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    models: ["gpt-4o-mini", "gpt-4o"],
    buildRequest(apiKey, model, system, userMsg) {
      return {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        },
      };
    },
    parseResponse(data) {
      return data.choices?.[0]?.message?.content;
    },
  },
  grok: {
    label: "Grok (xAI)",
    endpoint: "https://api.x.ai/v1/chat/completions",
    models: ["grok-3-mini", "grok-3"],
    buildRequest(apiKey, model, system, userMsg) {
      return {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        },
      };
    },
    parseResponse(data) {
      return data.choices?.[0]?.message?.content;
    },
  },
  claude: {
    label: "Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    buildRequest(apiKey, model, system, userMsg) {
      return {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: {
          model,
          max_tokens: 2048,
          system,
          messages: [{ role: "user", content: userMsg }],
        },
      };
    },
    parseResponse(data) {
      return data.content?.[0]?.text;
    },
  },
};

function defaultSettings() {
  return {
    openai: "",
    grok: "",
    claude: "",
    prompt: DEFAULT_PROMPT,
    provider: "openai",
    model: "gpt-4o-mini",
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    const merged = { ...defaultSettings(), ...parsed };
    if (merged.chatgpt && !merged.openai) merged.openai = merged.chatgpt;
    if (merged.userVariables && !merged.prompt) merged.prompt = merged.userVariables;
    return merged;
  } catch {
    return defaultSettings();
  }
}

function saveSettings(patch) {
  try {
    const next = { ...loadSettings(), ...patch };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadSettings();
  }
}

/**
 * @param {string} template
 * @param {{ numItems: number, level: string, difficulty: string, category: string }} p
 */
function buildPromptFromTemplate(template, p) {
  return template
    .replace(/<num\.?\s*items?>/g, String(p.numItems))
    .replace(/<level>/g, p.level)
    .replace(/<difficulty>/g, p.difficulty)
    .replace(/<category>/g, p.category);
}

/** @param {HTMLSelectElement | null} selectEl */
function getSelectLabel(selectEl) {
  if (!selectEl) return "";
  const opt = selectEl.selectedOptions[0];
  return opt ? opt.textContent.trim() : "";
}

function init() {
  try {
    if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings()));
    }
  } catch {
    /* ignore */
  }

  const generateBtn = document.getElementById("generateBtn");
  const exerciseOutput = document.getElementById("exerciseOutput");
  const levelEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("level"));
  const difficultyEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("difficulty"));
  const categoryEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("category"));
  const numItemsEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("numItems"));
  const providerEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("provider"));
  const modelEl = /** @type {HTMLSelectElement | null} */ (document.getElementById("model"));

  const settingsCog = document.getElementById("settingsCog");

  const settingsDialog = document.getElementById("settingsDialog");
  const settingsModalClose = document.getElementById("settingsModalClose");
  const openaiKey = document.getElementById("openaiKey");
  const grokKey = document.getElementById("grokKey");
  const claudeKey = document.getElementById("claudeKey");
  const promptText = document.getElementById("promptText");
  const settingsToast = document.getElementById("settingsToast");

  const saveOpenaiKey = document.getElementById("saveOpenaiKey");
  const deleteOpenaiKey = document.getElementById("deleteOpenaiKey");
  const saveGrokKey = document.getElementById("saveGrokKey");
  const deleteGrokKey = document.getElementById("deleteGrokKey");
  const saveClaudeKey = document.getElementById("saveClaudeKey");
  const deleteClaudeKey = document.getElementById("deleteClaudeKey");
  const savePrompt = document.getElementById("savePrompt");
  const deletePrompt = document.getElementById("deletePrompt");

  let toastTimer;
  function showSettingsToast(message) {
    if (settingsToast) settingsToast.textContent = message;
    clearTimeout(toastTimer);
    if (message) toastTimer = setTimeout(() => { if (settingsToast) settingsToast.textContent = ""; }, 3000);
  }

  function populateModelDropdown() {
    const s = loadSettings();
    const provider = s.provider || "openai";
    const providerConfig = PROVIDERS[provider];
    if (modelEl && providerConfig) {
      modelEl.innerHTML = providerConfig.models
        .map(m => `<option value="${m}" ${m === s.model ? "selected" : ""}>${m}</option>`)
        .join("");
    }
  }

  function fillSettingsForm() {
    const s = loadSettings();
    if (openaiKey) openaiKey.value = s.openai || s.chatgpt || "";
    if (grokKey) grokKey.value = s.grok || "";
    if (claudeKey) claudeKey.value = s.claude || "";
    if (promptText) {
      const p = s.prompt;
      promptText.value =
        p === undefined || p === null || String(p).trim() === "" ? DEFAULT_PROMPT : String(p);
    }
    if (providerEl) providerEl.value = s.provider || "openai";
    populateModelDropdown();
  }

  function onSettingsPointerDownCapture(e) {
    if (!settingsDialog || !settingsDialog.open) return;
    const t = /** @type {Node | null} */ (e.target);
    if (t && settingsCog && (settingsCog === t || settingsCog.contains(t))) return;
    if (t && settingsDialog.contains(t)) return;
    settingsDialog.close();
  }

  function onSettingsDialogClose() {
    document.removeEventListener("pointerdown", onSettingsPointerDownCapture, true);
    if (settingsCog) settingsCog.setAttribute("aria-expanded", "false");
    document.body.classList.remove("settings-modal-open");
    showSettingsToast("");
    settingsCog?.focus();
  }

  function openSettingsModal() {
    if (!settingsDialog) return;
    try {
      fillSettingsForm();
    } catch {
      /* ignore */
    }
    showSettingsToast("");
    try {
      settingsDialog.showModal();
    } catch {
      return;
    }
    if (settingsCog) settingsCog.setAttribute("aria-expanded", "true");
    document.body.classList.add("settings-modal-open");
    document.addEventListener("pointerdown", onSettingsPointerDownCapture, true);
    setTimeout(() => {
      if (promptText) promptText.focus();
      else openaiKey?.focus();
    }, 0);
  }

  function closeSettingsModal() {
    if (settingsDialog?.open) settingsDialog.close();
  }

  function setExerciseOutput(text, isError) {
    if (!exerciseOutput) return;
    exerciseOutput.textContent = text;
    exerciseOutput.classList.toggle("exercise-output--error", Boolean(isError));
  }

  if (settingsDialog) {
    settingsDialog.addEventListener("close", onSettingsDialogClose);
  }

  if (settingsCog) {
    settingsCog.addEventListener("click", (e) => {
      e.preventDefault();
      if (settingsDialog?.open) closeSettingsModal();
      else openSettingsModal();
    });
  }

  settingsModalClose?.addEventListener("click", () => closeSettingsModal());

  function createKeyHandler(provider, inputEl) {
    return {
      save() {
        try {
          saveSettings({ [provider]: inputEl?.value.trim() ?? "" });
          showSettingsToast(`${PROVIDERS[provider]?.label || provider} key saved.`);
        } catch {
          showSettingsToast("Could not save.");
        }
      },
      delete() {
        if (inputEl) inputEl.value = "";
        try {
          saveSettings({ [provider]: "" });
          showSettingsToast(`${PROVIDERS[provider]?.label || provider} key deleted.`);
        } catch {
          showSettingsToast("Could not delete.");
        }
      },
    };
  }

  if (providerEl) {
    providerEl.addEventListener("change", () => {
      saveSettings({ provider: providerEl.value });
      populateModelDropdown();
    });
  }

  if (modelEl) {
    modelEl.addEventListener("change", () => {
      saveSettings({ model: modelEl.value });
    });
  }

  generateBtn?.addEventListener("click", async () => {
    const s = loadSettings();
    const provider = s.provider || "openai";
    const model = s.model || PROVIDERS[provider].models[0];
    const apiKey = (s[provider] || "").trim();

    if (!apiKey) {
      setExerciseOutput(
        `Lägg till en ${PROVIDERS[provider]?.label || provider} API-nyckel under inställningar (kugghjulsikonen).`,
        true
      );
      return;
    }

    const numItems = parseInt(numItemsEl?.value ?? "10", 10) || 10;
    const level = getSelectLabel(levelEl);
    const difficulty = getSelectLabel(difficultyEl);
    const category = getSelectLabel(categoryEl);

    const storedPrompt = s.prompt;
    const template =
      storedPrompt !== undefined && storedPrompt !== null && String(storedPrompt).trim() !== ""
        ? String(storedPrompt)
        : DEFAULT_PROMPT;

    const userMessage = buildPromptFromTemplate(template, {
      numItems,
      level,
      difficulty,
      category,
    });

    const originalBtnText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.textContent = "Genererar…";
    setExerciseOutput("Genererar uppgifter…", false);

    try {
      const providerConfig = PROVIDERS[provider];
      if (!providerConfig) throw new Error(`Unknown provider: ${provider}`);

      const { headers, body } = providerConfig.buildRequest(apiKey, model, SYSTEM_PROMPT, userMessage);
      const res = await fetch(providerConfig.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error?.message || res.statusText || "Okänt fel från API.";
        throw new Error(msg);
      }

      const text = providerConfig.parseResponse(data);
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Tomt svar från modellen.");
      }
      setExerciseOutput(text.trim(), false);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Något gick fel. Om du öppnar sidan som fil (file://) kan webbläsaren blockera API-anrop (CORS). Kör sidan via en lokal webbserver.";
      setExerciseOutput(msg, true);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = originalBtnText;
    }
  });

  const openaiHandlers = createKeyHandler("openai", openaiKey);
  saveOpenaiKey?.addEventListener("click", () => openaiHandlers.save());
  deleteOpenaiKey?.addEventListener("click", () => openaiHandlers.delete());

  const grokHandlers = createKeyHandler("grok", grokKey);
  saveGrokKey?.addEventListener("click", () => grokHandlers.save());
  deleteGrokKey?.addEventListener("click", () => grokHandlers.delete());

  const claudeHandlers = createKeyHandler("claude", claudeKey);
  saveClaudeKey?.addEventListener("click", () => claudeHandlers.save());
  deleteClaudeKey?.addEventListener("click", () => claudeHandlers.delete());

  savePrompt?.addEventListener("click", () => {
    try {
      saveSettings({ prompt: promptText?.value ?? "" });
      showSettingsToast("Prompt saved.");
    } catch {
      showSettingsToast("Could not save.");
    }
  });

  deletePrompt?.addEventListener("click", () => {
    if (promptText) promptText.value = DEFAULT_PROMPT;
    try {
      saveSettings({ prompt: DEFAULT_PROMPT });
      showSettingsToast("Prompt reset to default.");
    } catch {
      showSettingsToast("Could not reset.");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

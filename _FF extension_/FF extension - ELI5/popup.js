const input = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

browser.storage.local.get("claudeApiKey").then(({ claudeApiKey }) => {
  if (claudeApiKey) input.value = claudeApiKey;
});

saveBtn.addEventListener("click", () => {
  const key = input.value.trim();
  browser.storage.local.set({ claudeApiKey: key }).then(() => {
    status.textContent = key ? "Saved." : "Key cleared.";
    status.className = "success";
    setTimeout(() => { status.textContent = ""; }, 2000);
  });
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveBtn.click();
});

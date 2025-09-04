const DEFAULT_PROMPT =
  "Provide a comprehensive explanation drawing on systematic reviews and meta-analyses (SR/MA), and list recommendations according to the GRADE system.";

const DEFAULT_SETTINGS = { prompt: DEFAULT_PROMPT };

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => resolve(items));
  });
}

function saveSettings(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => resolve());
  });
}

(async function init() {
  const { prompt } = await getSettings();
  document.getElementById("prompt").value = prompt;

  document.getElementById("save").addEventListener("click", async () => {
    const promptText = document.getElementById("prompt").value.trim() || DEFAULT_PROMPT;
    await saveSettings({ prompt: promptText });
    const status = document.getElementById("status");
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1500);
  });
})();

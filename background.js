// ===== Default settings =====
const DEFAULT_PROMPT =
  "Provide a comprehensive explanation drawing on systematic reviews and meta-analyses (SR/MA), and list recommendations according to the GRADE system.";

const DEFAULT_SETTINGS = {
  // 付与する英語プロンプトのみを保持（検索先は OpenEvidence 固定）
  prompt: DEFAULT_PROMPT
};

// Branding icon generation handled in popup (DOM canvas) to avoid SW issues.

// ===== Helpers =====
function buildQueries(userQuery, promptText) {
  const q = (userQuery || "").trim();
  const alreadyHas = q.toLowerCase().includes(promptText.toLowerCase());
  const withPrompt = alreadyHas ? q : (q ? `${q} — ${promptText}` : promptText);
  return { q, withPrompt };
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => resolve(items));
  });
}

async function handleSearch(rawQuery, disposition) {
  const { prompt } = await getSettings();
  const { withPrompt } = buildQueries(rawQuery, prompt);
  // Always open a NEW TAB with a query parameter that the content script reads.
  // This avoids needing the "tabs" permission and messaging.
  const url = `https://openevidence.com/?oe_q=${encodeURIComponent(withPrompt)}`;
  try {
    await chrome.tabs.create({ url, active: true });
  } catch (_) {
    // As a fallback (very rare), try window.open via an extension page is not available here.
    // chrome.tabs.create is expected to work without the "tabs" permission for opening a new tab.
  }
}

// Popup からの依頼もここで受ける
chrome.runtime.onMessage.addListener((msg, _sender, _resp) => {
  if (msg?.type === 'OE_SEARCH' && typeof msg.query === 'string') {
    handleSearch(msg.query);
  }
});

// ===== Omnibox: `oe <query>` =====
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  // Ignore disposition; always open a new foreground tab to avoid the "tabs" permission.
  handleSearch(text);
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  // 入力中サジェスト（視認性向上）
  const { withPrompt: preview } = buildQueries(text, DEFAULT_PROMPT);
  // Chrome requires suggestion.content to be a non-empty string.
  // When the user has typed nothing after the keyword, fall back to a
  // non-empty preview string to avoid runtime errors.
  const safeContent = (text && text.length > 0) ? text : preview;
  suggest([
    {
      content: safeContent,
      description: `Search with SR/MA + GRADE suffix: <match>${preview}</match>`
    }
  ]);
});

// ===== Context Menu (selection) =====
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.contextMenus.removeAll();
  } catch (_) {}
  chrome.contextMenus.create({
    id: "oe-search",
    title: 'Search OpenEvidence: "%s" (+ SR/MA & GRADE)',
    contexts: ["selection"]
  });
});


chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "oe-search" && info.selectionText) {
    handleSearch(info.selectionText);
  }
});

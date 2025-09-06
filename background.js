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

async function openSearch(url, disposition) {
  // Omnibox disposition に応じて開き方を変える
  try {
    if (disposition === "currentTab") {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { url });
        return;
      }
    } else if (disposition === "newBackgroundTab") {
      await chrome.tabs.create({ url, active: false });
      return;
    }
  } catch (_) {
    // fallthrough to default create
  }
  await chrome.tabs.create({ url });
}

async function handleSearch(rawQuery, disposition) {
  const { prompt } = await getSettings();
  const { withPrompt } = buildQueries(rawQuery, prompt);

  // OpenEvidence を開いて、検索欄へ投入 + 送信（ボタン押下）
  const tab = await chrome.tabs.create({ url: "https://openevidence.com/" });
  const tabId = tab.id;

  const send = (type) => chrome.tabs.sendMessage(
    tabId,
    { type, query: withPrompt },
    () => void chrome.runtime.lastError
  );

  const onUpdated = (updatedTabId, info) => {
    if (updatedTabId === tabId && info.status === "complete") {
      send("OE_APPLY_AND_SUBMIT");
      chrome.tabs.onUpdated.removeListener(onUpdated);
    }
  };
  chrome.tabs.onUpdated.addListener(onUpdated);
  // フォールバック送信（SPA遅延対策）
  setTimeout(() => send("OE_APPLY_AND_SUBMIT"), 1500);
  setTimeout(() => send("OE_APPLY_AND_SUBMIT"), 3000);
}

// Popup からの依頼もここで受ける
chrome.runtime.onMessage.addListener((msg, _sender, _resp) => {
  if (msg?.type === 'OE_SEARCH' && typeof msg.query === 'string') {
    handleSearch(msg.query);
  }
});

// ===== Omnibox: `oe <query>` =====
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  handleSearch(text, disposition);
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

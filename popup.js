const DEFAULT_PROMPT =
  "Provide a comprehensive explanation drawing on systematic reviews and meta-analyses (SR/MA), and list recommendations according to the GRADE system.";

const DEFAULT_SETTINGS = { prompt: DEFAULT_PROMPT };

function makeQueries(userQuery, promptText) {
  const q = (userQuery || "").trim();
  const withPrompt = q ? `${q} — ${promptText}` : promptText;
  return { q, withPrompt };
}

function buildUrl(engine, q, withPrompt) {
  if (engine === "openevidence") {
    // Top を開いて拡張が注入（background 側が処理）
    return `https://www.openevidence.com/`;
  }
  // Google 検索では付与文は入れない
  const googleQ = `site:openevidence.com ${q}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(googleQ)}`;
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => resolve(items));
  });
}

function requestSearch(query) {
  chrome.runtime.sendMessage({ type: 'OE_SEARCH', query });
}

(async function init() {
  // Draw orange background + white O and set as icon (safe in popup DOM)
  try {
    const sizes = [16, 32, 48, 128];
    const imageData = {};
    for (const s of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = s; canvas.height = s;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#e4643d';
      ctx.fillRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2;
      const rOuter = s * 0.42;
      const rInner = s * 0.26;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, rOuter, 0, Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(cx, cy, rInner, 0, Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      imageData[s] = ctx.getImageData(0, 0, s, s);
    }
    chrome.action.setIcon({ imageData }, () => void chrome.runtime.lastError);
  } catch (_) { /* ignore icon errors */ }

  document.getElementById("go").addEventListener("click", async () => {
    const q = document.getElementById("q").value;
    requestSearch(q);
  });

  // 日本語 IME 変換中の Enter では送信しない
  let composing = false;
  const input = document.getElementById("q");
  input.addEventListener("compositionstart", () => (composing = true));
  input.addEventListener("compositionend", () => (composing = false));
  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      if (e.isComposing || composing) return; // 変換確定 Enter を無視
      requestSearch(input.value);
    }
  });

  document.getElementById("openOptions").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
})();

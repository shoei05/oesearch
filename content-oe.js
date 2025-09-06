(() => {
  let lastApplied = "";
  let lastSubmittedAt = 0;
  let imeComposing = false;
  let imeLastEndedAt = 0;
  const IME_GUARD_WINDOW_MS = 120; // treat Enter just after composition as IME-confirm
  let imeGuardEnabled = true;

  function getSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage?.sync?.get?.({ imeGuardEnabled: true }, (items) => resolve(items || { imeGuardEnabled: true }));
      } catch {
        resolve({ imeGuardEnabled: true });
      }
    });
  }
  // Try to find a search field on OpenEvidence and set text
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'textarea') return true;
    if (tag === 'input') {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return ['text', 'search', 'url', 'email'].includes(type) || type === '';
    }
    return !!el.isContentEditable;
  }

  function byXPath(xpath) {
    try {
      const r = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return r.singleNodeValue || null;
    } catch { return null; }
  }

  function queryCandidates(root = document) {
    // 優先: 指定の XPath（ページ改修に備えて失敗時はセレクタへフォールバック）
    const xpField = '/html/body/div[1]/div[1]/div[2]/div[2]/div[1]/div/div[1]/div[2]/form/div/div[1]/div[1]/div/textarea[1]';
    const explicit = byXPath(xpField);
    if (explicit && isEditable(explicit)) return explicit;

    const selectors = [
      'form textarea',
      'textarea',
      'form input[type="search"]',
      'input[type="search"]',
      'input[role="searchbox"]',
      'input[name="q"]',
      'input[placeholder*="search" i]',
      'textarea[placeholder*="search" i]',
      '[contenteditable="true"]'
    ];
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el && isEditable(el)) return el;
    }
    const el = root.querySelector('input,textarea,[contenteditable="true"]');
    return isEditable(el) ? el : null;
  }

  // Install IME-aware Enter handling so that confirming prediction with Enter
  // does not trigger page-level submit handlers.
  function installImeGuard() {
    if (window.__oeImeGuardInstalled) return;
    window.__oeImeGuardInstalled = true;

    const onCompStart = (e) => {
      if (!isEditable(e.target)) return;
      imeComposing = true;
    };
    const onCompEnd = (e) => {
      if (!isEditable(e.target)) return;
      imeComposing = false;
      imeLastEndedAt = Date.now();
    };
    const shouldBlock = (e) => {
      if (!imeGuardEnabled) return false;
      if (e.key !== 'Enter') return false;
      if (!isEditable(e.target)) return false;
      if (!e.isTrusted) return false; // allow synthetic events from this extension
      const now = Date.now();
      const likelyIme = e.isComposing || e.keyCode === 229 || imeComposing || (now - imeLastEndedAt) <= IME_GUARD_WINDOW_MS;
      return !!likelyIme;
    };
    const onKeyDown = (e) => {
      if (!shouldBlock(e)) return;
      // Block page handlers that submit on Enter during composition.
      // Keep default behavior so IME can commit the candidate text.
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      else e.stopPropagation();
      // In single-line inputs, Enter may submit by default; prevent that.
      const tag = e.target.tagName?.toLowerCase?.();
      if (tag === 'input') e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (!shouldBlock(e)) return;
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      else e.stopPropagation();
    };

    // Capture phase to preempt site handlers
    document.addEventListener('compositionstart', onCompStart, true);
    document.addEventListener('compositionend', onCompEnd, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    // Some sites still rely on keypress
    document.addEventListener('keypress', onKeyDown, true);
  }

  function setText(el, text) {
    if (!el) return;
    if (el.isContentEditable) {
      el.focus();
      el.innerText = text;
    } else {
      el.focus();
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function findSubmitButton(near) {
    const xpButton = '/html/body/div[1]/div[1]/div[2]/div[2]/div[1]/div/div[1]/div[2]/form/div/div[1]/div[2]/button';
    const byXp = byXPath(xpButton);
    if (byXp instanceof HTMLButtonElement) return byXp;

    // If the field is within a form, prefer its submit button
    const form = near?.closest?.('form') || document.querySelector('form');
    if (form) {
      const btn = form.querySelector('button[type="submit"], button, input[type="submit"]');
      if (btn) return btn;
    }
    // Fallback: any visible button
    return document.querySelector('button, input[type="submit"]');
  }

  async function applyQuery(q, shouldSubmit) {
    if (!q) return;
    const now = Date.now();
    if (q === lastApplied) {
      if (!shouldSubmit) return; // already set
      if (now - lastSubmittedAt < 4000) return; // avoid double submit
    }
    // Retry for SPA-mounted inputs up to ~5s
    const started = Date.now();
    let submitted = false;
    const tryOnce = () => {
      const field = queryCandidates();
      if (field) {
        setText(field, q);
        field.focus();
        lastApplied = q;
        if (shouldSubmit && !submitted) {
          const btn = findSubmitButton(field);
          if (btn) {
            submitted = true;
            btn.click();
          } else if (field.form) {
            submitted = true;
            field.form.requestSubmit ? field.form.requestSubmit() : field.form.submit();
          } else {
            // As a last resort, simulate Enter
            submitted = true;
            field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          }
          lastSubmittedAt = Date.now();
        }
        return true;
      }
      return false;
    };
    if (tryOnce()) return;
    const id = setInterval(() => {
      if (tryOnce() || Date.now() - started > 7000) clearInterval(id);
    }, 250);
  }

  chrome.runtime.onMessage.addListener((msg, _sender, _resp) => {
    // Ensure IME guard is active when enabled
    if (imeGuardEnabled) { try { installImeGuard(); } catch {} }
    if (msg?.type === 'OE_APPLY_QUERY' && typeof msg.query === 'string') {
      applyQuery(msg.query, false);
    }
    if (msg?.type === 'OE_APPLY_AND_SUBMIT' && typeof msg.query === 'string') {
      applyQuery(msg.query, true);
    }
  });

  // Optional: if opened with ?oe_q=...
  try {
    const url = new URL(location.href);
    const p = url.searchParams.get('oe_q');
    getSettings().then(({ imeGuardEnabled: enabled }) => {
      imeGuardEnabled = !!enabled;
      if (imeGuardEnabled) { try { installImeGuard(); } catch {} }
      if (p) {
        applyQuery(p, true);
      }
    });
  } catch {}
  // Reflect live option changes without reload
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' || !changes.imeGuardEnabled) return;
      imeGuardEnabled = !!changes.imeGuardEnabled.newValue;
      if (imeGuardEnabled) { try { installImeGuard(); } catch {} }
      // Disabling after install: we cannot unhook capture listeners safely for third-party pages;
      // but we keep guard passive by leaving it installed and only relying on 'imeGuardEnabled' in shouldBlock.
    });
  } catch {}
})();

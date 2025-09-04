(() => {
  let lastApplied = "";
  let lastSubmittedAt = 0;
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
    if (p) applyQuery(p, true);
  } catch {}
})();

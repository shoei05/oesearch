# Icons for Chrome Web Store

This folder is for the extension package icons. The Chrome Web Store requires a 128×128 PNG inside the package (and it’s best practice to also include 16×16 and 48×48).

Quickest way to generate the three PNGs with the current orange O design:

1) Open `icons/generate.html` in Chrome.
2) Click the three buttons to download `icon16.png`, `icon48.png`, and `icon128.png`.
3) Move those three files into this `icons/` folder.
4) Run the helper to update `manifest.json` icons (from repo root):

```
python3 scripts/set_icons.py
```

5) Re‑load the unpacked extension to verify the new toolbar icon.

If you prefer your own artwork, just drop `icon16.png`, `icon48.png`, and `icon128.png` here and run the same `set_icons.py` script.


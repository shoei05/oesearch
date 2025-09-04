#!/usr/bin/env python3
import json, os

ROOT = os.path.dirname(os.path.dirname(__file__))
mf_path = os.path.join(ROOT, 'manifest.json')
icons_dir = os.path.join(ROOT, 'icons')

required = {
  '16': 'icons/icon16.png',
  '48': 'icons/icon48.png',
  '128': 'icons/icon128.png',
}

missing = [p for p in required.values() if not os.path.exists(os.path.join(ROOT, p))]
if missing:
  print('[set_icons] Missing files:\n  - ' + '\n  - '.join(missing))
  print('Generate via icons/generate.html, then re-run this script.')
  exit(1)

with open(mf_path, 'r', encoding='utf-8') as f:
  mf = json.load(f)

mf['icons'] = required
mf.setdefault('action', {})
mf['action']['default_icon'] = required

with open(mf_path, 'w', encoding='utf-8') as f:
  json.dump(mf, f, ensure_ascii=False, indent=2)

print('[set_icons] Updated manifest.json with icons and action.default_icon.')


#!/usr/bin/env bash
set -euo pipefail

# Packs the extension into ../oesearch-mv3.zip with manifest at the root.
# Excludes dev files and VCS metadata.

cd "$(dirname "$0")/.."

ZIP_PATH="../oesearch-mv3.zip"
echo "[pack] Writing $ZIP_PATH"

rm -f "$ZIP_PATH"

zip -r -X "$ZIP_PATH" . \
  -x '*.git*' \
  -x '*node_modules*' \
  -x '*dist*' \
  -x '*build*' \
  -x '*icons/generate.html' \
  -x '*icons/README.md' \
  -x '*scripts/*' \
  -x '*.DS_Store'

echo "[pack] Done: $ZIP_PATH"


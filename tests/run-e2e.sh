#!/bin/sh
# Lance le test de bout en bout dans Chrome headless et affiche le rapport
DIR=$(cd "$(dirname "$0")" && pwd)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE=$(mktemp -d)
OUT=$("$CHROME" --headless=new --disable-gpu --allow-file-access-from-files --user-data-dir="$PROFILE" --virtual-time-budget=20000 --dump-dom "file://$DIR/e2e.html" 2>/dev/null)
rm -rf "$PROFILE"
REPORT=$(echo "$OUT" | sed -n '/<pre id="out">/,/<\/pre>/p' | sed 's/<[^>]*>//g')
echo "$REPORT"
echo "$REPORT" | head -1 | grep -q "E2E PASSED"

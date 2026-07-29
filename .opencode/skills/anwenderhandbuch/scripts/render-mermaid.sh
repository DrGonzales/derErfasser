#!/usr/bin/env bash
# Rendert eine Mermaid-Datei (.mmd) zu SVG, ohne dass mermaid-cli oder ein
# eigenes Chromium dauerhaft im Projekt installiert werden müssen.
#
# Nutzung:
#   render-mermaid.sh <input.mmd> <output.svg>
#
# Voraussetzungen:
#   - Node.js / npm
#   - Ein bereits installiertes Playwright-Chromium (z. B. via
#     `npx playwright install chromium` oder vorhanden unter
#     ~/.cache/ms-playwright/chromium-*). Falls keines gefunden wird, lädt
#     mermaid-cli sein eigenes Puppeteer-Chromium herunter (kann in
#     eingeschränkten Umgebungen fehlschlagen/lange dauern).
set -euo pipefail

if [ $# -ne 2 ]; then
    echo "Usage: $0 <input.mmd> <output.svg>" >&2
    exit 1
fi

INPUT="$(realpath "$1")"
OUTPUT="$(realpath -m "$2")"

if [ ! -f "$INPUT" ]; then
    echo "Eingabedatei nicht gefunden: $INPUT" >&2
    exit 1
fi

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

CHROME_PATH="$(find "$HOME/.cache/ms-playwright" -maxdepth 2 -iname "chrome" -path "*chromium-*" 2>/dev/null | head -n1 || true)"

cd "$WORKDIR"
npm init -y >/dev/null 2>&1

if [ -n "$CHROME_PATH" ]; then
    echo "Nutze vorhandenes Playwright-Chromium: $CHROME_PATH" >&2
    PUPPETEER_SKIP_DOWNLOAD=true npm install @mermaid-js/mermaid-cli --no-audit --no-fund >/dev/null 2>&1
    cat > puppeteer-config.json <<EOF
{"executablePath":"$CHROME_PATH","args":["--no-sandbox"]}
EOF
    node_modules/.bin/mmdc -i "$INPUT" -o "$OUTPUT" -b white -p puppeteer-config.json
else
    echo "Kein Playwright-Chromium gefunden, mermaid-cli lädt eigenes Chromium herunter..." >&2
    npm install @mermaid-js/mermaid-cli --no-audit --no-fund >/dev/null 2>&1
    echo '{"args":["--no-sandbox"]}' > puppeteer-config.json
    node_modules/.bin/mmdc -i "$INPUT" -o "$OUTPUT" -b white -p puppeteer-config.json
fi

echo "Erzeugt: $OUTPUT" >&2

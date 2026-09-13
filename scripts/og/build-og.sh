#!/usr/bin/env bash
# Genera public/og.png (1200×630), la imatge que surt quan es comparteix l'enllaç.
# Cal Firefox (mode headless) i connexió per carregar les lletres de Google Fonts.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../../public/og.png"
firefox --headless --screenshot "$out" --window-size=1200,630 "file://$here/og.html"
echo "escrit $out"

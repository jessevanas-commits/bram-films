#!/usr/bin/env bash
# Start De films van Bram lokaal op http://localhost:8000 (Linux/macOS)
cd "$(dirname "$0")" || exit 1
PY=python3; command -v python3 >/dev/null 2>&1 || PY=python
if [ -f serve.py ]; then
  exec "$PY" serve.py 8000
else
  ( sleep 1; (xdg-open http://localhost:8000 || open http://localhost:8000) >/dev/null 2>&1 ) &
  exec "$PY" -m http.server 8000
fi

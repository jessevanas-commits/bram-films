#!/bin/bash
# Dubbelklik op dit bestand op een Mac om De films van Bram te openen op http://localhost:8000
cd "$(dirname "$0")" || exit 1
if [ -f serve.py ]; then
  python3 serve.py 8000
else
  ( sleep 1; open http://localhost:8000 ) &
  python3 -m http.server 8000
fi

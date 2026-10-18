#!/bin/sh
# Führt alle Tests aus: mit node, falls vorhanden, sonst mit JavaScriptCore (macOS).
cd "$(dirname "$0")/.." || exit 1
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
if command -v node >/dev/null 2>&1; then
  exec node tests/run.js "$@"
elif [ -x "$JSC" ]; then
  exec "$JSC" -m tests/run.js -- "$@"
else
  echo "Weder node noch jsc gefunden. Tests im Browser: tests/test.html" >&2
  exit 1
fi

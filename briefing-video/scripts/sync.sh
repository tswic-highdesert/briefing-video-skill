#!/usr/bin/env bash
# Build scene sources, and optionally push them to a remote render box.
# Usage: sync.sh <project dir> <slug> [--padcheck]
#   --padcheck builds the padding-lint version for snapshots; build again without it before rendering
#   project dir holds build.py, common.css, common.js, src/, index.html
# Local (default): just runs build.py. Render in the project dir.
# Remote: set BRIEF_HOST=user@host (and optionally BRIEF_DIR, default "videos") to rsync the built
#   sources to $BRIEF_HOST:$BRIEF_DIR/<slug>/ (never assets/audio, renders or node_modules).
#   Copy assets/ and the voice once by hand; this only pushes what changes while you iterate.
set -euo pipefail
PROJ="${1:?project dir}"; SLUG="${2:?slug}"
python3 "$PROJ/build.py" "${@:3}"
if [ -z "${BRIEF_HOST:-}" ]; then
  echo "built locally in $PROJ (set BRIEF_HOST=user@host to sync to a render box)"
  exit 0
fi
DIR="${BRIEF_DIR:-videos}"
SRC=("$PROJ/compositions" "$PROJ/index.html" "$PROJ/src" "$PROJ/build.py" "$PROJ/common.css" "$PROJ/common.js")
[ -f "$PROJ/padcheck.js" ] && SRC+=("$PROJ/padcheck.js")
ssh "$BRIEF_HOST" "mkdir -p '$DIR/$SLUG'"
rsync -a "${SRC[@]}" "$BRIEF_HOST:$DIR/$SLUG/"
echo "synced to $BRIEF_HOST:$DIR/$SLUG/"

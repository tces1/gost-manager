#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

cd "$ROOT_DIR/frontend"
npm ci
npm run build

cd "$ROOT_DIR"
go build -o gost-manager main.go
"$ROOT_DIR/scripts/install-gost-engine.sh"

echo "local build complete: $ROOT_DIR/gost-manager and $ROOT_DIR/gost-engine"

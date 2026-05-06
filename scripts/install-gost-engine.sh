#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
VERSION=${1:-3.0.0-rc10}
OUTPUT=${2:-"$ROOT_DIR/gost-engine"}
OS_NAME=${TARGETOS:-$(uname -s)}
ARCH_NAME=${TARGETARCH:-$(uname -m)}
ASSET=$("$ROOT_DIR/scripts/resolve-gost-asset.sh" "$OS_NAME" "$ARCH_NAME" "$VERSION")
URL="https://github.com/go-gost/gost/releases/download/v${VERSION}/${ASSET}"
TMP_DIR=$(mktemp -d)
ARCHIVE_PATH="$TMP_DIR/$ASSET"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

echo "downloading $URL"
curl --retry 5 --retry-delay 2 --retry-all-errors -fsSL "$URL" -o "$ARCHIVE_PATH"
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR"

if [ ! -f "$TMP_DIR/gost" ]; then
  echo "downloaded archive does not contain gost binary" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
mv "$TMP_DIR/gost" "$OUTPUT"
chmod +x "$OUTPUT"
echo "installed gost engine to $OUTPUT"

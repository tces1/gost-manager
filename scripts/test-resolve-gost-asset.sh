#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RESOLVE="$ROOT_DIR/scripts/resolve-gost-asset.sh"

assert_asset() {
  os=$1
  arch=$2
  version=$3
  expected=$4
  variant=${5:-}

  actual=$("$RESOLVE" "$os" "$arch" "$version" "$variant")
  if [ "$actual" != "$expected" ]; then
    echo "expected $expected for $os/$arch, got $actual" >&2
    exit 1
  fi
}

assert_asset Darwin arm64 3.0.0-rc10 gost_3.0.0-rc10_darwin_arm64.tar.gz
assert_asset Darwin x86_64 3.0.0-rc10 gost_3.0.0-rc10_darwin_amd64.tar.gz
assert_asset Linux aarch64 3.0.0-rc10 gost_3.0.0-rc10_linux_arm64.tar.gz
assert_asset Linux amd64 3.0.0-rc10 gost_3.0.0-rc10_linux_amd64.tar.gz
assert_asset Linux arm 3.0.0-rc10 gost_3.0.0-rc10_linux_armv7.tar.gz v7
assert_asset Linux armv7l 3.0.0-rc10 gost_3.0.0-rc10_linux_armv7.tar.gz
assert_asset Linux armv6l 3.0.0-rc10 gost_3.0.0-rc10_linux_armv6.tar.gz

if "$RESOLVE" FreeBSD amd64 3.0.0-rc10 >/tmp/gost-resolve-test.out 2>/tmp/gost-resolve-test.err; then
  echo "expected unsupported OS to fail" >&2
  exit 1
fi

echo "resolve-gost-asset tests passed"

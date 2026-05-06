#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <os> <arch> <version>" >&2
  exit 1
fi

os_input=$1
arch_input=$2
version=$3

case "$os_input" in
  Darwin|darwin)
    os=darwin
    ;;
  Linux|linux)
    os=linux
    ;;
  *)
    echo "unsupported OS: $os_input" >&2
    exit 1
    ;;
esac

case "$arch_input" in
  x86_64|amd64)
    arch=amd64
    ;;
  arm64|aarch64)
    arch=arm64
    ;;
  *)
    echo "unsupported architecture: $arch_input" >&2
    exit 1
    ;;
esac

printf 'gost_%s_%s_%s.tar.gz\n' "$version" "$os" "$arch"

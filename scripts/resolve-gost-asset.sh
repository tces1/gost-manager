#!/bin/sh
set -eu

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
  echo "usage: $0 <os> <arch> <version> [variant]" >&2
  exit 1
fi

os_input=$1
arch_input=$2
version=$3
variant_input=${4:-}

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
  arm)
    case "$variant_input" in
      v5|5)
        arch=armv5
        ;;
      v6|6)
        arch=armv6
        ;;
      v7|7|'')
        arch=armv7
        ;;
      *)
        echo "unsupported arm variant: $variant_input" >&2
        exit 1
        ;;
    esac
    ;;
  armv5|armv5l|armv5tel)
    arch=armv5
    ;;
  armv6|armv6l)
    arch=armv6
    ;;
  armv7|armv7l)
    arch=armv7
    ;;
  *)
    echo "unsupported architecture: $arch_input" >&2
    exit 1
    ;;
esac

printf 'gost_%s_%s_%s.tar.gz\n' "$version" "$os" "$arch"

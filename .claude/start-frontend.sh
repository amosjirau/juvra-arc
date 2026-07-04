#!/usr/bin/env bash
# Start the Juvra frontend dev server for the preview tool.
#
# The system default `node` is v12, which cannot run Next.js 16 (the Next CLI
# uses optional chaining and throws a SyntaxError on v12). nvm has Node 22, so
# we put the highest installed v22 toolchain on PATH before invoking npm.

set -e

NODE_BASE="/home/jurau/.nvm/versions/node"
V22_BIN="$(ls -d "$NODE_BASE"/v22*/bin 2>/dev/null | sort -V | tail -1)"

if [ -z "$V22_BIN" ] && [ -d "$NODE_BASE/v22.23.1/bin" ]; then
  V22_BIN="$NODE_BASE/v22.23.1/bin"
fi

if [ -n "$V22_BIN" ]; then
  export PATH="$V22_BIN:$PATH"
fi

cd /home/jurau/juvra-arc/frontend
exec npm run dev -- -p 3000

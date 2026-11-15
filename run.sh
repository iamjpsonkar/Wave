#!/usr/bin/env bash
set -Ee -o pipefail
ROOT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"
usage() {
  cat <<'USAGE'
Wave development server
Usage: ./run.sh [--install] [vite options...]
  --install   Reinstall locked dependencies with npm ci before starting.
  -h, --help  Show this help.
Environment: WAVE_HOST (default 127.0.0.1), WAVE_PORT (default 5173)
USAGE
}
force_install=0
if [[ "$#" -gt 0 && "$1" == "--install" ]]; then force_install=1; shift; fi
if [[ "$#" -gt 0 && ( "$1" == "-h" || "$1" == "--help" ) ]]; then usage; exit 0; fi
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required." >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 6) ? 0 : 1)' || {
  echo "Error: Wave requires Node.js 22.6 or newer. Current version: $(node --version)" >&2
  exit 1
}
if ((force_install)) || [[ ! -x node_modules/.bin/vite ]]; then
  echo "Installing locked Wave dependencies..."
  npm ci
fi
host=127.0.0.1
port=5173
if [[ -n "$WAVE_HOST" ]]; then host="$WAVE_HOST"; fi
if [[ -n "$WAVE_PORT" ]]; then port="$WAVE_PORT"; fi
echo "Starting Wave at http://$host:$port"
echo "Press Ctrl+C to stop the development server."
exec npm run dev -- --host "$host" --port "$port" "$@"

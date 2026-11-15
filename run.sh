#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "\${BASH_SOURCE[0]}")" && pwd)"
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
vite_args=()
while (($#)); do
  case "$1" in
    --install) force_install=1 ;;
    -h|--help) usage; exit 0 ;;
    --) shift; vite_args+=("$@"); break ;;
    *) vite_args+=("$1") ;;
  esac
  shift
done
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
host="\${WAVE_HOST:-127.0.0.1}"
port="\${WAVE_PORT:-5173}"
echo "Starting Wave at http://\${host}:\${port}"
echo "Press Ctrl+C to stop the development server."
exec npm run dev -- --host "$host" --port "$port" "\${vite_args[@]}"

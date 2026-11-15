#!/usr/bin/env bash
set -Ee -o pipefail
ROOT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"
on_error() {
  status=$?
  echo >&2
  printf 'FAILED (exit %s) near line %s: %s\n' "$status" "$LINENO" "$BASH_COMMAND" >&2
  exit "$status"
}
trap on_error ERR
usage() {
  cat <<'USAGE'
Wave local verification runner
Usage: ./test.sh [options]
Default: Node tests, typecheck, production build and Playwright Chromium E2E.
Options:
  --no-e2e                  Skip browser E2E.
  --skip-install            Do not run npm ci; fail if project dependencies are missing.
  --skip-playwright-install Do not install @playwright/test; fail if missing.
  --skip-browser-install    Do not download Chromium; reuse an installed browser.
  -h, --help                Show this help.
Environment: PLAYWRIGHT_VERSION (default 1.55.0)
USAGE
}
skip_install=0
skip_playwright_install=0
skip_browser_install=0
run_e2e=1
while (($#)); do
  case "$1" in
    --no-e2e) run_e2e=0 ;;
    --skip-install) skip_install=1 ;;
    --skip-playwright-install) skip_playwright_install=1 ;;
    --skip-browser-install) skip_browser_install=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required." >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 6) ? 0 : 1)' || {
  echo "Error: Wave tests require Node.js 22.6 or newer. Current version: $(node --version)" >&2
  exit 1
}
if [[ ! -x node_modules/.bin/tsc || ! -x node_modules/.bin/vite ]]; then
  if ((skip_install)); then
    echo "Error: dependencies are missing. Run npm ci or omit --skip-install." >&2
    exit 1
  fi
  echo "Installing locked project dependencies..."
  npm ci
fi
run_step() {
  label="$1"
  shift
  printf '\n==> %s\n' "$label"
  "$@"
}
run_step "Node unit and storage tests" npm test
run_step "TypeScript typecheck" npm run typecheck
run_step "Production build" npm run build
if ((run_e2e)); then
  if [[ ! -x node_modules/.bin/playwright ]]; then
    if ((skip_playwright_install)); then
      echo "Error: @playwright/test is missing. Omit --skip-playwright-install to install it." >&2
      exit 1
    fi
    version="$PLAYWRIGHT_VERSION"
    if [[ -z "$version" ]]; then version=1.55.0; fi
    run_step "Install Playwright test runner ($version)" npm install --no-save --package-lock=false "@playwright/test@$version"
  fi
  if ((!skip_browser_install)); then
    run_step "Install Playwright Chromium browser" npx playwright install chromium
  fi
  run_step "Playwright Chromium end-to-end tests" npm run test:e2e
else
  echo
  echo "Skipping browser E2E tests (--no-e2e)."
fi
echo
echo "All selected local checks passed."

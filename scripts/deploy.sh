#!/usr/bin/env bash
# deploy.sh — Build and deploy the terminal portfolio site
# Usage: ./scripts/deploy.sh [--docker]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."
SITE_DIR="${PROJECT_ROOT}/site/nextjs-terminal-site"

echo "=== yigang666 Deploy Script ==="

# Load config
echo "--- Loading configuration..."
source "${SCRIPT_DIR}/load-config.sh"

# Parse flags
DOCKER_MODE=false
for arg in "$@"; do
  case "$arg" in
    --docker) DOCKER_MODE=true ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

if [[ "${DOCKER_MODE}" == "true" ]]; then
  echo "--- Building Docker image..."
  docker build \
    --build-arg NEXT_PUBLIC_GITHUB_REPO="${NEXT_PUBLIC_GITHUB_REPO}" \
    --build-arg NEXT_PUBLIC_GITHUB_API_BASE="${NEXT_PUBLIC_GITHUB_API_BASE}" \
    --build-arg NEXT_PUBLIC_PLAUSIBLE_ENDPOINT="${NEXT_PUBLIC_PLAUSIBLE_ENDPOINT}" \
    --build-arg NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS="${NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS}" \
    -t yigang666:latest \
    "${PROJECT_ROOT}"

  echo "--- Docker image built: yigang666:latest"
  echo "    Run with: docker run -p 8080:80 yigang666:latest"
else
  echo "--- Installing dependencies..."
  cd "${SITE_DIR}"
  npm ci

  echo "--- Building static site..."
  npm run build

  echo "--- Build complete: ${SITE_DIR}/out/"
  echo "    Deploy contents of 'out/' to your static host."
fi

echo "=== Deploy complete ==="

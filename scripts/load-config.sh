#!/usr/bin/env bash
# load-config.sh — Parse config/services.yaml and export NEXT_PUBLIC_* env vars
# Usage: source scripts/load-config.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../config/services.yaml"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "ERROR: config/services.yaml not found at ${CONFIG_FILE}" >&2
  exit 1
fi

# Parse YAML values using grep/sed (no external YAML parser required)
get_yaml_value() {
  local key="$1"
  grep -A1 "${key}:" "${CONFIG_FILE}" | tail -1 | sed 's/.*: *//' | tr -d '"' | tr -d "'" | tr -d '\r'
}

get_yaml_value_direct() {
  local key="$1"
  grep "${key}:" "${CONFIG_FILE}" | head -1 | sed "s/.*${key}: *//" | tr -d '"' | tr -d "'" | tr -d '\r'
}

# GitHub config
GITHUB_REPO=$(get_yaml_value_direct "repo" | head -1)
GITHUB_API_BASE=$(get_yaml_value_direct "api_base" | head -1)

# Analytics config
PLAUSIBLE_ENDPOINT=$(get_yaml_value_direct "endpoint" | head -1)

# Dashboard config
DASHBOARD_REFRESH=$(get_yaml_value_direct "refresh_interval_seconds" | head -1)

# Export as NEXT_PUBLIC_* env vars (allow env var overrides)
export NEXT_PUBLIC_GITHUB_REPO="${NEXT_PUBLIC_GITHUB_REPO:-${GITHUB_REPO:-yigang666/yigang666.github.io}}"
export NEXT_PUBLIC_GITHUB_API_BASE="${NEXT_PUBLIC_GITHUB_API_BASE:-${GITHUB_API_BASE:-https://api.github.com}}"
export NEXT_PUBLIC_PLAUSIBLE_ENDPOINT="${NEXT_PUBLIC_PLAUSIBLE_ENDPOINT:-${PLAUSIBLE_ENDPOINT:-https://plausible.io}}"
export NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS="${NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS:-${DASHBOARD_REFRESH:-60}}"

echo "Config loaded:"
echo "  NEXT_PUBLIC_GITHUB_REPO=${NEXT_PUBLIC_GITHUB_REPO}"
echo "  NEXT_PUBLIC_GITHUB_API_BASE=${NEXT_PUBLIC_GITHUB_API_BASE}"
echo "  NEXT_PUBLIC_PLAUSIBLE_ENDPOINT=${NEXT_PUBLIC_PLAUSIBLE_ENDPOINT}"
echo "  NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS=${NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS}"

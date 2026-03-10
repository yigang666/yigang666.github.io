# Live DevOps Dashboard

## Overview

The `dashboard` command renders a live status panel showing real-time data from the GitHub
public API. All data is fetched client-side — no server, no build-time fetch, no caching layer.

---

## Dashboard Widgets

| Widget | Data Source | GitHub API Endpoint |
|--------|------------|-------------------|
| CI STATUS | Last `build` workflow run conclusion | `GET /repos/{owner}/{repo}/actions/runs` |
| LAST DEPLOY | Last `deploy-pages` workflow run date | `GET /repos/{owner}/{repo}/actions/runs` |
| LATEST COMMIT | Most recent commit message (max 60 chars) | `GET /repos/{owner}/{repo}/commits?per_page=1` |
| SECURITY SCAN | Last `security-scan` workflow conclusion | `GET /repos/{owner}/{repo}/actions/runs` |
| REPO ACTIVITY | Stars, open issues count, last push date | `GET /repos/{owner}/{repo}` |

---

## Implementation Details

### Component: `components/commands/dashboard.tsx`

The component uses React hooks:
- `useState` — holds `DashboardState` (loading, error, rateLimited, commit, runs, repoInfo)
- `useEffect` — triggers initial fetch and sets up `setInterval` for auto-refresh
- `useCallback` — memoizes the `fetchData` function to avoid re-registration on re-render

### Fetch Strategy

All three API calls (`fetchLatestCommit`, `fetchWorkflowRuns`, `fetchRepoInfo`) are issued
in parallel via `Promise.allSettled`. This ensures:
- Partial failure does not block other widgets
- Rate limiting on one endpoint does not hide data from others
- Total fetch time equals the slowest of the three calls

### Auto-Refresh

```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, REFRESH_INTERVAL); // 60s default
  return () => clearInterval(interval);
}, [fetchData]);
```

The interval is cleaned up on component unmount (when the user runs `clear` or navigates away).

---

## Status Display

### CI STATUS / SECURITY SCAN

Workflow `conclusion` values are mapped to display strings:

| conclusion | display |
|-----------|---------|
| `success` | `SUCCESS` (green) |
| `failure` | `FAILURE` (red) |
| `cancelled` | `CANCELLED` (gray) |
| `skipped` | `SKIPPED` (gray) |
| `null` | `PENDING` (amber) |

### LATEST COMMIT

Commit message is truncated to 60 characters and prefixed with the 7-char short SHA:

```
[a1b2c3d] feat: add dashboard auto-refresh
```

### REPO ACTIVITY

```
★ 5 · 2 open issues · pushed 2024-11-15
```

---

## Error States

| State | Trigger | Display |
|-------|---------|---------|
| Loading | Initial fetch or refresh in progress | `FETCHING...` (amber, animated) |
| Rate limited | HTTP 403 + `x-ratelimit-remaining: 0` | `RATE LIMITED` (red) + warning banner |
| API error | Non-200/403 response | `API ERROR` (red) |
| N/A | Successful fetch but no data found | `N/A` (gray) |

---

## Configuration

### Refresh Interval

Default: 60 seconds. Override via environment variable:

```bash
NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS=30 npm run build
```

Or set in `config/services.yaml`:

```yaml
dashboard:
  refresh_interval_seconds: 60
```

### Target Repository

Default: `yigang666/yigang666.github.io`

Override via environment variable:

```bash
NEXT_PUBLIC_GITHUB_REPO=myorg/myrepo npm run build
```

---

## GitHub API Rate Limits

Unauthenticated requests: 60 per hour per IP address.

The dashboard makes 3 API calls per refresh cycle. At the default 60-second interval:
- 3 calls/minute = 180 calls/hour — exceeds the 60/hour unauthenticated limit

In practice:
- The dashboard is only active while the user has the terminal open with `dashboard` rendered
- Multiple page views share the same IP rate limit bucket if behind a shared IP (e.g. office)
- Rate limiting is handled gracefully — stale data remains visible with a warning

To increase rate limits, authenticated requests would be required, but adding a GitHub token
to client-side code is a security risk. The current design intentionally uses only the
unauthenticated public API.

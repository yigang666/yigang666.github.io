# Security

## Principles

1. **No secrets in source** — tokens, API keys, and credentials are never committed
2. **Least privilege** — GitHub token scope limited to minimum required
3. **Defense in depth** — multiple scanning layers (SAST, SCA, container scan)
4. **Static site advantage** — no server attack surface, no database, no auth system

---

## Secret Management

### What is a secret in this project?

| Item | Secret? | Storage |
|------|---------|---------|
| GitHub API token | YES | GitHub Secrets (if needed) |
| Cloudflare API token | YES | GitHub Secrets / `.tfvars` (gitignored) |
| Cloudflare Zone ID | YES | GitHub Secrets / `.tfvars` (gitignored) |
| Plausible domain | NO | GitHub Actions variable |
| GitHub repo name | NO | `config/services.yaml` |
| API base URLs | NO | `config/services.yaml` |

### Rules

- Never commit `.env`, `.env.local`, `*.tfvars` files
- GitHub Secrets are set in: Settings → Secrets and variables → Actions
- Terraform sensitive vars (`cloudflare_api_token`, `cloudflare_zone_id`) only in `.tfvars` (gitignored) or environment variables
- `.gitignore` covers all sensitive file patterns

---

## GitHub API Access

The dashboard fetches live data from the GitHub public API **without authentication**.
This means:
- No GitHub token in the frontend JavaScript bundle
- Rate limit: 60 requests/hour per IP (unauthenticated)
- Only public repository data is accessible
- Rate limit state is handled gracefully: shows `RATE LIMITED` in the dashboard

---

## Scanning Tools

### CodeQL (SAST)

- Engine: GitHub's semantic analysis engine
- Scope: TypeScript and JavaScript source files in `site/nextjs-terminal-site/`
- Query suite: `security-extended` (includes more rules than default)
- Trigger: push to `main`, weekly schedule
- Results: GitHub Security → Code scanning alerts

### npm audit (SCA)

- Scans `package-lock.json` for known CVEs in dependencies
- Threshold: fails on HIGH or CRITICAL severity
- Trigger: every CI run and weekly schedule
- Action: update the dependency and re-run

### Trivy (Container Scan)

- Scans the built Docker image for OS-level and language-level vulnerabilities
- Severity filter: CRITICAL and HIGH
- `ignore-unfixed: true`: does not fail on vulnerabilities with no upstream fix
- Trigger: security-scan workflow on push + weekly
- Results: GitHub Security → Code scanning alerts (SARIF upload)

---

## Dependabot

Recommended configuration (`.github/dependabot.yml`):

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /site/nextjs-terminal-site
    schedule:
      interval: weekly
    open-pull-requests-limit: 5

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

---

## Content Security

- Static HTML only — no server-rendered content injection
- No user-supplied data is stored or reflected
- Plausible analytics: privacy-first, no cookies, no PII collected
- No third-party scripts except Plausible (controlled via env var, disabled if domain not set)

---

## TLS / Transport Security

- GitHub Pages: HTTPS enforced, HSTS via GitHub's CDN
- Cloudflare (optional): SSL full mode, min TLS 1.2, automatic HTTPS rewrites
- Docker/nginx: security headers added (X-Frame-Options, X-Content-Type-Options, etc.)

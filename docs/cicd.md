# CI/CD Pipeline

## Pipeline Overview

Three GitHub Actions workflows handle build, deployment, and security for this project.

```
push to main ──▶ build.yml ──▶ deploy-pages.yml
                    │
                    └──▶ security-scan.yml (also runs on schedule)
```

---

## build.yml

**Trigger:** push to `main`, pull_request targeting `main`

**Purpose:** Install dependencies, build the static site, upload the `out/` artifact.

### Steps

1. `actions/checkout@v4` — check out the repository
2. `actions/setup-node@v4` — install Node.js 20 LTS, cache npm deps
3. `source scripts/load-config.sh` — parse `config/services.yaml`, export `NEXT_PUBLIC_*` env vars
4. `npm ci` — install exact locked dependencies (never `npm install` in CI)
5. `npm run build` — runs `next build`, produces `out/` static export
6. `actions/upload-artifact@v4` — upload `out/` with 1-day retention

**Environment variables injected at build time:**

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub Actions variable or config default |
| `NEXT_PUBLIC_GITHUB_API_BASE` | GitHub Actions variable or config default |
| `NEXT_PUBLIC_PLAUSIBLE_ENDPOINT` | GitHub Actions variable or config default |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | GitHub Actions variable (optional) |

---

## deploy-pages.yml

**Trigger:** `workflow_run` — fires after `build.yml` completes successfully on `main`

**Purpose:** Deploy the static `out/` artifact to GitHub Pages.

**Permissions required:**
- `pages: write` — to deploy to GitHub Pages
- `id-token: write` — for OIDC token used by deploy-pages action

### Steps

1. `actions/download-artifact@v4` — download `site-out` artifact from the triggering build run
2. `actions/configure-pages@v5` — configure GitHub Pages settings
3. `actions/upload-pages-artifact@v3` — package the artifact for Pages deployment
4. `actions/deploy-pages@v4` — deploy and return the published URL

**Concurrency:** `cancel-in-progress: false` ensures in-flight deployments are never cancelled,
preventing partial deploys.

---

## security-scan.yml

**Trigger:** push to `main`, weekly schedule (Sundays at 00:00 UTC)

**Purpose:** Detect vulnerabilities in source code, dependencies, and Docker image.

### Jobs

#### codeql

Runs GitHub's CodeQL static analysis engine on the TypeScript/JavaScript source.

- Language: `javascript-typescript`
- Query suite: `security-extended` (broader coverage than default)
- Findings uploaded to GitHub Security tab as SARIF

#### npm-audit

Runs `npm audit --audit-level=high` against the package lock file.

- Fails the job if any HIGH or CRITICAL severity vulnerabilities are found
- Forces dependency updates to be addressed before merging

#### trivy

Builds the Docker image and runs Trivy vulnerability scanner against it.

- Scans OS packages and language dependencies inside the image
- Severity filter: CRITICAL and HIGH only
- `ignore-unfixed: true` — ignores vulnerabilities with no available fix
- Results uploaded to GitHub Security tab as SARIF

---

## Required Repository Settings

### GitHub Pages
- Source: GitHub Actions (not Deploy from a branch)
- Enable via: Settings → Pages → Source → GitHub Actions

### GitHub Actions Variables (optional overrides)
Set in: Settings → Secrets and variables → Actions → Variables

- `NEXT_PUBLIC_GITHUB_REPO`
- `NEXT_PUBLIC_GITHUB_API_BASE`
- `NEXT_PUBLIC_PLAUSIBLE_ENDPOINT`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

### Dependabot
Enable in `.github/dependabot.yml` (weekly npm + Actions updates recommended).

# yigang666 — DevOps Portfolio Terminal

A terminal-style personal portfolio website for Yigang Li, DevOps Engineer based in Singapore.
Deployed as a fully static site on GitHub Pages via Next.js static export.

---

## Overview

This site presents my professional portfolio through a Linux terminal interface.
Type commands to navigate: `help`, `about`, `resume`, `projects`, `dashboard`, `contact`.

**Live:** https://yigang666.github.io

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Terminal React App (Next.js)               │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │   │
│  │  │  Terminal.tsx │  │ Command Pages │  │  Dashboard  │  │   │
│  │  │  (state mgmt) │  │ about/resume  │  │ (live data) │  │   │
│  │  └──────────────┘  └───────────────┘  └──────┬──────┘  │   │
│  │                                               │         │   │
│  └───────────────────────────────────────────────┼─────────┘   │
│                                                  │             │
│                                       GitHub API (public)      │
└─────────────────────────────────────────────────────────────────┘
         │
         │  (static files served from GitHub Pages CDN)
         ▼
┌────────────────────┐
│   GitHub Pages     │
│   (out/ directory) │
└────────────────────┘
         ▲
         │  deploy-pages.yml
         │
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD                        │
│                                                                 │
│  build.yml          deploy-pages.yml      security-scan.yml     │
│  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │ npm ci       │   │ download artifact│   │ CodeQL          │  │
│  │ next build   │──▶│ configure-pages  │   │ npm audit       │  │
│  │ upload out/  │   │ deploy-pages    │   │ Trivy scan      │  │
│  └──────────────┘   └─────────────────┘   └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ (optional: custom domain)
         ▼
┌────────────────────┐
│   Cloudflare DNS   │
│   (Terraform IaC)  │
│   CNAME + SSL      │
└────────────────────┘
```

---

## Project Structure

```
yigang666/
├── site/nextjs-terminal-site/    Next.js source (Pages Router)
│   ├── pages/                    index.tsx — entry point
│   ├── components/               Terminal, TerminalLine, CommandInput
│   │   └── commands/             about, resume, projects, blog, dashboard, contact
│   ├── lib/                      parseResume.ts, githubApi.ts
│   └── styles/                   globals.css (TailwindCSS)
├── content/
│   └── resume.md                 Source resume (parsed at build time)
├── config/
│   └── services.yaml             Centralized service configuration
├── terraform/                    Cloudflare DNS (optional custom domain)
├── scripts/                      deploy.sh, load-config.sh
├── .github/workflows/            build.yml, deploy-pages.yml, security-scan.yml
├── docs/                         Architecture, CI/CD, security, dashboard docs
└── Dockerfile                    Multi-stage nginx container
```

---

## CI/CD Pipeline

1. **build.yml** — triggers on push/PR to `main`
   - Checks out code, sets up Node 20, runs `npm ci` + `next build`
   - Uploads `out/` as GitHub Actions artifact

2. **deploy-pages.yml** — triggers after build succeeds on `main`
   - Downloads artifact, deploys to GitHub Pages via `actions/deploy-pages`
   - Requires `pages: write` and `id-token: write` permissions

3. **security-scan.yml** — triggers on push to `main` and weekly (Sunday 00:00 UTC)
   - CodeQL static analysis (JavaScript/TypeScript)
   - `npm audit --audit-level=high` dependency vulnerability scan
   - Trivy Docker image scan for OS/package CVEs

---

## Security Practices

- No secrets committed to source — all tokens in GitHub Secrets
- GitHub token scope: minimum required (read-only public API)
- Dependabot enabled for npm ecosystem (weekly)
- CodeQL enabled for JavaScript/TypeScript
- Trivy scans container image on every build
- Cloudflare SSL: full mode, always HTTPS, min TLS 1.2

---

## Live Dashboard

The `dashboard` command displays live data fetched client-side from the GitHub public API:

| Widget | Source |
|--------|--------|
| CI STATUS | Last `build` workflow run conclusion |
| LAST DEPLOY | Last `deploy-pages` workflow run date |
| LATEST COMMIT | Most recent commit on default branch |
| SECURITY SCAN | Last `security-scan` workflow conclusion |
| REPO ACTIVITY | Open issues count, star count, last push |

Data auto-refreshes every 60 seconds via `setInterval`.
GitHub API rate limiting is handled gracefully — shows `RATE LIMITED` state.

---

## Deployment Guide

### GitHub Pages (default)

1. Fork or push to `yigang666/yigang666.github.io`
2. Enable GitHub Pages in repo settings (source: GitHub Actions)
3. Push to `main` — CI/CD handles the rest

### Local Development

```bash
cd site/nextjs-terminal-site
npm install
npm run dev
# open http://localhost:3000
```

### Docker

```bash
./scripts/deploy.sh --docker
docker run -p 8080:80 yigang666:latest
# open http://localhost:8080
```

### Custom Domain (Terraform)

```bash
cd terraform
# Create terraform.tfvars (gitignored):
# cloudflare_api_token = "..."
# cloudflare_zone_id   = "..."
# domain               = "yigang.dev"
terraform init
terraform plan
terraform apply
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_GITHUB_REPO` | `yigang666/yigang666.github.io` | GitHub repo for dashboard |
| `NEXT_PUBLIC_GITHUB_API_BASE` | `https://api.github.com` | GitHub API base URL |
| `NEXT_PUBLIC_PLAUSIBLE_ENDPOINT` | `https://plausible.io` | Plausible analytics endpoint |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | _(empty)_ | Domain for Plausible (disables if empty) |
| `NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS` | `60` | Dashboard refresh interval |

---

## Tech Stack

- **Framework:** Next.js 14 (static export, Pages Router)
- **UI:** React 18 + TailwindCSS 3 + JetBrains Mono
- **Language:** TypeScript (strict mode)
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages
- **DNS/CDN:** Cloudflare (via Terraform)
- **Security:** CodeQL + Trivy + npm audit + Dependabot
- **Analytics:** Plausible (privacy-first, no cookies)
- **Container:** Docker + Nginx Alpine

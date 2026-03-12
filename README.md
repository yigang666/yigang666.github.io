# yigang666 — Personal Portfolio

A bilingual (EN/ZH) personal portfolio website for Yigang Li, Software Engineer based in Singapore.
Built with Next.js static export and deployed to GitHub Pages.

**Live:** https://yigang666.github.io

---

## Overview

Five pages — About, Resume, Projects, Blog, Contact — with a language toggle in the navbar.
All content is driven by a single Markdown file (`content/content.md`). Edit it, push, and the site updates automatically.

---

## Architecture

```
content/content.md  ──(parsed at build time)──▶  Next.js getStaticProps
                                                         │
                                              ┌──────────▼──────────┐
                                              │   Static HTML/CSS/JS │
                                              │       (out/)         │
                                              └──────────┬──────────┘
                                                         │
                                              GitHub Pages CDN
```

```
GitHub Actions CI/CD
  build.yml          →  npm ci → next build → upload out/
  deploy-pages.yml   →  download out/ → deploy to GitHub Pages
  security-scan.yml  →  CodeQL + npm audit + Trivy (on push + weekly)
```

---

## Project Structure

```
yigang666/
├── content/
│   └── content.md                 ← ✏️  ALL site content (EN + ZH)
├── site/nextjs-terminal-site/
│   ├── pages/                     About, Resume, Projects, Blog, Contact
│   ├── components/                Navbar, Layout, Footer
│   ├── lib/
│   │   ├── parseContent.ts        Parses content.md into typed data
│   │   └── i18n.tsx               Language context + UI translations
│   └── styles/globals.css
├── .github/workflows/             build.yml, deploy-pages.yml, security-scan.yml
├── config/services.yaml           External service URLs
├── scripts/                       load-config.sh, deploy.sh
├── terraform/                     Cloudflare DNS (optional custom domain)
├── Dockerfile                     Multi-stage build (Node → Nginx)
└── docs/
    ├── USAGE.md                   How to run, update content, and deploy
    └── interview.md               Project intro + technical Q&A
```

---

## Content System

All five pages read from `content/content.md` at build time. No code changes required for content updates.

**Add a new project:**
```markdown
### project-name
status: LIVE
url: https://github.com/yourname/project-name
description: English description.
description_zh: 中文描述。
tech: Go, Docker, Kubernetes
```

**Add a blog post:**
```markdown
### Post Title
title_zh: 中文标题
date: 2025-03-15
tags: DevOps, Linux
summary: English summary.
summary_zh: 中文摘要。
```

---

## Bilingual Support

The navbar has an `EN · 中` toggle. Language preference is saved in `localStorage`.

- **UI labels** — defined in `lib/i18n.tsx`
- **Dynamic content** — `_zh` field variants in `content.md` (e.g. `bio_zh:`, `description_zh:`)
- **Fallback** — if a `_zh` field is missing, the English value is shown

---

## Local Development

```bash
cd site/nextjs-terminal-site
npm install
npm run dev
# open http://localhost:3000
```

Content changes require a dev server restart (parsed at build time).

---

## CI/CD Pipeline

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `build.yml` | push / PR to `main` | npm ci → next build → upload `out/` |
| `deploy-pages.yml` | after build succeeds on `main` | download `out/` → deploy to GitHub Pages |
| `security-scan.yml` | push to `main` + weekly cron | CodeQL → npm audit → Trivy |

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (static export, Pages Router) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS 3 + Inter font |
| i18n | React Context + localStorage |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Container | Docker + Nginx Alpine |
| IaC | Terraform (Cloudflare DNS) |
| Security | CodeQL + Trivy + npm audit + Dependabot |

---

## Security

- No secrets in source — all tokens in GitHub Secrets
- Fully static — no server, no attack surface at runtime
- Automated scanning on every push and weekly
- Dependabot enabled for npm ecosystem

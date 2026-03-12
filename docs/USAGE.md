# Usage Guide

> How to run the site locally, update content, and deploy to GitHub Pages.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Run locally](#2-run-locally)
3. [Update site content](#3-update-site-content)
4. [Bilingual content (EN / ZH)](#4-bilingual-content-en--zh)
5. [Push and deploy](#5-push-and-deploy)
6. [Local production build](#6-local-production-build)
7. [Docker](#7-docker)
8. [GitHub Pages setup (one-time)](#8-github-pages-setup)
9. [Troubleshooting](#9-troubleshooting)
10. [File reference](#10-file-reference)

---

## 1. Prerequisites

```bash
node --version   # requires v20.x
npm --version    # requires v10.x
git --version    # any recent version
```

Install Node.js 20 LTS from https://nodejs.org if needed.

---

## 2. Run locally

```bash
cd /Users/liyigang/claude/yigang666/site/nextjs-terminal-site

npm install       # first time only
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Note:** All pages use `getStaticProps` to read `content.md` at build time.
> Content changes require a **dev server restart** to be visible:
> `Ctrl+C` → `npm run dev`

---

## 3. Update site content

**All website content lives in one file:**

```
content/content.md
```

Edit that file, restart the dev server, and the site reflects your changes.
No code edits required.

### Sections

```
## about        → About page  (name, role, bio, focus areas, technologies)
## contact      → Contact page (email, phone, LinkedIn, GitHub)
## resume       → Resume page  (experience, education, skills)
## projects     → Projects page (project cards)
## blog         → Blog page    (article list)
```

### Add a new job

Under `## resume` → `### experience`, add a `####` block:

```markdown
#### Company Name
role: Your Role
role_zh: 中文职位名
period: Jan 2024 – Present
- English bullet point one
zh- 对应中文要点一
- English bullet point two
zh- 对应中文要点二
```

### Add a new project

Under `## projects`, add a `###` block:

```markdown
### project-name
status: LIVE
url: https://github.com/yourname/project-name
description: One-sentence English description.
description_zh: 一句话中文描述。
tech: Go, Docker, Kubernetes
```

Set `status: INTERNAL` and omit `url:` for proprietary projects.

### Add a certification with a verification link

Under `## resume` → `### skills` → `#### certifications`, use `Name | URL` format:

```markdown
#### certifications
- RHCSA | https://rhtapps.redhat.com/verify?certId=250-058-419
- AZ-900
```

Certifications with a URL render as clickable badges. Without `| URL` they render as plain badges.

### Add a blog post

Under `## blog`, add a `###` block:

```markdown
### Your Post Title in English
title_zh: 中文标题
date: 2025-03-15
tags: DevOps, Linux, Tag3
summary: English summary sentence.
summary_zh: 中文摘要。
```

### Update personal info

Edit the `key: value` fields under `## about` or `## contact` directly.

---

## 4. Bilingual content (EN / ZH)

The site supports full EN/ZH switching via the `EN · 中` toggle in the navbar.
Language preference is saved in `localStorage` and persists across page reloads.

### How translations work

**UI labels** (page titles, section headers, button text) are defined in:

```
lib/i18n.tsx  →  export const t = { en: {...}, zh: {...} }
```

**Dynamic content** from `content.md` uses `_zh` field variants:

| Field | English | Chinese |
|-------|---------|---------|
| `bio` | `bio: ...` | `bio_zh: ...` |
| `role` | `role: ...` | `role_zh: ...` |
| `description` | `description: ...` | `description_zh: ...` |
| `summary` | `summary: ...` | `summary_zh: ...` |
| `degree` | `degree: ...` | `degree_zh: ...` |
| `title` (blog) | `### Title` (heading) | `title_zh: ...` |
| Experience bullets | `- bullet` | `zh- 要点` |
| Focus areas | `### focus` list | `### focus_zh` list |

All `_zh` fields are optional — if missing, the English value is shown as fallback.
Technical terms (tool names, company names, certifications) stay in English.

---

## 5. Push and deploy

Pushing to `main` triggers the GitHub Actions pipeline automatically.

```bash
cd /Users/liyigang/claude/yigang666

git add content/content.md      # or: git add .
git commit -m "feat: add new project"
git push
```

Pipeline (~3–5 min total):

```
git push
  → build.yml:        npm ci → npm run build → upload out/
  → deploy-pages.yml: download out/ → deploy to GitHub Pages
  → https://yigang666.github.io updated
```

Monitor: `https://github.com/yigang666/yigang666.github.io/actions`

### Commit message conventions

| Prefix | Use for |
|--------|---------|
| `feat:` | new content or feature |
| `fix:` | bug fix |
| `style:` | visual/CSS changes |
| `docs:` | documentation |
| `ci:` | workflow changes |
| `chore:` | dependency updates, cleanup |

---

## 6. Local production build

Preview the exact static output before deploying:

```bash
cd /Users/liyigang/claude/yigang666/site/nextjs-terminal-site

npm run build           # generates out/
npx serve out -p 3001   # serve locally at http://localhost:3001
```

---

## 7. Docker

Runs the site behind Nginx, matching the production environment:

```bash
cd /Users/liyigang/claude/yigang666

docker build -t yigang666:latest .
docker run -d -p 8080:80 --name yigang666-site yigang666:latest
# open http://localhost:8080

docker stop yigang666-site && docker rm yigang666-site   # cleanup
```

---

## 8. GitHub Pages setup

One-time setup before first deploy.

**Enable Pages:**
1. Repo → Settings → Pages → Source: **GitHub Actions**

**Workflow permissions:**
1. Settings → Actions → General → Workflow permissions
2. Select **Read and write permissions** → Save

---

## 9. Troubleshooting

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill && npm run dev
```

**Content changes not showing:**
Restart the dev server — `getStaticProps` runs at build time, not on file save.

**Build failed in CI:**
Run `npm run build` locally to reproduce. Common causes:
- TypeScript error in a page file
- `package-lock.json` out of sync → run `npm install` then push

**Stale cache after deploy:**
`Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) to force-refresh.

**Language toggle not persisting:**
Check that `localStorage` is available (not blocked by browser settings).

---

## 10. File reference

```
yigang666/
├── content/
│   └── content.md                  ← ✏️  ALL site content (EN + ZH)
├── site/nextjs-terminal-site/
│   ├── pages/
│   │   ├── index.tsx               ← About page
│   │   ├── resume.tsx              ← Resume page
│   │   ├── projects.tsx            ← Projects page
│   │   ├── blog.tsx                ← Blog page
│   │   └── contact.tsx             ← Contact page
│   ├── components/
│   │   ├── Navbar.tsx              ← Navigation + EN/ZH toggle
│   │   ├── Footer.tsx              ← Page footer
│   │   └── Layout.tsx              ← Shared page wrapper
│   ├── lib/
│   │   ├── parseContent.ts         ← Parses content.md into typed data
│   │   └── i18n.tsx                ← Language context + UI translations
│   └── styles/
│       └── globals.css             ← Global styles + page transition
├── .github/workflows/
│   ├── build.yml                   ← Build on push / PR
│   ├── deploy-pages.yml            ← Deploy to GitHub Pages
│   └── security-scan.yml          ← Weekly CodeQL + Trivy scan
├── config/
│   └── services.yaml               ← External service URLs
├── scripts/
│   ├── load-config.sh              ← Exports env vars from services.yaml
│   └── deploy.sh                   ← Local build helper
├── terraform/                      ← Cloudflare DNS (custom domain only)
├── Dockerfile                      ← Multi-stage build (Node → Nginx)
└── docs/
    ├── USAGE.md                    ← This file
    └── interview.md                ← Project intro + interview Q&A
```

**✏️ = the only file you need to edit for content updates**

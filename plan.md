# yigang666 Personal Website — Project Plan

## Overview

A DevOps-focused personal portfolio website for Yigang Li, featuring a terminal-style hacker interface.
Deployed as a static site on GitHub Pages via Next.js static export.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Static Framework | Next.js (static export) |
| Frontend | React + TailwindCSS |
| Terminal UI | Custom xterm-style React components |
| Infrastructure | Terraform (Cloudflare DNS) |
| CI/CD | GitHub Actions |
| Security | Dependabot, CodeQL, Trivy |
| Container | Docker + Nginx |
| Analytics | Plausible |
| Config | config/services.yaml |

---

## Project Structure

```
yigang666/
├── site/
│   └── nextjs-terminal-site/
│       ├── pages/
│       │   └── index.tsx          # Main terminal page (SSG)
│       ├── components/
│       │   ├── Terminal.tsx        # Terminal shell container
│       │   ├── TerminalLine.tsx    # Single output line renderer
│       │   ├── CommandInput.tsx    # Input prompt bar
│       │   └── commands/
│       │       ├── about.tsx
│       │       ├── projects.tsx
│       │       ├── resume.tsx
│       │       ├── blog.tsx
│       │       ├── dashboard.tsx
│       │       └── contact.tsx
│       ├── lib/
│       │   ├── parseResume.ts      # Parse resume.md into structured data
│       │   └── githubApi.ts        # GitHub API helpers
│       ├── public/
│       ├── styles/
│       │   └── globals.css
│       ├── next.config.js          # output: 'export'
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
├── content/
│   └── resume.md                   # Raw resume source (Yigang Li)
├── config/
│   └── services.yaml               # Centralized external service config
├── terraform/
│   └── cloudflare_dns.tf           # Cloudflare DNS via Terraform
├── scripts/
│   ├── deploy.sh                   # Manual deploy helper
│   └── load-config.sh              # Load services.yaml into env vars
├── .github/
│   └── workflows/
│       ├── build.yml               # Install + build static site
│       ├── deploy-pages.yml        # Deploy out/ to GitHub Pages
│       └── security-scan.yml       # CodeQL + Trivy + dep scan
├── docs/
│   ├── architecture.md
│   ├── cicd.md
│   ├── security.md
│   └── dashboard.md
├── Dockerfile                      # Nginx container serving out/
├── README.md
├── plan.md                         # This file
└── CLAUDE.md                       # Coding standards & system prompt
```

---

## Implementation Phases

### Phase 1 — Project Scaffold
- [ ] Create all directories per structure above
- [ ] Initialize Next.js project in `site/nextjs-terminal-site/`
- [ ] Configure `next.config.js` for static export (`output: 'export'`)
- [ ] Set up TailwindCSS with monospace font palette
- [ ] Add `tsconfig.json`, `package.json`

### Phase 2 — Terminal UI Core
- [ ] Build `Terminal.tsx` — full-screen dark terminal container
- [ ] Build `TerminalLine.tsx` — render colored output lines (green/cyan/amber/white)
- [ ] Build `CommandInput.tsx` — prompt bar with `yigang@devops:~$` prefix, keyboard input
- [ ] Wire command dispatcher: map typed commands → component output
- [ ] Implement: `help`, `clear`, `whoami`, `role`, `skills`

### Phase 3 — Command Pages
- [ ] `about` — bio, location, role description in terminal style
- [ ] `projects` — list of key projects with links, rendered as terminal output
- [ ] `resume` — parse `content/resume.md`, render structured terminal output
- [ ] `blog` — placeholder or static blog post list
- [ ] `contact` — email, LinkedIn, GitHub as terminal output
- [ ] `dashboard` — live DevOps metrics widget (see Phase 5)

### Phase 4 — Resume Parser
- [ ] `lib/parseResume.ts` — read `content/resume.md` at build time via `fs`
- [ ] Extract: Name, Contact, Education, Experience, Skills, Certifications
- [ ] Pass parsed data as props to resume command component
- [ ] Render in terminal-friendly format (no raw markdown)

### Phase 5 — Live DevOps Dashboard
- [ ] `lib/githubApi.ts` — fetch from GitHub API:
  - Latest commit message + timestamp
  - CI/Actions run status (last workflow run)
  - Repository info (stars, forks, last push)
- [ ] Dashboard component renders widgets:
  - `CI STATUS: SUCCESS / FAILURE`
  - `LAST DEPLOY: <date>`
  - `LATEST COMMIT: <message>`
  - `SECURITY SCAN: PASS / FAIL`
  - `DEPENDENCIES: 0 critical vulnerabilities`
- [ ] Auto-refresh every 60 seconds via `setInterval`
- [ ] Data fetched client-side (static site constraint)

### Phase 6 — Configuration Layer
- [ ] Create `config/services.yaml` with all service endpoints
- [ ] `scripts/load-config.sh` — parse YAML, export as env vars
- [ ] Support `GITHUB_REPO`, `PLAUSIBLE_ENDPOINT`, etc. as env var overrides
- [ ] Next.js reads `NEXT_PUBLIC_*` env vars at build time

### Phase 7 — Docker Support
- [ ] `Dockerfile` — multi-stage build:
  - Stage 1: Node.js builder, runs `next build`
  - Stage 2: Nginx alpine, copies `out/`, exposes port 80
- [ ] `.dockerignore` to exclude node_modules, .next cache

### Phase 8 — CI/CD Pipelines
- [ ] `build.yml` — trigger on push to main:
  - `actions/setup-node`
  - `npm ci`
  - `npm run build`
  - Upload `out/` as artifact
- [ ] `deploy-pages.yml` — trigger after build:
  - `actions/deploy-pages`
  - Deploy `out/` to GitHub Pages
- [ ] `security-scan.yml` — trigger on push + schedule:
  - CodeQL analysis
  - `npm audit` dependency scan
  - Trivy container image scan

### Phase 9 — Terraform / Infrastructure
- [ ] `terraform/cloudflare_dns.tf` — Terraform config:
  - `cloudflare_record` for CNAME pointing to `yigang666.github.io`
  - SSL mode full
  - Variables: `cloudflare_zone_id`, `cloudflare_api_token`
- [ ] `terraform/variables.tf`, `terraform/outputs.tf`
- [ ] Provider: `cloudflare/cloudflare`

### Phase 10 — Documentation & README
- [ ] `README.md` — overview, architecture diagram (ASCII), CI/CD, security, dashboard, deployment guide
- [ ] `docs/architecture.md` — full architecture explanation
- [ ] `docs/cicd.md` — pipeline stages walkthrough
- [ ] `docs/security.md` — security tools and practices
- [ ] `docs/dashboard.md` — dashboard widget sources

### Phase 11 — Plausible Analytics
- [ ] Add Plausible script tag in `_document.tsx` (or Next.js metadata)
- [ ] Domain + endpoint read from `NEXT_PUBLIC_PLAUSIBLE_ENDPOINT`
- [ ] No cookie-based tracking

---

## Key Design Decisions

1. **Next.js static export** — fully static `out/` folder, compatible with GitHub Pages, no server required.
2. **Client-side GitHub API calls** — dashboard fetches live data in browser; no backend needed.
3. **Resume parsed at build time** — `fs.readFileSync` in `getStaticProps`, data baked into HTML.
4. **All config in `services.yaml`** — single source of truth, overridable by env vars.
5. **Terminal interaction is pure React state** — command history, output history, cursor all in React state; no external terminal library dependency.

---

## Resume Data (Yigang Li)

Extracted from `resume.md`:

- **Name:** Li Yigang
- **Email:** yigang.li.2016@sis.smu.edu.sg
- **Phone:** +65 8839 5081
- **LinkedIn:** https://www.linkedin.com/in/yigang-li
- **Education:** Singapore Management University, B.Sc. Information Systems (2016–2020)
- **Experience:**
  - CrimsonLogic Pte Ltd — Software Engineer (May 2021–Present)
  - Robert Bosch (SEA) Pte Ltd — Software Engineer Intern (Dec 2019–Apr 2020)
- **Skills:** Dynatrace, Java, Linux, SQL
- **Certifications:** RHCSA
- **Linguistic Skills:** English (Native), Mandarin (Native)
- **Hobbies:** Badminton, Hiking

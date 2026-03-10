# Architecture

## Overview

yigang666 is a fully static personal portfolio website built with Next.js in static export mode.
All pages are pre-rendered to HTML/CSS/JS at build time and served from GitHub Pages CDN.
There is no server-side runtime — all dynamic behavior runs in the browser.

---

## Static Export Architecture

```
source code (TypeScript/React)
        │
        ▼  next build (getStaticProps at build time)
  out/ directory (pure HTML + JS + CSS)
        │
        ▼  upload via GitHub Actions
  GitHub Pages CDN (global)
        │
        ▼  HTTP response
  Browser (React hydrates, terminal runs)
```

The `getStaticProps` function in `pages/index.tsx` reads `content/resume.md` using Node.js `fs`
and passes the parsed `ResumeData` object as props. This data is baked into the HTML at build time —
no runtime file reads, no API calls for resume data.

---

## Component Tree

```
pages/index.tsx
└── Terminal.tsx
    ├── output div (scrollable)
    │   └── TerminalLine.tsx (repeated, per output line)
    │       └── command components (rendered as ReactNode):
    │           ├── about.tsx
    │           ├── resume.tsx       ← receives ResumeData prop
    │           ├── projects.tsx
    │           ├── blog.tsx
    │           ├── dashboard.tsx    ← fetches GitHub API client-side
    │           ├── contact.tsx
    │           └── help.tsx
    └── CommandInput.tsx (fixed bottom bar)
```

---

## Data Flow

### Resume Data (build-time)

```
content/resume.md
      │
      ▼  lib/parseResume.ts (Node.js fs.readFileSync)
  ResumeData object
      │
      ▼  pages/index.tsx getStaticProps
  HTML props (baked in)
      │
      ▼  Terminal.tsx → ResumeCommand
  Terminal output
```

### Dashboard Data (client-side, live)

```
Browser
  │
  ▼  dashboard.tsx useEffect + setInterval(60s)
lib/githubApi.ts
  │
  ▼  fetch (unauthenticated, public GitHub API)
https://api.github.com/repos/{owner}/{repo}/...
  │
  ▼  JSON response
Dashboard widget render
```

---

## Configuration

All external service coordinates live in `config/services.yaml`.
`scripts/load-config.sh` parses this file and exports `NEXT_PUBLIC_*` environment variables
before the Next.js build runs. CI workflows source this script before calling `npm run build`.

At build time, Next.js bakes `NEXT_PUBLIC_*` values into the JavaScript bundle.
At runtime, the browser reads these values directly from the bundle.

---

## No Server Rule

This project strictly follows the static-first constraint:
- No `getServerSideProps` anywhere
- No Next.js API routes
- No runtime server (not even `next start` in production — nginx serves the `out/` directory)
- Docker container uses nginx to serve pre-built static files

---

## Directory Layout Rationale

| Directory | Purpose |
|-----------|---------|
| `site/nextjs-terminal-site/` | All source code — isolated for clean Docker build context |
| `content/` | Static content (resume.md) — read at build time, not bundled |
| `config/` | External service config — parsed by shell scripts, not imported by JS |
| `terraform/` | IaC — completely separate from application code |
| `scripts/` | Shell utilities — used in CI and local development |
| `.github/workflows/` | CI/CD definitions |
| `docs/` | Operational documentation |

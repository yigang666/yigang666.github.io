# CLAUDE.md — Coding Standards & System Prompt

This file defines the engineering standards, conventions, and constraints for the yigang666 personal website project.
All code generation must follow these rules.

---

## Project Identity

- **Project:** yigang666 personal DevOps portfolio website
- **Owner:** Yigang Li
- **Deployment:** GitHub Pages (static site)
- **Framework:** Next.js (static export mode, `output: 'export'`)

---

## Core Principles

1. **Minimal over maximal** — only write what is needed. No gold-plating, no speculative features.
2. **Static-first** — everything must work as a fully static site. No server-side runtime, no API routes.
3. **Terminal aesthetic always** — all UI must look and feel like a Linux terminal. No modern UI components, no gradients, no rounded corners, no shadows unless they serve the terminal illusion.
4. **Config-driven** — all external service URLs and keys come from `config/services.yaml` or `NEXT_PUBLIC_*` env vars. Never hardcode endpoints.
5. **Secure by default** — no secrets in source. Use GitHub Secrets for tokens. Apply least privilege.

---

## Directory Conventions

```
site/nextjs-terminal-site/    → All Next.js source code
content/                      → Static content files (resume.md)
config/                       → Centralized service configuration
terraform/                    → IaC for Cloudflare DNS
scripts/                      → Shell utility scripts
.github/workflows/            → CI/CD pipelines
docs/                         → Architecture and operational docs
```

Never put source code outside `site/nextjs-terminal-site/`.
Never put secrets or tokens in any committed file.

---

## Language & Runtime

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 20 LTS
- **Package manager:** npm (use `npm ci` in CI, `npm install` locally)
- **TypeScript config:** `strict: true`, `noImplicitAny: true`

---

## Next.js Rules

- `next.config.js` must set `output: 'export'` and `trailingSlash: true`
- Never use `getServerSideProps` — static site only
- Use `getStaticProps` for build-time data (resume parsing)
- Use client-side fetch for live data (GitHub API dashboard)
- All pages in `pages/` directory (Pages Router, not App Router)
- No dynamic routes that require a server
- Image optimization must be disabled: `images: { unoptimized: true }`

---

## Styling Rules

- **Only TailwindCSS** — no inline styles, no CSS Modules, no styled-components
- **Color palette (strict):**
  - Background: `bg-black` or `bg-gray-950`
  - Primary text: `text-green-400` (terminal green)
  - Secondary text: `text-cyan-400`, `text-white`, `text-amber-400`
  - Error/warning: `text-red-400`
  - Muted/comment: `text-gray-500`
- **Font:** monospace only — `font-mono` TailwindCSS class
  - Load `JetBrains Mono` or `Fira Code` via Google Fonts or self-hosted
- **No rounded corners** on terminal elements (`rounded-none`)
- **No drop shadows** on terminal elements
- **Cursor:** blinking block cursor via CSS animation

---

## Terminal UI Component Rules

### Terminal.tsx
- Full-screen black container
- Scrollable output area (auto-scroll to bottom on new output)
- Fixed prompt bar at bottom
- Keyboard focus always on input
- Show command history on ArrowUp/ArrowDown

### CommandInput.tsx
- Prompt format: `yigang@devops:~$`
- Green prompt prefix, white/green input text
- On Enter: dispatch command, append to output history, clear input
- Support: `clear` (wipes output), `help` (lists all commands)

### TerminalLine.tsx
- Props: `type` (`output` | `command` | `error` | `info` | `success`)
- Color mapping:
  - `command` → `text-green-400` (echo back the typed command)
  - `output` → `text-white` or `text-gray-200`
  - `error` → `text-red-400`
  - `info` → `text-cyan-400`
  - `success` → `text-green-400`

---

## Command System Rules

Each command is a React component that returns JSX lines.

Command registry in `components/commands/index.ts`:
```typescript
export const COMMANDS: Record<string, React.FC<CommandProps>> = {
  about: AboutCommand,
  projects: ProjectsCommand,
  resume: ResumeCommand,
  blog: BlogCommand,
  dashboard: DashboardCommand,
  contact: ContactCommand,
  help: HelpCommand,
};
```

Built-in commands handled in dispatcher (not components): `clear`, `whoami`, `role`, `skills`

---

## Resume Parser Rules (`lib/parseResume.ts`)

- Read file with `fs.readFileSync` at build time only (inside `getStaticProps`)
- Parse sections by markdown heading patterns (`## Section`, `### Role`)
- Return a typed `ResumeData` interface:
```typescript
interface ResumeData {
  name: string;
  contact: { phone: string; email: string; linkedin: string };
  education: Array<{ institution: string; degree: string; period: string }>;
  experience: Array<{ company: string; role: string; period: string; bullets: string[] }>;
  skills: { technical: string[]; linguistic: string[]; certifications: string[]; hobbies: string[] };
}
```
- Never render raw markdown — always extract structured data and render via components

---

## GitHub API Rules (`lib/githubApi.ts`)

- Repo: read from `process.env.NEXT_PUBLIC_GITHUB_REPO` (default: `yigang666/yigang666.github.io`)
- API base: read from `process.env.NEXT_PUBLIC_GITHUB_API_BASE` (default: `https://api.github.com`)
- All fetches are client-side (no `getStaticProps` for live data)
- Handle rate limiting gracefully — show `RATE LIMITED` state in dashboard
- Never include GitHub tokens in frontend code — only use unauthenticated public API

---

## Dashboard Rules

- Auto-refresh interval: 60 seconds (`setInterval`)
- Loading state: show `FETCHING...` in amber while loading
- Error state: show `API ERROR` in red
- Data displayed:
  - `CI STATUS` — last workflow run conclusion
  - `LAST DEPLOY` — last successful deploy-pages run date
  - `LATEST COMMIT` — last commit message (truncated to 60 chars)
  - `SECURITY SCAN` — last security-scan workflow conclusion
  - `REPO ACTIVITY` — open issues count, stars

---

## Configuration File Rules (`config/services.yaml`)

Structure:
```yaml
services:
  github:
    repo: yigang666/yigang666.github.io
    api_base: https://api.github.com
  deployment:
    platform: github_pages
  analytics:
    provider: plausible
    endpoint: https://plausible.io
  dashboard:
    refresh_interval_seconds: 60
```

- `scripts/load-config.sh` must parse this file and export env vars
- Next.js build reads `NEXT_PUBLIC_*` vars set in CI by this script

---

## Docker Rules

- Multi-stage Dockerfile:
  - Stage 1 (`builder`): `node:20-alpine`, install deps, run `next build`
  - Stage 2 (`runner`): `nginx:alpine`, copy `out/`, expose port 80
- `.dockerignore` must exclude: `node_modules`, `.next`, `out`, `.git`
- No secrets in Docker image
- Nginx config must serve `index.html` for all routes (SPA fallback)

---

## CI/CD Rules

### build.yml
- Trigger: `push` to `main`, `pull_request` to `main`
- Steps: checkout → setup-node 20 → `npm ci` → `npm run build` → upload artifact `out/`

### deploy-pages.yml
- Trigger: after `build.yml` succeeds on `main`
- Steps: download artifact → deploy to GitHub Pages using `actions/deploy-pages`
- Required permissions: `pages: write`, `id-token: write`

### security-scan.yml
- Trigger: `push` to `main`, scheduled weekly (`cron: '0 0 * * 0'`)
- Steps: CodeQL (JavaScript/TypeScript) → `npm audit --audit-level=high` → Trivy image scan
- Never fail silently — always surface scan results

---

## Terraform Rules

- Provider: `cloudflare/cloudflare` ~> 4.0
- Resources: `cloudflare_record` for CNAME, `cloudflare_zone_settings_override` for SSL
- Variables file: `terraform/variables.tf` — all sensitive vars (zone_id, api_token) come from env or `.tfvars` (gitignored)
- State: stored locally or in Terraform Cloud (never commit `.tfstate`)
- `.gitignore` must include: `*.tfstate`, `*.tfstate.backup`, `.terraform/`, `*.tfvars`

---

## Security Rules

- Never commit `.env`, `*.tfvars`, tokens, or API keys
- All secrets in GitHub Secrets (`Settings → Secrets and variables → Actions`)
- `GITHUB_TOKEN` scope: minimum required (read for public repos)
- Dependabot: enable for `npm` ecosystem, weekly cadence
- CodeQL: enable for JavaScript/TypeScript
- Trivy: scan on every build

---

## Git & Commit Rules

- Branch: `main` is the primary branch
- Commit messages: `<type>: <short description>` format
  - Types: `feat`, `fix`, `ci`, `docs`, `chore`, `style`, `refactor`
  - Example: `feat: add dashboard auto-refresh`
- Never commit generated files (`out/`, `.next/`, `node_modules/`)
- `.gitignore` must cover: `node_modules/`, `.next/`, `out/`, `*.env`, `*.tfstate`, `.terraform/`

---

## What NOT to Do

- Do NOT use App Router (`app/` directory) — use Pages Router only
- Do NOT add `getServerSideProps` anywhere
- Do NOT use styled-components, Emotion, or CSS-in-JS
- Do NOT add unnecessary dependencies — keep `package.json` lean
- Do NOT add docstrings or comments to self-evident code
- Do NOT round corners or add shadows to terminal UI elements
- Do NOT use color outside the defined palette
- Do NOT hardcode any URL, repo name, or token — always use env vars
- Do NOT create abstraction layers for one-off operations

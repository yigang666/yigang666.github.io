# Claude Dialog — Project Retrospective & Communication Guide

> A summary of this project's development conversation, honest feedback on communication patterns,
> and a reusable prompt template for future projects.

---

## Part 1 — Project Build Summary

This portfolio site was built in a single Claude session across roughly 20 exchanges.

### What was built (in order)

| # | Request | Outcome |
|---|---------|---------|
| 1 | Analyse current terminal-SPA and describe ollama.com design | Architecture audit + design spec |
| 2 | Build shared Navbar (ollama style) | Navbar + Layout + 5 stub pages + font switch |
| 3 | "Go with your own plan, redesign all pages" | Full 5-page redesign, Footer, page transitions |
| 4 | Run tests | Build + HTTP checks on all 7 static routes |
| 5 | How to run locally | Identified active dev server on port 3002 |
| 6 | Tab switching feels unnatural | CSS `pageEnter` animation via React `key` prop |
| 7 | Add selfie photo | Copied to `public/`, two-column hero layout |
| 8–9 | Photo position micro-adjustments (×2) | `mt-8` → `mt-14` |
| 10 | Weird edges → Apple rounded corners | Replaced mask-image with `rounded-3xl` |
| 11 | Make content.md the single source of truth | New `parseContent.ts`, all 5 pages on `getStaticProps` |
| 12 | Review project, delete unused files, rewrite USAGE.md | 14 files deleted, USAGE.md rewritten |
| 13 | EN/ZH language toggle | `i18n.tsx` context, `_zh` fields in content.md, mobile-aware toggle |
| 14 | Organise USAGE, create interview.md | Both docs written |
| 15 | Commit and push | Auth failure (old token exposed in old USAGE.md, auto-revoked by GitHub) |
| 16 | New PAT provided | Push successful |
| 17 | Update README | README rewritten, pushed directly |
| 18 | RHCSA link + lang-switch layout shift + mobile nav | Certification type, `min-w` on nav, hamburger menu |
| 19 | 🚀 | Deployed live |
| 20 | Penguin favicon 🐧 | `favicon.svg` + `_document.tsx` update |
| 21 | Review docs, create this file | This file |

---

## Part 2 — Honest Feedback: Where You Can Improve

### 1. Upfront requirements were incomplete

**What happened:** The initial request was "redesign to ollama.com style" — which required a full analysis round before any code could be written.

**Better approach:** Front-load the constraints. Before asking for a redesign, answer:
- What pages exist?
- What content needs to stay?
- What's the target aesthetic? (a URL reference is perfect)
- Any technical constraints? (static only, no external APIs, etc.)

The one-liner that would have saved a round:
> "Redesign my 5-page Next.js portfolio (About, Resume, Projects, Blog, Contact) to match the dark, minimal aesthetic of ollama.com. Keep it fully static. Use Inter font, #0a0a0a background, #19c37d accent. Start with Layout + Navbar then do each page."

---

### 2. Iterative micro-adjustments cost multiple round trips

**What happened:** Photo position was adjusted across 3 separate messages ("往下一点" → "再往下一点好吧").

**Better approach:** Give a reference point or a range.
> "Move the photo down — roughly level with the second line of the bio text."

Or accept a first pass and batch all visual tweaks into one message:
> "Photo: move down ~40px. Bio: slightly wider max-width. CTA buttons: a bit more padding."

---

### 3. A GitHub PAT was pasted in plain text — twice

**What happened:** The first token (`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`) had already been committed inside the old USAGE.md, so GitHub auto-revoked it the moment it was pushed. A second token was then pasted in the chat.

**Risks:**
- Tokens in chat logs are visible to anyone with access to this conversation
- If Claude Code is running in a shared or logged environment, tokens can be intercepted

**Better approach:**
```bash
# Set the token locally in your shell — never paste it into chat
git remote set-url origin https://YOUR_TOKEN@github.com/yourname/repo.git

# Or use the GitHub CLI (most secure)
gh auth login
gh auth setup-git
```

Tell Claude: *"I've set the auth locally, try pushing now."*

---

### 4. Feature scope expanded mid-build without upfront spec

**What happened:** i18n (EN/ZH) was requested after the full page redesign was complete, requiring changes to all 5 pages, the parser, the navbar, and a new context file.

**Cost:** ~6 files touched, a new `content.md` field convention invented, all pages rewritten again.

**Better approach:** If bilingual support is a requirement, state it at the start:
> "The site needs to support EN/ZH language switching. All content from content.md, UI labels in a separate i18n file."

Then the page components can be written once with i18n baked in.

---

### 5. Good instincts that worked well

- **"算了算了，按照你自己的计划"** — trusting the AI's plan and not micro-managing the implementation order is efficient. Do this more.
- **Providing a reference URL** (ollama.com) instead of describing the design in words — this is the fastest way to align on aesthetics.
- **Batching related fixes** in one message (the RHCSA link + layout shift + mobile nav were all sent together) — this is optimal.

---

## Part 3 — Reusable Prompt Templates

Copy, fill in the `[brackets]`, send.

---

### Template A — Start a new web project from scratch

```
Build a [static/full-stack] website with the following spec:

PAGES: [list all pages]
TECH: [framework], [CSS approach], [language], deployed to [hosting]
DESIGN: Match the aesthetic of [reference URL]. Key values: [background colour], [accent colour], [font].
CONTENT: Driven by [a Markdown file / hardcoded / CMS].
CONSTRAINTS:
  - [e.g. fully static, no server-side runtime]
  - [e.g. must support EN/ZH language switching]
  - [e.g. responsive — mobile first, test down to 375px]
  - [e.g. no new npm dependencies without asking first]

Start with the shared Layout + Navbar, then build each page in order.
After each page, confirm the build compiles before moving on.
```

---

### Template B — Redesign an existing site

```
Redesign [site/component] to match the style of [reference URL].

CURRENT STATE: [brief description or "analyse the codebase first"]
TARGET AESTHETIC: [e.g. dark minimal, large whitespace, Inter font, no rounded corners]
COLOUR PALETTE: background [hex], primary text [hex], accent [hex], muted [hex]
KEEP: [what must not change — content, routing, data model]
REMOVE: [what should be deleted — old components, CSS, etc.]

Provide a high-level plan first. Then implement page by page, building after each.
```

---

### Template C — Add a feature to an existing project

```
Add [feature name] to the project.

BEHAVIOUR:
  - [What it does, from the user's perspective]
  - [Edge cases or fallbacks — e.g. "if no translation exists, show English"]

SCOPE:
  - Files to create: [list if known]
  - Files to modify: [list if known]
  - Do NOT change: [e.g. the content.md schema, the routing structure]

ACCEPTANCE CRITERIA:
  - [e.g. language preference persists on refresh]
  - [e.g. toggle is visible on mobile (375px) and desktop (1440px)]
  - Build must pass with zero TypeScript errors after the change.
```

---

### Template D — Fix a bug or visual issue

```
Fix: [one-line description]

OBSERVED: [what you see]
EXPECTED: [what you want]
CONTEXT: [which page/component, which browser/device]

Constraints:
  - [e.g. do not change the layout of surrounding elements]
  - [e.g. fix must work across Chrome, Safari, Firefox]
```

---

### Template E — CI/CD pipeline setup

```
Set up a GitHub Actions CI/CD pipeline for [project].

TRIGGER: push to main, pull requests to main
BUILD STEPS: [e.g. npm ci → npm run build → upload out/]
DEPLOY: [e.g. GitHub Pages via actions/deploy-pages]
SECURITY: Add a separate weekly job: [CodeQL / npm audit / Trivy / all three]

SEPARATION OF CONCERNS:
  - build.yml: build only (runs on PR + push to main)
  - deploy-pages.yml: deploy only (runs after build succeeds on main)
  - security-scan.yml: standalone security job

No secrets in source. Use GitHub Secrets for any tokens.
```

---

### Template F — Responsive design (multi-device)

```
Make [component/page] responsive across all common breakpoints:

BREAKPOINTS TO TEST:
  - Mobile S: 375px  (iPhone SE)
  - Mobile L: 430px  (iPhone 15 Pro Max)
  - Tablet:   768px  (iPad)
  - Desktop: 1280px
  - Wide:    1440px+

MOBILE BEHAVIOUR: [e.g. hamburger menu, stacked columns, hidden elements]
TABLET BEHAVIOUR: [e.g. 2-column grid, condensed nav]
DESKTOP BEHAVIOUR: [e.g. current layout, max-width 1200px centred]

Use Tailwind responsive prefixes (sm: md: lg:). No JavaScript-based layout switching unless necessary.
Test each breakpoint and confirm before submitting.
```

---

### Template G — Security review & hardening

```
Review the project for security issues and fix any found.

CHECKLIST:
  - No secrets or tokens in source code or committed files
  - No hardcoded URLs or API keys (use env vars or config files)
  - Dependencies: run npm audit --audit-level=high, fix high/critical
  - Static site: confirm no server-side code runs at request time
  - CI/CD: confirm GitHub token scopes are minimum required
  - Docker: multi-stage build, final image contains no source or node_modules

Report: list issues found, severity, and fix applied.
```

---

### Template H — Code cleanup & dead code removal

```
Audit the project for unused or redundant files and remove them.

PROCESS:
  1. List every file in [directory]
  2. For each file, check if it is imported or referenced anywhere
  3. Flag files that are: unused / duplicate / replaced by newer implementation
  4. Delete confirmed dead files
  5. Run npm run build to confirm nothing broke

Do NOT delete: [e.g. config files, workflow files, content files]
Report: list of deleted files and why each was removed.
```

---

### Template I — Commit and push

```
Commit all changes and push to origin/main.

Commit message format: [type]: [short description]
Types: feat / fix / style / docs / ci / chore / refactor

Group the changes into logical commits if there are multiple unrelated changes.
Do not use --no-verify. Do not amend existing commits.
```

---

## Part 4 — Universal Rules to Always Include

Add these to any prompt when they apply:

| Situation | Add this line |
|-----------|--------------|
| Any code change | `"Run npm run build and confirm zero errors before finishing."` |
| Visual change | `"Test at 375px (mobile) and 1280px (desktop)."` |
| New dependency | `"Do not install new npm packages without asking first."` |
| Auth/secrets | `"Do not hardcode tokens. I will set credentials locally."` |
| Multi-file refactor | `"Show me the plan before writing any code."` |
| Content change | `"Only edit content.md — do not touch page component files."` |
| Destructive action | `"Ask for confirmation before deleting any file."` |

---

## Part 5 — The One Most Useful Habit

**Before sending any request, answer these three questions in your head:**

1. **What is the exact outcome I want?** (not the method — the result)
2. **What must NOT change?** (constraints are as important as requirements)
3. **How will I know it's done correctly?** (acceptance criteria)

If you can answer all three in two sentences, your prompt is ready.

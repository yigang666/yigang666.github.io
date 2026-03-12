# Project Interview Guide

> A personal DevOps portfolio website — and a technical talking point for interviews.
> This document covers the project overview, key design decisions, and likely interview questions with prepared answers.

---

## Project Overview

**What it is:**
A bilingual (EN/ZH) personal portfolio website for a Software Engineer, built as a fully static site deployed to GitHub Pages. It covers five pages: About, Resume, Projects, Blog, and Contact.

**Tech stack at a glance:**

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (Pages Router, static export) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS |
| Content | Single Markdown file (`content.md`) |
| i18n | React Context + localStorage |
| CI/CD | GitHub Actions (build → deploy pipeline) |
| Hosting | GitHub Pages |
| Container | Docker (Node build → Nginx serve) |
| IaC | Terraform (Cloudflare DNS) |
| Security | CodeQL, npm audit, Trivy |

**What makes it worth talking about:**
- Zero runtime server — pure static output
- Config-driven content: one Markdown file controls all five pages
- Full bilingual support without a translation library
- Automated pipeline from `git push` to live site in ~3 minutes
- Security scanning baked into every push

---

## Interview Questions & Answers

---

### Architecture & Technology Choices

**Q: Why did you choose Next.js for a static portfolio site instead of something simpler like plain HTML or a site generator like Hugo?**

Next.js gives me the component model and TypeScript type safety of React while still outputting pure static HTML via `output: 'export'`. I can use `getStaticProps` to run Node.js code (file parsing) at build time — something plain HTML can't do. Hugo is faster to set up but lacks the React ecosystem I was already familiar with. The tradeoff is a heavier build toolchain, which is justified here because the build only runs in CI, not on the server.

---

**Q: What does `output: 'export'` actually do in Next.js, and what are its limitations?**

It tells Next.js to pre-render every page to a static HTML file at build time, outputting a plain `out/` directory with no Node.js server dependency. The limitations are:
- No `getServerSideProps` — all data must be available at build time or fetched client-side
- No API routes
- Image optimization is disabled (set `images: { unoptimized: true }`)
- Dynamic routes that can't be enumerated at build time don't work

For a portfolio site none of those limitations matter, and the upside is the site can be hosted anywhere — GitHub Pages, S3, Nginx — with zero server management.

---

**Q: Why Pages Router instead of the newer App Router?**

The App Router introduced React Server Components and a new data-fetching model, but it also brought significant complexity: the distinction between Server and Client Components, different caching behavior, and a less mature ecosystem at the time this was built. For a static export site, `getStaticProps` in the Pages Router is a proven, well-understood pattern. The App Router's advantages (streaming, partial hydration) don't apply to a fully static site.

---

### Content System

**Q: Walk me through how `content.md` works — how does a Markdown file become typed React props?**

The flow is:

1. `content/content.md` uses a structured Markdown format: `## section` headers for top-level sections, `###` for subsections, `####` for named entries, and `key: value` pairs for fields.
2. `lib/parseContent.ts` reads the file with `fs.readFileSync` inside `getStaticProps` (Node.js, build time only).
3. A `splitBySections(lines, level)` helper splits the line array into named buckets at a given heading level — level 2 for top sections, level 3 for subsections, level 4 for individual entries like companies.
4. Within each bucket, `getValue(lines, key)` uses a regex to extract `key: value` pairs, and `getBullets(lines)` collects `- item` list entries.
5. The result is a fully typed `SiteContent` object that is passed as `props` to the page component.

The key insight is that `getStaticProps` runs only at build time in Node.js, so using `fs` to read a file is perfectly valid — it never runs in the browser.

---

**Q: Why build a custom Markdown parser instead of using an existing library like `gray-matter` or `remark`?**

`gray-matter` parses YAML frontmatter from a Markdown file — it's designed for a single document with metadata at the top. My `content.md` is a multi-section document where each section has its own key-value fields and nested entries. Bending `gray-matter` to handle that structure would require more configuration than just writing a small dedicated parser.

`remark` is for converting Markdown to HTML, which isn't what I need — I need structured data, not HTML output.

The custom parser is ~120 lines and handles exactly the shape I defined, with no extra dependencies. It's also trivially extensible when I add new fields.

---

**Q: What happens if someone adds a malformed entry to `content.md`?**

The parser fails gracefully: `getValue` returns an empty string if the key isn't found, and `getBullets` returns an empty array. The worst outcome is a card that renders with an empty description or missing bullet points — not a build failure. For a personal site maintained by one person, this tradeoff is acceptable. In a team environment I'd add validation and throw a descriptive error at build time.

---

### Internationalisation (i18n)

**Q: How did you implement the EN/ZH language toggle? Why not use a library like `next-i18next` or `react-i18next`?**

The implementation has two parts:

**Static UI labels** (page titles, button text, section headers) are stored in a plain TypeScript object in `lib/i18n.tsx`:
```ts
export const t = {
  en: { resume: { title: 'Resume', experience: 'Experience', ... } },
  zh: { resume: { title: '简历', experience: '工作经历', ... } },
}
```

**Dynamic content** from `content.md` uses `_zh` field variants: `bio_zh:`, `role_zh:`, `description_zh:`, and `zh-` prefixed bullet lines. The parser extracts both versions; pages pick the right one based on the current language.

A `LangContext` (React Context) holds the current language and exposes a `setLang` function. The preference is persisted in `localStorage` so it survives page reloads.

`next-i18next` adds routing complexity (locale-based URL segments like `/zh/resume`) which makes static export harder. `react-i18next` is a good library but adds ~30KB and a configuration layer for something I can implement in 80 lines. The custom approach also avoids hydration issues that translation libraries sometimes introduce with SSG.

---

**Q: How do you avoid hydration mismatch with the language state?**

The initial server-rendered HTML is always in English (the default `useState('en')`). On the client, a `useEffect` runs after hydration and reads `localStorage`. If the stored preference is `'zh'`, React updates the state and re-renders in Chinese. This causes a brief flash on first load if the user had previously selected Chinese, but it's imperceptible in practice. The alternative — rendering server-side with locale detection — would require a server, which contradicts the static export constraint.

---

**Q: What's the fallback strategy if a Chinese translation is missing?**

Every place that reads a `_zh` field uses `|| fallback`:
```ts
const bio = lang === 'zh' ? (about.bio_zh || about.bio) : about.bio;
```
If `bio_zh` is an empty string (field missing from `content.md`), it falls back to the English value. The site never shows empty content. Technical terms — tool names, company names, certification IDs — deliberately have no `_zh` variants and always display in English.

---

### Frontend & UX

**Q: How does the page transition animation work?**

In `_app.tsx`, the page content is wrapped in a `div` with a `key={pathname}`:

```tsx
<div key={pathname} className="page-enter">
  <Component {...pageProps} />
</div>
```

When the route changes, `pathname` changes, React unmounts the old `div` and mounts a new one. The new element starts the CSS animation fresh:

```css
.page-enter {
  animation: pageEnter 0.18s ease-out both;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

No animation library needed — just a 6-line CSS rule and a React `key` prop.

---

**Q: How does the Navbar know which link is the active page?**

`useRouter()` from `next/router` gives the current `pathname`. Each nav link compares its `href` against `pathname` with strict equality:

```tsx
pathname === href ? 'text-[#19c37d]' : 'text-[#a0a0a0] hover:text-white'
```

Strict equality means `/resume` only highlights the Resume link, not every link that contains a `/`. This is intentional — the site has no nested routes, so prefix matching isn't needed.

---

### CI/CD & DevOps

**Q: Walk me through the deployment pipeline from `git push` to live site.**

Three GitHub Actions workflows handle the pipeline:

**`build.yml`** — triggers on every push to `main` and every PR:
1. Checks out the repo
2. Runs `scripts/load-config.sh` to parse `config/services.yaml` and export `NEXT_PUBLIC_*` env vars
3. `npm ci` (reproducible install from lockfile)
4. `npm run build` (Next.js static export → `out/`)
5. Uploads `out/` as a build artifact

**`deploy-pages.yml`** — triggers only when `build.yml` succeeds on `main`:
1. Downloads the `out/` artifact
2. Deploys to GitHub Pages using the official `actions/deploy-pages` action
3. The site is live at `https://yigang666.github.io`

**`security-scan.yml`** — runs on every push to `main` and weekly on a cron schedule:
1. CodeQL static analysis (JavaScript/TypeScript)
2. `npm audit --audit-level=high` for known vulnerabilities
3. Trivy container scan on the Docker image

The build and deploy are separated so that PRs can run the full build and type-check without accidentally deploying unreviewed changes.

---

**Q: Why separate the build and deploy into two workflow files instead of one?**

Several reasons:

1. **Safety** — PRs trigger the build but not the deploy. Only merged commits on `main` get deployed.
2. **Reusability** — the build artifact (`out/`) can be downloaded by other workflows (e.g., a future E2E test job) without rebuilding.
3. **Auditability** — the deployment step has its own audit log, separate from build logs. This matters for compliance in professional environments.
4. **Failure isolation** — if the deploy step fails (GitHub Pages outage), the build artifact is preserved and can be re-deployed without a full rebuild.

---

**Q: What is `config/services.yaml` for, and why not just use `.env` files?**

`config/services.yaml` is a human-readable, version-controlled source of truth for external service configuration: GitHub API base URL, Plausible analytics endpoint, and dashboard refresh interval. A shell script (`load-config.sh`) parses it with `grep`/`sed` and exports the values as `NEXT_PUBLIC_*` environment variables before the build runs.

The advantage over `.env` files is that YAML is more readable for structured config and is checked into the repository, making the configuration visible and reviewable in PRs. Secrets (tokens, API keys) still go into GitHub Secrets — only non-sensitive configuration lives in the YAML file.

---

**Q: How does the Docker setup work?**

The Dockerfile is a multi-stage build:

**Stage 1 (`builder`)** — uses `node:20-alpine`:
- Installs dependencies with `npm ci`
- Runs `npm run build` to generate the static `out/` directory

**Stage 2 (`runner`)** — uses `nginx:alpine`:
- Copies only the `out/` directory from the builder stage
- The final image has no Node.js, no source code, no `node_modules` — just static files and Nginx
- Exposes port 80

The final image is significantly smaller than a Node.js image (~25MB vs ~180MB) and has a much smaller attack surface. The Nginx config serves `index.html` as a fallback for all routes, enabling client-side navigation to work correctly.

---

### Security

**Q: What security measures are in place?**

- **Static secrets management**: all tokens and API keys live in GitHub Secrets, never in source. The `NEXT_PUBLIC_` env vars set at build time contain only non-sensitive configuration.
- **Dependency scanning**: `npm audit --audit-level=high` runs on every push. Dependabot is enabled for weekly dependency updates.
- **CodeQL**: static analysis for JavaScript/TypeScript runs on every push and weekly. It catches common issues like XSS, prototype pollution, and insecure regex.
- **Container scanning**: Trivy scans the Docker image for OS-level and package-level CVEs on every build.
- **No server attack surface**: because the site is fully static, there is no backend, no database, no authentication surface, and no request handling code to exploit at runtime.

---

**Q: The site uses a public GitHub API for the dashboard — how do you handle rate limiting?**

The GitHub REST API allows 60 unauthenticated requests per hour per IP. The dashboard checks the `x-ratelimit-remaining` response header; if it's `0`, it throws a `'RATE_LIMITED'` error that the UI catches and displays as a warning instead of crashing. The dashboard also auto-refreshes every 60 seconds, which means at most 60 requests/hour from a single browser — staying within the unauthenticated limit under normal usage.

For higher limits in production, a `GITHUB_TOKEN` with read-only scope can be added to GitHub Secrets and injected at build time, raising the limit to 5,000 requests/hour.

---

### TypeScript & Code Quality

**Q: You're using TypeScript strict mode. What does that actually enforce?**

`strict: true` in `tsconfig.json` enables a bundle of compiler checks:
- `noImplicitAny` — every variable must have an explicit type or an inferrable one; no silent `any`
- `strictNullChecks` — `null` and `undefined` are not assignable to other types without explicit handling
- `strictFunctionTypes` — function parameter types are checked contravariantly
- `strictPropertyInitialization` — class properties must be initialized in the constructor

In practice, the most impactful ones for this project are `noImplicitAny` and `strictNullChecks`. They forced me to define explicit interfaces (`SiteContent`, `AboutData`, `BlogPost`, etc.) for all parsed content, and to handle the case where a `_zh` field might be an empty string. This prevents a whole class of runtime errors where `undefined.split(...)` would crash the page.

---

**Q: How would you extend this project if you wanted to add a new page, say a "Uses" page listing your gear and tools?**

Four steps:

1. **Add content** to `content.md` — create a new `## uses` section with the relevant fields
2. **Extend the parser** — add a `parseUses()` function in `parseContent.ts` and add `uses` to the `SiteContent` interface
3. **Add translations** — add `uses: { title: 'Uses', title_zh: '工具' }` to `lib/i18n.tsx`
4. **Create the page** — add `pages/uses.tsx` with `getStaticProps` calling `parseContent()`, and add the route to `NAV_HREFS` in `Navbar.tsx`

No changes to the build system, CI/CD, or deployment configuration needed. The new page gets built and deployed automatically on the next push to `main`.

---

## One-Line Talking Points

For quick back-and-forth during an interview:

- **"Zero-server architecture"** — static export means no Node.js process in production, no server to patch or scale
- **"Single source of truth"** — one Markdown file drives all five pages; update content, rebuild, done
- **"Build-time data, client-time language"** — content is parsed in Node.js at build time; language preference is resolved in the browser via React Context
- **"Separation of build and deploy"** — PRs build but don't deploy; only `main` triggers deployment
- **"Security by design"** — no secrets in source, no server attack surface, automated scanning on every push

---
title: Building a CI/CD Pipeline for Static Sites on GitHub Actions
date: 2024-06-20
---

Static sites need CI/CD too. Building and uploading by hand after every change is slow and error-prone. With GitHub Actions, pushing code can automatically build and publish to GitHub Pages. This post walks through the full setup, using a Next.js static-export site as the example.

## The overall flow

The pipeline is split into two workflows, each with its own job:

1. **Build**: triggers on pushes to main — installs dependencies, builds the static files, uploads the build output.
2. **Deploy**: triggers after a successful Build, publishing the output to GitHub Pages.

Separating them means a failed build never triggers a deploy, and a failed deploy can be retried on its own without rebuilding.

## Build workflow

```yaml
name: Build

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: site/nextjs-terminal-site/package-lock.json

      - name: Install dependencies
        working-directory: site/nextjs-terminal-site
        run: npm ci

      - name: Build static site
        working-directory: site/nextjs-terminal-site
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: site-out
          path: site/nextjs-terminal-site/out/
          retention-days: 1
          if-no-files-found: error
```

Key points:

- **Use `npm ci`, not `npm install`**: `ci` installs exactly what's in `package-lock.json`, so builds are reproducible. `install` may pick up newer versions and produce a build that works locally but fails in CI.
- **Cache dependencies**: `cache: 'npm'` in `setup-node` caches `node_modules`, making later builds much faster. `cache-dependency-path` must point at the real lock file — easy to get wrong in a subdirectory or monorepo layout.
- **Keep artifacts for 1 day**: the build output is only an intermediate between Build and Deploy; one day of retention is enough.
- **Build on pull requests too**: running Build for `pull_request` catches build failures before merging, so a broken build never reaches main.

## Deploy workflow

```yaml
name: Deploy to GitHub Pages

on:
  workflow_run:
    workflows:
      - Build
    types:
      - completed
    branches:
      - main

permissions:
  pages: write
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: site-out
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          path: ./out

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Note the `workflow_run` trigger: it only deploys when Build on main succeeds. A successful PR build does not trigger a deploy, so unmerged code never goes live.

## One-time GitHub Pages setup

In the repository, go to Settings → Pages → Build and deployment, and set Source to **GitHub Actions**. After that, the workflows take over completely.

A user site (`username.github.io`) publishes on push to main; a project site gets a path under the repository name. For a custom domain, add a `CNAME` file or set the domain in the Pages settings.

## Common problems

- **Build passes but the page 404s**: check whether the Deploy workflow ran, then confirm `out/` is really where the build output lands. A Next.js static export needs `output: 'export'` in `next.config.js`, otherwise no `out/` directory is generated.
- **Missing styles**: usually a resource-path issue. A static export with `trailingSlash` and `images.unoptimized` avoids most of these.
- **Builds getting slower**: check whether caching works — a wrong `cache-dependency-path` is the most common cause.
- **Deploy stuck**: Pages allows only one deployment per concurrency group at a time. If a previous deploy hasn't finished, the next one queues — wait a bit and check again.

Once it's set up, updating the site is a single step: edit the content, push to main, and the change is live within minutes. Publishing an article never involves touching deployment again.

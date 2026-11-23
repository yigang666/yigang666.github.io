---
title: 使用 GitHub Actions 为静态网站搭建 CI/CD 流水线
date: 2024-06-20
---

静态网站也要 CI/CD。每次改完手动构建、手动上传，既慢又容易出错。用 GitHub Actions 可以做到：推代码就自动构建、自动发布到 GitHub Pages。这篇以 Next.js 静态导出网站为例，记录完整做法。

## 整体流程

流水线分成两个 workflow，各干各的：

1. **Build**：推到 main 分支就触发，安装依赖、构建静态文件、上传构建产物。
2. **Deploy**：Build 成功之后触发，把构建产物发布到 GitHub Pages。

分开的好处是构建失败不会触发部署，部署失败也能单独重试，不用重新构建。

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

几个关键点：

- **`npm ci` 而不是 `npm install`**：`ci` 严格按 `package-lock.json` 安装，构建结果可复现；`install` 可能会装到新版本，导致本地能跑、线上构建失败。
- **缓存依赖**：`setup-node` 的 `cache: 'npm'` 会缓存 `node_modules`，第二次构建能快不少。`cache-dependency-path` 要指到实际的 lock 文件位置，monorepo 或者子目录项目容易写错。
- **产物保留 1 天**：构建产物只是 Build 和 Deploy 之间的中间文件，部署完就没用了，保留 1 天足够。
- **PR 也触发构建**：`pull_request` 也跑 Build，这样合代码之前就能发现构建问题，不会把坏的构建带进 main。

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

注意 `workflow_run` 的触发条件：只有 main 分支上 Build 成功了才部署。PR 的构建成功不会触发部署，避免没合的代码被发布出去。

## GitHub Pages 的一次性设置

仓库 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。选完之后不需要再管，部署全部由 workflow 接管。

用户站（`用户名.github.io`）推到 main 分支就会发布，项目站则按仓库名生成路径。如果用了自定义域名，在仓库里加 `CNAME` 文件，或者在 Pages 设置里填域名。

## 常见问题

- **构建通过、页面 404**：先看 Deploy workflow 有没有跑，再检查 `out/` 目录是不是构建产物真正的位置。Next.js 静态导出要在 `next.config.js` 里设 `output: 'export'`，否则不会生成 `out/`。
- **样式丢失**：一般是资源路径问题，静态导出配 `trailingSlash` 和 `images.unoptimized` 可以避开大部分坑。
- **构建越来越慢**：检查缓存有没有生效，`cache-dependency-path` 指错位置是最常见的原因。
- **部署卡住**：Pages 的并发组（concurrency group）一次只允许一个部署在跑，前一个部署没完成会排队，等一会再看。

搭好之后，日常更新网站就只剩一步：改内容，推到 main，几分钟后线上就能看到。写文章也不用再碰部署的事。

# 项目使用完全指南

> 从零开始：本地运行、修改内容、提交到 GitHub、自动部署。
> 每一步都有详细命令，直接复制粘贴执行。

---

## 目录

1. [前置准备（只需做一次）](#1-前置准备)
2. [本地运行网站](#2-本地运行网站)
3. [修改网站内容](#3-修改网站内容)
4. [把代码推送到 GitHub](#4-把代码推送到-github)
5. [自动构建和部署流程](#5-自动构建和部署流程)
6. [手动本地构建](#6-手动本地构建)
7. [Docker 本地运行](#7-docker-本地运行)
8. [GitHub Pages 设置（只需做一次）](#8-github-pages-设置)
9. [日常工作流总结](#9-日常工作流总结)
10. [常见问题排查](#10-常见问题排查)

---

## 1. 前置准备

### 安装 Node.js（如果还没装）
```bash
# 检查是否已安装
node --version   # 应该显示 v20.x.x
npm --version    # 应该显示 10.x.x

# 如果没安装，去 https://nodejs.org 下载 LTS 版本
```

### 安装 Git（如果还没装）
```bash
# 检查是否已安装
git --version    # 应该显示 git version 2.x.x

# Mac 上如果没有：
xcode-select --install
```

### 配置 Git 用户信息（只需做一次）
```bash
git config --global user.name "yigang666"
git config --global user.email "lyg19960729@gmail.com"
```

---

## 2. 本地运行网站

### 进入项目目录并安装依赖
```bash
# 进入 Next.js 项目目录
cd /Users/liyigang/claude/yigang666/site/nextjs-terminal-site

# 安装所有依赖（第一次需要，之后不用重复）
npm install
```

### 启动开发服务器
```bash
npm run dev
```

看到以下输出说明成功：
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
✓ Ready in 1062ms
```

打开浏览器访问 **http://localhost:3000**

### 停止开发服务器
在终端里按 `Ctrl + C`

---

## 3. 修改网站内容

### 修改简历内容
简历数据来自这个文件，直接编辑即可：
```
/Users/liyigang/claude/yigang666/content/resume.md
```

修改后，开发服务器会**自动热更新**，刷新浏览器就能看到变化。

---

### 修改"about"命令的内容
```
/Users/liyigang/claude/yigang666/site/nextjs-terminal-site/components/commands/about.tsx
```

---

### 修改"projects"命令的内容
```
/Users/liyigang/claude/yigang666/site/nextjs-terminal-site/components/commands/projects.tsx
```

---

### 修改颜色/样式
所有全局样式和颜色变量在：
```
/Users/liyigang/claude/yigang666/site/nextjs-terminal-site/styles/globals.css
```

颜色变量在文件顶部：
```css
:root {
  --green: #00ff41;   /* 主色调：终端绿 */
  --cyan: #00e5ff;    /* 青色：标题、链接 */
  --amber: #ffb300;   /* 琥珀色：高亮内容 */
  --red: #ff3b3b;     /* 红色：错误 */
}
```

---

### 添加新命令（比如添加 "contact" 命令的修改）
1. 编辑或创建 `components/commands/xxx.tsx`
2. 在 `components/commands/index.ts` 里注册：
```typescript
import XxxCommand from './xxx';
export const COMMANDS = {
  // 已有的...
  xxx: XxxCommand,   // 添加这一行
};
```

---

## 4. 把代码推送到 GitHub

### 第一步：确认在项目根目录
```bash
cd /Users/liyigang/claude/yigang666
```

### 第二步：初始化 Git 仓库（只在第一次推送时需要）
```bash
git init
git branch -M main
```

### 第三步：连接到 GitHub 远程仓库
```bash
# 替换成你的 GitHub 仓库地址
git remote add origin https://github.com/yigang666/yigang666.github.io.git
# 验证连接成功
git remote -v
# 应该显示：
# origin  https://github.com/yigang666/yigang666.github.io.git (fetch)
# origin  https://github.com/yigang666/yigang666.github.io.git (push)
```

### 第四步：查看哪些文件有变化
```bash
git status
```

输出示例：
```
Changes not staged for commit:
  modified:   content/resume.md
  modified:   components/commands/about.tsx

Untracked files:
  site/nextjs-terminal-site/pages/_app.tsx
```

### 第五步：添加文件到暂存区
```bash
# 添加所有变化的文件
git add .

# 或者只添加特定文件
git add content/resume.md
git add site/nextjs-terminal-site/
```

### 第六步：提交（写清楚改了什么）
```bash
git commit -m "feat: update resume content and fix styling"
```

**提交信息规范：**
| 前缀 | 含义 | 例子 |
|------|------|------|
| `feat:` | 新功能 | `feat: add blog command` |
| `fix:` | 修复 bug | `fix: resume parser null error` |
| `style:` | 样式修改 | `style: increase terminal font size` |
| `docs:` | 文档更新 | `docs: update usage guide` |
| `ci:` | CI/CD 相关 | `ci: add caching to build workflow` |
| `chore:` | 杂项（依赖更新等） | `chore: upgrade next.js to 14.3` |

### 第七步：推送到 GitHub
```bash
git push -u origin main
```

第一次推送会要求登录 GitHub：
- 用户名：你的 GitHub 用户名
- 密码：**不是账号密码，是 Personal Access Token（PAT）**
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

#### 如何生成 GitHub Personal Access Token（PAT）
1. 打开 GitHub → 右上角头像 → Settings
2. 左侧滚动到底部 → Developer settings
3. Personal access tokens → Tokens (classic)
4. Generate new token → 勾选 `repo` 权限
5. 生成后复制 token（只显示一次！）
6. 用 token 代替密码

---

### 日常推送（之后每次修改）
```bash
# 在项目根目录 /Users/liyigang/claude/yigang666

git add .
git commit -m "fix: update contact email"
git push
```

---

## 5. 自动构建和部署流程

推送代码后，GitHub Actions 自动执行：

```
你: git push
    ↓ (几秒内)
GitHub Actions 触发 build.yml
    ↓ (~2 分钟)
  1. 下载代码
  2. 安装 Node.js 20
  3. npm ci（安装依赖）
  4. npm run build（编译网站 → 生成 out/）
  5. 上传 out/ 为 artifact
    ↓
GitHub Actions 触发 deploy-pages.yml
    ↓ (~1 分钟)
  1. 下载 out/ artifact
  2. 部署到 GitHub Pages
    ↓
网站更新完成！访问 https://yigang666.github.io
```

### 查看流水线运行状态
1. 打开你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 可以看到每次 push 的构建记录
4. 点进去看详细日志

**绿色 ✓** = 成功
**红色 ✗** = 失败（点进去看错误日志）

---

## 6. 手动本地构建

当你想在本地预览最终的静态文件效果：

```bash
cd /Users/liyigang/claude/yigang666/site/nextjs-terminal-site

# 构建（生成 out/ 目录）
npm run build

# 查看生成的文件
ls out/
# 应该看到: index.html, _next/, 404.html 等

# 本地预览构建结果（需要先安装 serve）
npx serve out -p 3001

# 访问 http://localhost:3001
```

---

## 7. Docker 本地运行

Docker 可以让你完全模拟生产环境（Nginx 服务器）：

### 前置条件
```bash
# 检查 Docker 是否安装
docker --version   # 应该显示 Docker version 24.x.x

# 如果没有，下载 Docker Desktop: https://www.docker.com/products/docker-desktop
```

### 构建并运行
```bash
# 进入项目根目录（Dockerfile 在这里）
cd /Users/liyigang/claude/yigang666

# 构建 Docker 镜像（第一次比较慢，需要几分钟）
docker build -t yigang666:latest .

# 运行容器
docker run -d -p 8080:80 --name yigang666-site yigang666:latest

# 访问 http://localhost:8080
```

### 常用 Docker 命令
```bash
# 查看运行中的容器
docker ps

# 停止容器
docker stop yigang666-site

# 删除容器
docker rm yigang666-site

# 删除镜像
docker rmi yigang666:latest

# 查看容器日志（排查问题）
docker logs yigang666-site
```

---

## 8. GitHub Pages 设置

**只需要做一次。** 推送代码前先设置好。

### 在 GitHub 仓库里启用 Pages
1. 打开 `https://github.com/yigang666/yigang666.github.io`
2. 点击 **Settings** 标签
3. 左侧菜单找到 **Pages**
4. Source 选择 **GitHub Actions**（不是 Deploy from a branch）
5. 保存

### 给 Actions 设置权限
1. Settings → Actions → General
2. 滚动到 "Workflow permissions"
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 保存

### 等待第一次部署
推送代码后，等 Actions 运行完毕（3-5 分钟），访问：
```
https://yigang666.github.io
```

---

## 9. 日常工作流总结

### 修改内容并发布的完整步骤

```bash
# 1. 进入 Next.js 项目目录，启动开发服务器
cd /Users/liyigang/claude/yigang666/site/nextjs-terminal-site
npm run dev

# 2. 浏览器打开 http://localhost:3000，边改边预览

# 3. 改完后，回到项目根目录
cd /Users/liyigang/claude/yigang666

# 4. 查看改了哪些文件
git status

# 5. 添加并提交
git add .
git commit -m "feat: 简短描述你改了什么"

# 6. 推送（自动触发构建和部署）
git push

# 7. 在 GitHub Actions 页面查看部署进度
# 3-5 分钟后访问 https://yigang666.github.io 查看效果
```

---

## 10. 常见问题排查

### 问题：`npm run dev` 报错 "port 3000 is in use"
```bash
# 换一个端口运行
npm run dev -- -p 3001

# 或者找到占用 3000 端口的进程并杀掉
lsof -ti:3000 | xargs kill
npm run dev
```

---

### 问题：`git push` 失败，提示认证失败
```bash
# 检查远程地址
git remote -v

# 重新设置（用 HTTPS + token 方式）
git remote set-url origin https://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@github.com/yigang666/yigang666.github.io.git

# 替换 YOUR_TOKEN 为你的 Personal Access Token
```

---

### 问题：GitHub Actions 构建失败
1. 打开 GitHub → Actions → 点击失败的 workflow
2. 展开红色的步骤查看错误日志
3. 常见原因：
   - **npm ci 失败**：`package-lock.json` 和 `package.json` 不同步 → 本地运行 `npm install` 再 push
   - **TypeScript 编译错误**：本地运行 `npm run build` 复现错误，修复后再 push
   - **权限不足**：检查 Settings → Actions → Workflow permissions

---

### 问题：网站更新了但浏览器看到的还是旧版本
```
强制刷新：
  Mac: Cmd + Shift + R
  Windows: Ctrl + Shift + R

或者打开无痕模式访问
```

---

### 问题：Dashboard 显示 "RATE LIMITED"
- GitHub API 未认证每小时只有 60 次请求配额
- 等一小时后自动恢复
- 生产环境可以在 GitHub Secrets 里配置 `GITHUB_TOKEN` 来提高限额（5000次/小时）

---

### 问题：简历内容没有更新
简历数据在构建时解析，**开发服务器需要重启**才能看到 `content/resume.md` 的变化：
```bash
# 停止开发服务器 (Ctrl+C)，重新启动
npm run dev
```

---

## 附录：项目文件结构速查

```
yigang666/
├── content/
│   └── resume.md                    ← ✏️ 修改简历内容
├── site/nextjs-terminal-site/
│   ├── pages/
│   │   ├── _app.tsx                 ← 全局 CSS 入口（不要改）
│   │   └── index.tsx                ← 主页（不要改）
│   ├── components/
│   │   ├── Terminal.tsx             ← 终端核心逻辑
│   │   └── commands/
│   │       ├── about.tsx            ← ✏️ 修改 about 命令内容
│   │       ├── resume.tsx           ← 自动读取 resume.md（不要改）
│   │       ├── projects.tsx         ← ✏️ 修改项目列表
│   │       ├── contact.tsx          ← ✏️ 修改联系方式
│   │       ├── blog.tsx             ← ✏️ 修改博客列表
│   │       └── dashboard.tsx        ← 实时数据（不要改）
│   └── styles/
│       └── globals.css              ← ✏️ 修改颜色和视觉效果
├── .github/workflows/               ← CI/CD 流水线（不要改）
├── docs/
│   ├── LEARNING.md                  ← 技术学习指南
│   └── USAGE.md                     ← 本文件
└── terraform/                       ← DNS 配置（有自定义域名才需要）
```

**✏️ = 你会经常需要修改的文件**

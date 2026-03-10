# 项目技术学习指南

> 这份文档帮你理解项目里用到的每一项技术，以及面试时怎么解释它们。
> 先理解"是什么、为什么用、在这个项目里怎么用"，然后用自己的话讲出来。

---

## 目录

1. [整体架构概览](#1-整体架构概览)
2. [Next.js — 静态网站框架](#2-nextjs)
3. [React — 前端 UI 框架](#3-react)
4. [TypeScript — 类型安全的 JavaScript](#4-typescript)
5. [TailwindCSS — 样式框架](#5-tailwindcss)
6. [GitHub Actions — CI/CD 自动化流水线](#6-github-actions)
7. [GitHub Pages — 静态托管](#7-github-pages)
8. [Docker — 容器化](#8-docker)
9. [Terraform — 基础设施即代码（IaC）](#9-terraform)
10. [安全扫描 — Dependabot / CodeQL / Trivy](#10-安全扫描)
11. [GitHub API — 实时数据](#11-github-api)
12. [面试常见问题汇总](#12-面试常见问题汇总)

---

## 1. 整体架构概览

```
你写代码
    ↓
git push 到 GitHub
    ↓
GitHub Actions 自动触发（CI/CD）
    ├── build.yml        → 安装依赖、编译网站
    ├── deploy-pages.yml → 把编译结果部署到 GitHub Pages
    └── security-scan.yml → 扫描安全漏洞
    ↓
用户访问网站（静态 HTML/CSS/JS，托管在 GitHub Pages）
    ↓
浏览器里的 JavaScript 调用 GitHub API（实时数据）
```

**面试一句话总结：**
> "这是一个 Next.js 静态网站，通过 GitHub Actions 实现自动化构建和部署到 GitHub Pages，同时集成了 Docker 容器化、Terraform IaC 和多层安全扫描，展示完整的 DevOps 工程实践。"

---

## 2. Next.js

### 是什么
Next.js 是基于 React 的 Web 框架。普通 React 只能在浏览器里运行，Next.js 可以在服务器端或构建时生成 HTML 文件。

### 这个项目怎么用
我们用的是 **Static Export 模式**（`output: 'export'`）：
- 构建时（`npm run build`）把所有页面编译成纯 HTML/CSS/JS 文件，输出到 `out/` 目录
- 这些静态文件直接放到任何 Web 服务器或 GitHub Pages 上就能访问
- 不需要服务器运行 Node.js

### 关键文件
```
site/nextjs-terminal-site/
├── next.config.js         ← 配置 output: 'export'（静态导出模式）
├── pages/
│   ├── _app.tsx           ← 全局 CSS 在这里引入
│   └── index.tsx          ← 唯一一个页面（主页）
```

### `getStaticProps` 是什么
```typescript
// pages/index.tsx 里的这段代码
export const getStaticProps: GetStaticProps = async () => {
  const resumeData = parseResume(resumePath);  // 在构建时读取 resume.md
  return { props: { resumeData } };            // 把数据传给页面组件
};
```
- `getStaticProps` 在**构建时**（不是用户访问时）执行
- 可以读取文件系统、调用 API，把数据"烤"进 HTML
- 用户访问时看到的是已经包含数据的 HTML，速度极快

### 面试怎么说
> "我选择 Next.js 的 Static Export 模式，因为项目托管在 GitHub Pages，不支持服务器端渲染。`getStaticProps` 在构建阶段解析 resume.md 文件，把结构化数据嵌入 HTML，用户首次加载无需等待 API 调用。"

---

## 3. React

### 是什么
React 是 Facebook 开发的 UI 框架，核心思想是**组件化**：把界面拆分成可复用的小组件。

### 这个项目里的组件结构
```
Terminal.tsx          ← 整个终端容器（管理状态）
├── TerminalLine.tsx  ← 每一行输出（显示文字）
├── CommandInput.tsx  ← 底部输入框
└── commands/
    ├── about.tsx     ← 输入 "about" 显示的内容
    ├── resume.tsx    ← 输入 "resume" 显示的内容
    ├── dashboard.tsx ← 输入 "dashboard" 显示的内容
    └── ...
```

### React Hooks — 状态管理
项目里用了 3 个核心 Hook：

**`useState`** — 保存会变化的数据
```typescript
const [outputLines, setOutputLines] = useState([]);   // 终端输出的所有行
const [inputValue, setInputValue] = useState('');      // 输入框里的文字
const [commandHistory, setCommandHistory] = useState([]); // 历史命令（↑↓键用）
```

**`useEffect`** — 处理副作用（定时器、API 调用）
```typescript
// Dashboard 里：组件显示时开始获取数据，每 60 秒刷新一次
useEffect(() => {
  fetchAll();
  const id = setInterval(fetchAll, 60000);
  return () => clearInterval(id);  // 组件消失时清除定时器（避免内存泄漏）
}, [fetchAll]);
```

**`useRef`** — 直接操作 DOM 元素
```typescript
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();  // 让输入框自动获得焦点
```

### 面试怎么说
> "React 的 `useState` 管理终端的输出历史和输入状态，`useEffect` 处理 Dashboard 的定时刷新（每 60 秒调用 GitHub API），`useRef` 确保用户点击屏幕任意位置时输入框自动聚焦，模拟真实终端体验。"

---

## 4. TypeScript

### 是什么
TypeScript 是 JavaScript 的超集，加了类型系统。代码写完编译成普通 JS。

### 为什么用
- 在写代码时就能发现错误（不用等到运行时崩溃）
- IDE 自动补全更准确
- 代码更易读、维护

### 项目里的关键类型定义
```typescript
// lib/parseResume.ts 里定义了简历数据的结构
interface ResumeData {
  name: string;
  contact: { phone: string; email: string; linkedin: string };
  education: Array<{ institution: string; degree: string; period: string }>;
  experience: Array<{ company: string; role: string; period: string; bullets: string[] }>;
  skills: { technical: string[]; linguistic: string[]; certifications: string[]; hobbies: string[] };
}
```

有了这个类型，如果你写 `resumeData.contcat`（拼错了），TypeScript 会立刻报错。

### 面试怎么说
> "TypeScript 的 strict 模式帮助我在构建阶段捕获类型错误，特别是在处理 GitHub API 返回的 JSON 数据时，类型定义让数据结构一目了然，减少了 runtime 报错的风险。"

---

## 5. TailwindCSS

### 是什么
TailwindCSS 是一个 CSS 框架，提供大量预定义的 utility class（工具类）。不用自己写 CSS 文件，直接在 HTML/JSX 里用类名。

### 对比普通 CSS
```css
/* 普通 CSS：要写单独的 .css 文件 */
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: black;
}
```
```jsx
{/* TailwindCSS：直接在 JSX 里写 */}
<div className="flex flex-col h-full bg-black">
```

### 这个项目的颜色体系
- `text-green-400` → 终端绿色文字
- `bg-black` → 黑色背景
- `font-mono` → 等宽字体
- `animate-pulse` → 脉冲动画（Loading 状态）

### 面试怎么说
> "TailwindCSS 的 utility-first 方式减少了 CSS 文件的维护成本，构建时会自动 tree-shake（移除未使用的样式），最终 CSS 文件体积很小，适合静态站点优化加载速度。"

---

## 6. GitHub Actions

### 是什么
GitHub Actions 是 GitHub 内置的 CI/CD（持续集成/持续部署）平台。你提交代码后，它自动触发预先定义好的工作流。

### CI/CD 是什么
- **CI（Continuous Integration，持续集成）**：每次提交代码自动运行构建、测试
- **CD（Continuous Deployment，持续部署）**：构建成功后自动部署到生产环境

### 项目里的三个工作流

#### `build.yml` — 构建流水线
```yaml
on:
  push:
    branches: [main]     # 当你 push 到 main 分支时触发

jobs:
  build:
    runs-on: ubuntu-latest   # 在 GitHub 的 Ubuntu 服务器上运行
    steps:
      - uses: actions/checkout@v4          # 1. 下载代码
      - uses: actions/setup-node@v4        # 2. 安装 Node.js 20
      - run: npm ci                        # 3. 安装依赖（比 npm install 更严格）
      - run: npm run build                 # 4. 编译网站 → 生成 out/ 目录
      - uses: actions/upload-artifact@v4   # 5. 上传 out/ 为 artifact（给下一步用）
```

#### `deploy-pages.yml` — 部署流水线
```yaml
# build.yml 成功后自动触发
# 下载 out/ 目录，部署到 GitHub Pages
```

#### `security-scan.yml` — 安全扫描
```yaml
# 每次 push + 每周自动运行
# 运行 CodeQL、npm audit、Trivy
```

### 面试怎么说
> "我配置了三条 GitHub Actions 流水线：build 流水线在每次 push main 时触发，运行 npm ci 和 next build；deploy 流水线依赖 build 成功后自动把静态文件部署到 GitHub Pages；security-scan 每周定期运行 CodeQL 静态分析和 Trivy 容器扫描。整个流程实现了 zero-touch deployment。"

### 关键概念
| 术语 | 解释 |
|------|------|
| `workflow` | 整个自动化流程（一个 `.yml` 文件） |
| `job` | 工作流里的一个任务（在一台独立虚拟机上运行） |
| `step` | job 里的一个步骤（一条命令或一个 Action） |
| `artifact` | job 之间传递文件的方式（比如把 out/ 传给 deploy job） |
| `runner` | 执行 job 的虚拟机（`ubuntu-latest` = GitHub 提供的 Ubuntu） |

---

## 7. GitHub Pages

### 是什么
GitHub Pages 是 GitHub 提供的**免费静态网站托管服务**。你的仓库叫 `yigang666.github.io`，GitHub 会自动把它发布到 `https://yigang666.github.io`。

### 限制
- 只能托管**静态文件**（HTML/CSS/JS），不能运行服务器代码
- 这就是为什么我们用 Next.js 的 static export 模式

### 工作原理
```
GitHub Actions → 生成 out/ 目录 → 推送到 GitHub Pages → 用户访问
```

### 面试怎么说
> "GitHub Pages 是零成本的静态托管方案，配合 Next.js 的 `output: 'export'`，构建产物是纯静态文件，不需要 Node.js 运行时，CDN 直接分发，性能优秀。"

---

## 8. Docker

### 是什么
Docker 是容器化技术。把你的应用和它的运行环境打包成一个"容器"，在任何机器上都能一致运行。

### 为什么用
- **一致性**：开发环境和生产环境完全一样，避免"在我机器上没问题"的问题
- **可移植性**：镜像可以部署到任何支持 Docker 的平台（AWS、GCP、Azure 等）

### 项目里的 Dockerfile（多阶段构建）
```dockerfile
# 阶段 1：Builder — 编译网站
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci              # 安装依赖
COPY . .
RUN npm run build       # 生成 out/ 目录

# 阶段 2：Runner — 只包含静态文件和 Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/out /usr/share/nginx/html  # 只复制编译结果
EXPOSE 80
```

**多阶段构建的好处**：最终镜像里没有 Node.js、没有源代码、没有 node_modules，体积很小，安全性更高。

### 常用命令
```bash
# 构建镜像
docker build -t yigang666 .

# 运行容器（本地预览）
docker run -p 8080:80 yigang666

# 访问 http://localhost:8080
```

### 面试怎么说
> "Dockerfile 使用多阶段构建：第一阶段用 node:20-alpine 编译 Next.js 网站，第二阶段只用 nginx:alpine 托管静态文件，最终镜像不包含源代码和构建工具，体积从 ~1GB 降到 ~20MB，同时减小了攻击面。"

---

## 9. Terraform

### 是什么
Terraform 是基础设施即代码（Infrastructure as Code，IaC）工具。用代码描述你的云资源（DNS 记录、服务器、数据库等），Terraform 负责创建和管理它们。

### 这个项目用 Terraform 管理什么
管理 **Cloudflare DNS 记录**：

```hcl
# terraform/cloudflare_dns.tf
resource "cloudflare_record" "cname_www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = "yigang666.github.io"
  type    = "CNAME"   # 把 www.yourdomain.com 指向 GitHub Pages
}
```

### 为什么用 IaC
- **可重现**：DNS 配置写在代码里，随时可以重新创建
- **版本控制**：DNS 变更记录在 Git 历史里，可以回滚
- **不容易出错**：不用手动在 Cloudflare 控制台点来点去

### Terraform 基本工作流
```bash
terraform init     # 初始化，下载 Cloudflare provider
terraform plan     # 预览：告诉你它会创建/修改/删除什么
terraform apply    # 执行：真正创建资源
terraform destroy  # 销毁所有资源
```

### 面试怎么说
> "Terraform 管理 Cloudflare 的 DNS CNAME 记录，把自定义域名指向 GitHub Pages。IaC 的好处是 DNS 配置版本化、可审计、可重现，避免了手动操作云控制台带来的配置漂移（configuration drift）问题。"

---

## 10. 安全扫描

### Dependabot — 依赖漏洞自动修复
- GitHub 内置功能，自动扫描 `package.json` 里的依赖有没有已知漏洞
- 发现漏洞时自动创建 Pull Request 更新依赖版本
- 配置文件：`.github/dependabot.yml`

### CodeQL — 静态代码分析
- GitHub 的代码安全扫描工具，分析源代码找安全漏洞（SQL 注入、XSS 等）
- 在 `security-scan.yml` 里配置，每次 push 时运行

### Trivy — 容器镜像扫描
- 扫描 Docker 镜像里的 OS 包和依赖有没有 CVE（已知漏洞）
- 在 CI 里构建镜像后立即扫描

### 三层安全防护理解
```
Dependabot   → 第三方依赖的漏洞（npm 包）
CodeQL       → 自己写的代码里的漏洞
Trivy        → Docker 镜像里的 OS 和运行时漏洞
```

### 面试怎么说
> "项目实现了三层安全扫描：Dependabot 自动监控 npm 依赖的 CVE 并创建修复 PR；CodeQL 对 TypeScript 代码做静态分析，检测 XSS、注入等漏洞；Trivy 扫描 Docker 镜像的 OS 层漏洞。这符合 DevSecOps 的 'shift-left' 理念——在开发阶段就发现安全问题，而不是上线后。"

---

## 11. GitHub API

### 是什么
GitHub 提供了 REST API，可以通过 HTTP 请求查询仓库信息。

### 项目里怎么用
Dashboard 页面通过 GitHub API 实时获取：

| API 端点 | 获取的数据 |
|----------|-----------|
| `GET /repos/{owner}/{repo}/commits` | 最新提交信息 |
| `GET /repos/{owner}/{repo}/actions/runs` | CI/CD 运行状态 |
| `GET /repos/{owner}/{repo}` | 仓库基本信息（Star 数、Issues 数） |

```typescript
// 例子：获取最新提交
const response = await fetch(
  'https://api.github.com/repos/yigang666/yigang666.github.io/commits?per_page=1'
);
const data = await response.json();
```

### 注意事项
- GitHub 公开 API 未认证时每小时限制 **60 次请求**
- 项目里处理了 Rate Limit 情况（显示 "RATE LIMITED" 而不是崩溃）
- Dashboard 每 60 秒刷新一次，不会频繁触发限制

### 面试怎么说
> "Dashboard 通过 GitHub REST API 客户端获取实时数据，用 `Promise.allSettled` 并行请求三个端点（commits、actions/runs、repo info），任一失败不影响其他数据展示。同时处理了 429/403 Rate Limit 响应，优雅降级显示错误状态而非页面崩溃。"

---

## 12. 面试常见问题汇总

### Q: 介绍一下这个项目
> "这是我的个人 DevOps 作品集网站。前端用 Next.js（静态导出模式）+ React + TailwindCSS，界面模拟 Linux 终端风格。通过 GitHub Actions 实现 CI/CD 自动化：每次提交自动构建并部署到 GitHub Pages。项目集成了 Terraform 管理 Cloudflare DNS，以及 Dependabot、CodeQL、Trivy 三层安全扫描，体现了完整的 DevOps 工程实践。"

### Q: 什么是 CI/CD，你是怎么实现的？
> "CI 是持续集成：每次提交代码，自动运行构建和测试，及早发现问题。CD 是持续部署：构建成功后自动部署，减少人工操作。我用 GitHub Actions 实现了三条流水线：build（构建验证）、deploy-pages（自动部署到 GitHub Pages）、security-scan（安全扫描）。"

### Q: 什么是 IaC（基础设施即代码）？
> "用代码而不是手动操作来管理基础设施。好处是：可版本控制、可重现、可审计、减少人为错误。项目用 Terraform 管理 Cloudflare DNS 记录，DNS 配置存在 Git 里，有变更可以 review 后再 apply。"

### Q: Docker 多阶段构建的好处？
> "分离构建环境和运行环境。第一阶段安装所有构建工具和依赖来编译代码；第二阶段只包含运行所需的最小内容。最终镜像不含源代码、node_modules、构建工具，体积小、攻击面小、安全性更高。"

### Q: 静态网站和服务端渲染的区别？
> "静态网站（SSG）在构建时生成 HTML 文件，所有用户拿到同一份 HTML，CDN 直接缓存，速度极快，成本低，适合内容不常变的页面。服务端渲染（SSR）每次请求时在服务器动态生成 HTML，适合内容个性化或实时更新的页面，但需要服务器运行时，成本更高。"

### Q: 怎么处理 API 限流（Rate Limiting）？
> "GitHub API 未认证时每小时 60 次限制。我在代码里检测响应头里的 `x-ratelimit-remaining`，为 0 时抛出特定错误。Dashboard 用 `Promise.allSettled` 确保单个 API 失败不影响其他数据，并向用户显示 'RATE LIMITED' 状态而不是直接崩溃。"

### Q: TypeScript 和 JavaScript 的区别？
> "TypeScript 是 JavaScript 的超集，加了静态类型系统。好处：编译时发现类型错误、更好的 IDE 支持（自动补全）、代码文档化（类型定义即文档）。缺点：需要编译步骤，有学习成本。在这个项目里 strict 模式帮助我在 GitHub API 数据处理上避免了很多潜在的 null reference 错误。"

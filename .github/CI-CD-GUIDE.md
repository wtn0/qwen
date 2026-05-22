# CI/CD 配置指南

## 项目架构总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Vue 3.5 (Composition API) | `<script setup>` 语法 |
| 路由 | Vue Router 4.5 | History 模式 |
| 构建 | Vite 6.0 | 极速 HMR + 生产构建 |
| 样式 | 原生 CSS (Scoped) | 无 UI 框架依赖 |
| 包管理 | npm | lock 文件已纳入版本控制 |

```
qwen/
├── src/
│   ├── main.js          # 入口：挂载 App + Router
│   ├── App.vue          # 根组件：<router-view />
│   ├── router/index.js  # 路由配置（单页 / → AccountList）
│   └── views/
│       └── AccountList.vue  # 子账号管理页（CRUD + 搜索 + 分页）
├── index.html           # HTML 入口
├── vite.config.js       # @/ → /src 别名
├── package.json         # dev / build / preview
└── .github/workflows/
    ├── ci.yml           # 持续集成：lint → test → build
    └── deploy.yml       # 自动部署：GitHub Pages
```

---

## 工作流说明

### 1. CI（持续集成）— `.github/workflows/ci.yml`

```
触发条件                   流水线步骤
──────────────────────    ──────────────────────────────
push → main/master/dev ─→  lint ─┐
pull_request → main     ─→       ├─→ build ─→ 上传产物
手动触发 (workflow_dispatch) ─→  test ─┘
```

**3 个 Job：**

| Job | 作用 | 状态 |
|-----|------|------|
| `lint` | ESLint 静态检查 + TypeScript 类型检查 | 🟡 占位（项目暂未配置） |
| `test` | Vitest 单元测试 + 覆盖率 | 🟡 占位（项目暂未配置） |
| `build` | Vite 生产构建 + 产物上传 | ✅ 已启用 |

> **启用 Lint / Test 后**，取消 `ci.yml` 中对应步骤的注释即可自动生效。

---

### 2. CD（自动部署）— `.github/workflows/deploy.yml`

```
触发条件                   部署流程
──────────────────────    ──────────────────────────────
push → main               npm ci → npm run build → GitHub Pages
  (仅 src/ 等变更时触发)
手动触发
```

**4 种部署方案均已内置：**

| 方案 | 适用场景 | 费用 | 配置难度 |
|------|---------|------|---------|
| **GitHub Pages** ✅ | 个人项目 / 演示 | 免费 | 低（默认启用） |
| Vercel | 生产环境 | 免费额度 | 中（需 Token） |
| Netlify | 生产环境 | 免费额度 | 中（需 Token） |
| 自有服务器 | 企业内网 | 按服务器 | 高（需 SSH） |

切换方案只需取消 `deploy.yml` 中对应注释，注释掉 GitHub Pages 部分，并在仓库 Settings → Secrets 配置对应 Token。

---

## 部署前必要配置

### GitHub Pages + Vue Router 适配

GitHub Pages 不支持 SPA 的 History 模式路由回退。请选择以下方案之一：

**方案 A：切换为 Hash 模式（推荐，最简单）**

修改 `src/router/index.js`：

```js
// 改前
import { createRouter, createWebHistory } from 'vue-router'
// ...
history: createWebHistory()

// 改后
import { createRouter, createWebHashHistory } from 'vue-router'
// ...
history: createWebHashHistory()
```

URL 会从 `/account` 变为 `/#/` 格式，但解决了 404 问题。

**方案 B：保留 History 模式 + 404 回退（体验更好）**

1. 在 `public/` 下创建 `404.html`（内容同 `index.html`）
2. GitHub Pages 会使用它作为 SPA fallback

### Vite base 路径配置

修改 `vite.config.js`，添加条件 base：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/<仓库名>/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

将 `<仓库名>` 替换为你的 GitHub 仓库名（例如 `qwen`）。

---

## 启用 GitHub Pages

1. 推送代码到 GitHub 仓库的 `main` 分支
2. 进入仓库 **Settings → Pages**
3. **Source** 选择 `GitHub Actions`
4. 首次 push 后，Actions 会自动部署，部署完成后在 Settings → Pages 顶部看到 URL

---

## 后续增强建议

### 短期（推荐立即配置）

```bash
# 1. 添加 ESLint
npm install -D eslint @eslint/js eslint-plugin-vue

# 2. 添加 Vitest（单元测试）
npm install -D vitest @vue/test-utils jsdom

# 3. 在 package.json 添加脚本
# "lint": "eslint src/ --ext .vue,.js",
# "test": "vitest run",
# "test:watch": "vitest"
```

### 中期

- 接入 `playwright` 做 E2E 测试
- 配置 `Renovate` 自动更新依赖
- 添加 PR 预览部署（Vercel / Netlify 支持）
- 配置 `semantic-release` 自动发版

### 长期

- Docker 容器化部署
- Kubernetes 集群部署
- 蓝绿部署 / 金丝雀发布策略
- 接入 APM 监控（Sentry / Datadog）

# IntimDiary - 项目核心文档

> **重要提示**：AI 助手在开始任何工作前应先阅读本文档，了解项目架构和工作流程。

## 📋 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [构建与部署](#构建与部署)
- [关键配置](#关键配置)
- [常见问题](#常见问题)

---

## 项目概述

IntimDiary 是一个基于 React + Cloudflare 全栈的私密日记应用。

**核心特性：**
- 📝 日记记录与管理
- 🤖 AI 智能分析（OpenRouter）
- 🔐 Google OAuth 登录
- 📊 数据可视化
- 💾 自动备份到 R2
- 📱 PWA 支持

---

## 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.8.2 | 类型安全 |
| Vite | 6.2.0 | 构建工具 |
| React Router | 6.30.2 | 路由管理 |
| Tailwind CSS | 4.1.18 | 样式框架 |
| Lucide React | 0.468.0 | 图标库 |
| Recharts | 2.15.0 | 图表库 |
| Canvas Confetti | 1.9.4 | 动画效果 |

### 后端技术栈

| 技术 | 用途 |
|------|------|
| Cloudflare Pages | 静态托管 |
| Cloudflare Workers | Serverless API |
| Cloudflare D1 | SQLite 数据库 |
| Cloudflare KV | Session 存储 |
| Cloudflare R2 | 备份存储 |

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                              │
│                  (React SPA + PWA)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Pages (CDN)                      │
│              - 静态资源托管                                │
│              - 全球 CDN 加速                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Cloudflare Workers (Pages Functions)            │
│         /functions/api/*                                │
│         - auth/login.ts    (登录)                        │
│         - auth/register.ts (注册)                        │
│         - auth/google.ts   (Google OAuth)               │
│         - auth/me.ts       (获取用户信息)                  │
│         - auth/logout.ts   (登出)                        │
│         - logs.ts          (日志 CRUD)                   │
│         - insights.ts      (AI 分析)                     │
│         - backup.ts        (备份)                        │
└────────┬──────────┬──────────┬─────────────────────────┘
         │          │          │
         ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │   D1   │ │   KV   │ │   R2   │
    │ 数据库  │ │ Session│ │ 备份   │
    └────────┘ └────────┘ └────────┘
```

---

## 项目结构

```
intimome/
├── components/          # React 组件
│   ├── BottomNav.tsx   # 底部导航（长按手势）
│   ├── LogEntryForm.tsx
│   ├── DateTimePicker.tsx
│   └── ...
├── pages/              # 页面组件
│   ├── DashboardPage.tsx
│   ├── LogPage.tsx
│   ├── HistoryPage.tsx
│   └── AuthPage.tsx
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── services/           # API 服务层
│   ├── logsService.ts
│   └── authService.ts
├── functions/          # Cloudflare Workers (后端)
│   ├── api/
│   │   ├── auth/      # 认证相关 API
│   │   ├── logs.ts    # 日志 CRUD
│   │   ├── insights.ts # AI 分析
│   │   └── backup.ts  # 备份
│   └── tsconfig.json
├── utils/              # 工具函数
│   └── translations.ts
├── styles/             # 样式文件
│   └── main.css
├── public/             # 静态资源
├── dist/               # 构建输出（自动生成）
├── migrations/         # 数据库迁移
├── schema.sql          # D1 数据库 Schema
├── wrangler.toml       # Cloudflare 配置
├── vite.config.ts      # Vite 配置
├── package.json        # 依赖管理
├── tsconfig.json       # TypeScript 配置
├── PROJECT.md          # 本文档
└── DEPLOYMENT.md       # 部署详细指南
```

### ⚠️ 已废弃的目录

- `server/` - **已废弃**，旧的 Express 后端，已迁移到 Cloudflare Workers

---

## 开发工作流

### 1. 环境准备

```bash
# 安装依赖
npm install

# 创建环境变量文件
cp .dev.vars.example .dev.vars
```

**`.dev.vars` 配置：**
```bash
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini
GOOGLE_CLIENT_ID=your-google-client-id
BACKUP_SECRET=your-backup-secret
```

### 2. 本地开发

#### 方式一：Vite 开发服务器（推荐）

```bash
# 终端 1：启动前端开发服务器
npm run dev
# 访问 http://localhost:3000

# 终端 2：启动 Cloudflare Workers 本地服务器
npm run pages:dev
# Workers API 运行在 http://localhost:8788
```

**工作原理：**
- Vite 在 `localhost:3000` 提供前端热重载
- Vite 代理 `/api/*` 请求到 `localhost:8788`（Cloudflare Workers）
- Workers 连接本地 D1 数据库

#### 初始化本地数据库

```bash
# 首次运行需要初始化本地 D1
npx wrangler d1 execute intimome-db --local --file=./schema.sql
```

### 3. 代码规范

- **TypeScript**：所有代码必须通过类型检查
  ```bash
  npx tsc --noEmit
  ```
- **组件**：使用函数组件 + Hooks
- **样式**：优先使用 Tailwind CSS
- **命名**：
  - 组件：PascalCase（如 `BottomNav.tsx`）
  - 函数/变量：camelCase（如 `handlePressStart`）
  - 常量：UPPER_SNAKE_CASE（如 `LONG_PRESS_DURATION`）

---

## 构建与部署

### 构建流程

```bash
# 1. 构建前端（生成 dist/ 目录）
npm run build

# 输出：
# - dist/index.html
# - dist/assets/*.js (代码分割后的 chunks)
# - dist/assets/*.css
```

**构建优化：**
- ✅ 代码分割（React、Recharts、Lucide 独立 chunk）
- ✅ Terser 压缩（移除 console 和 debugger）
- ✅ Tree shaking
- ✅ CSS 压缩

### 部署流程

```bash
# 一键部署到 Cloudflare Pages
npm run deploy
```

**部署步骤：**
1. 运行 `npm run build` 构建前端
2. 运行 `wrangler pages deploy ./dist` 部署到 Cloudflare
3. 自动上传静态资源和 Functions
4. 自动绑定 D1、KV、R2

**部署后：**
- 生产 URL：`https://intimome.pages.dev`
- 预览 URL：`https://<commit-hash>.intimome.pages.dev`

### Git 工作流

```bash
# 1. 提交代码
git add .
git commit -m "feat: your feature description"

# 2. 推送到 GitHub
git push origin main

# 3. 部署（可选，也可以通过 Cloudflare 自动部署）
npm run deploy
```

---

## 关键配置

### wrangler.toml

```toml
name = "intimome"
compatibility_date = "2024-09-23"
pages_build_output_dir = "./dist"

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "intimome-db"
database_id = "5c9d987e-3add-45d3-a02c-260b484bc915"

# KV 存储（Sessions）
[[kv_namespaces]]
binding = "SESSIONS"
id = "e8bef1cc9d4040d5846d11cc165a592e"

# R2 存储（Backups）
[[r2_buckets]]
binding = "BACKUPS"
bucket_name = "intimome-backups"
```

### vite.config.ts

**关键配置：**
- **开发代理**：`/api` → `http://localhost:8788`
- **代码分割**：React、Recharts、Lucide 独立 chunk
- **压缩**：Terser（生产环境移除 console）

### package.json Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（端口 3000） |
| `npm run pages:dev` | 启动 Cloudflare Workers 本地服务器 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run deploy` | 构建并部署到 Cloudflare Pages |
| `npm run preview` | 预览生产构建 |

---

## 常见问题

### Q1: 如何添加新的 API 端点？

在 `functions/api/` 目录下创建新文件：

```typescript
// functions/api/example.ts
export async function onRequest(context) {
  const { request, env } = context;
  
  // 访问 D1 数据库
  const db = env.DB;
  
  // 访问 KV
  const sessions = env.SESSIONS;
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

访问：`/api/example`

### Q2: 如何修改数据库 Schema？

1. 修改 `schema.sql`
2. 创建迁移文件到 `migrations/`
3. 本地应用：
   ```bash
   npx wrangler d1 execute intimome-db --local --file=./migrations/001_add_column.sql
   ```
4. 生产应用：
   ```bash
   npx wrangler d1 execute intimome-db --remote --file=./migrations/001_add_column.sql
   ```

### Q3: 如何调试 Workers？

```bash
# 查看 Workers 日志
wrangler pages deployment tail
```

### Q4: iOS Safari 触觉反馈不工作？

**解决方案：**
- 必须使用 `<label>` 包裹 `<input type="checkbox" switch>`
- 点击 `<label>` 元素（不是 `<input>`）
- 参考：`components/BottomNav.tsx` 中的实现

### Q5: 长按后误触发短按怎么办？

**已实现的解决方案：**
- 使用 `isLongPressRef` 标志位防止误触发
- 短按阈值设为 80%（480ms）而非 100%（600ms）
- 添加 10px 移动容差检测

---

## 环境变量

### 开发环境（.dev.vars）

```bash
OPENROUTER_API_KEY=sk-or-xxx
OPENROUTER_MODEL=openai/gpt-4o-mini
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
BACKUP_SECRET=your-secret-key
```

### 生产环境

在 Cloudflare Dashboard 设置：
- Pages → intimome → Settings → Environment variables

---

## 性能优化

### 已实现的优化

1. **代码分割**
   - React vendor chunk (32KB)
   - Recharts chunk (398KB)
   - Lucide icons chunk (10KB)

2. **压缩优化**
   - Terser 压缩
   - 移除 console.log
   - Gzip 压缩

3. **CDN 加速**
   - Cloudflare 全球 CDN
   - 自动缓存静态资源

### 性能指标

- 首次加载：< 2s
- 交互延迟：< 100ms
- Lighthouse 分数：> 90

---

## 安全性

1. **认证**：Google OAuth + Session (KV)
2. **API 保护**：所有敏感 API 需要登录
3. **备份保护**：需要 Bearer Token
4. **HTTPS**：Cloudflare 强制 HTTPS

---

## 备份策略

- **自动备份**：通过外部 Cron 调用 `/api/backup`
- **存储位置**：Cloudflare R2
- **备份内容**：完整 D1 数据库导出

---

## 更新日志

### 2026-01-07
- ✅ 优化长按/短按手势识别
- ✅ 修复 iOS Safari 触觉反馈
- ✅ 添加移动容差检测（10px）
- ✅ 创建项目核心文档

---

## 联系方式

- GitHub: https://github.com/poer2023/Intimome
- 部署: https://intimome.pages.dev

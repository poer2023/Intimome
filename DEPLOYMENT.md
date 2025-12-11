# IntimDiary - Cloudflare 部署指南

## 架构概览

```
Frontend (React/Vite) → Cloudflare Pages
Backend API           → Cloudflare Workers (Functions)
Database              → Cloudflare D1 (SQLite)
```

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. 创建 D1 数据库

```bash
# 创建数据库
npx wrangler d1 create intimome-db

# 复制输出的 database_id 到 wrangler.toml
```

更新 `wrangler.toml` 中的 `database_id`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "intimome-db"
database_id = "your-actual-database-id"
```

### 3. 初始化数据库 Schema

```bash
# 生产环境
npx wrangler d1 execute intimome-db --remote --file=./schema.sql
```

### 4. 设置环境变量

在 Cloudflare Dashboard 中设置：
- `GEMINI_API_KEY` - 你的 Gemini API 密钥

路径：Pages → 你的项目 → Settings → Environment variables

### 5. 部署

```bash
# 构建并部署
npm run deploy
```

## 本地开发

### 使用 Express (旧方式)

创建 `.env` 文件：
```
GEMINI_API_KEY=your-api-key
VITE_API_BASE=http://localhost:4000
```

```bash
npm run dev:full  # 同时启动前端和后端
```

### 使用 Cloudflare Workers (新方式)

创建 `.dev.vars` 文件：
```
GEMINI_API_KEY=your-api-key
```

```bash
# 初始化本地 D1
npx wrangler d1 execute intimome-db --local --file=./schema.sql

# 构建前端
npm run build

# 启动本地 Pages 开发服务器
npm run pages:dev
```

## 监控

访问 [Cloudflare Dashboard](https://dash.cloudflare.com):

- **Pages Analytics**: 查看访问统计
- **Workers Analytics**: 查看 API 调用量
- **D1 Dashboard**: 查看数据库使用情况
- **Logs**: 实时查看错误日志

## 项目结构

```
intimome/
├── functions/              # Cloudflare Workers
│   ├── api/
│   │   ├── auth/
│   │   │   └── [[path]].ts # 登录/注册
│   │   └── insights.ts     # AI 分析
│   └── tsconfig.json
├── server/                 # (旧) Express 后端 - 可删除
├── wrangler.toml           # Cloudflare 配置
├── schema.sql              # D1 数据库 Schema
└── .dev.vars.example       # 环境变量模板
```

## 费用

| 服务 | 免费额度 |
|------|----------|
| Pages | 无限请求 |
| Workers | 10万次/天 |
| D1 | 5GB 存储 |

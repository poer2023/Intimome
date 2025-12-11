# IntimDiary

私密日记应用，部署在 Cloudflare。

## 线上地址

**生产环境**: https://intimome.pages.dev

## 技术栈

- **前端**: React + Vite + TypeScript
- **后端**: Cloudflare Workers (Pages Functions)
- **数据库**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages

## 部署信息

| 服务 | 平台 | 控制台 |
|------|------|--------|
| 前端 + API | Cloudflare Pages | [Dashboard](https://dash.cloudflare.com) → Workers & Pages → intimome |
| 数据库 | Cloudflare D1 | [Dashboard](https://dash.cloudflare.com) → Storage & Databases → D1 → intimome-db |

## 重新部署

```bash
npm run deploy
```

## 本地开发

```bash
npm install
npm run dev
```

## 数据库操作

```bash
# 查看表结构
npx wrangler d1 execute intimome-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"

# 查看用户数
npx wrangler d1 execute intimome-db --remote --command "SELECT COUNT(*) FROM users;"
```

# IntimDiary - AI Assistant Context

> **🤖 Instructions**: This file is automatically read by Antigravity/Gemini AI. Always consult this document before starting any task.

## 🚨 Critical Rules for AI

1. **禁止自动提交/部署** — 不要运行 `git commit`、`git push` 或 `npm run deploy`，除非用户明确指示
2. **最小改动原则** — 修改代码时优先最小改动，不做无关重构
3. **先说明再改动** — 修改前先告知改动范围和影响面
4. **使用设计 Token** — UI 修改必须使用下方定义的设计 Token，禁止魔术数值

---

## 📋 Quick Reference

### 常用命令

```bash
npm run dev        # 启动 Vite 开发服务器 (localhost:3000)
npm run build      # 构建生产版本
npm run pages:dev  # 启动完整 Cloudflare 本地环境 (localhost:8788)
npm run deploy     # 部署到 Cloudflare Pages (需用户确认)
```

### 类型检查

```bash
npx tsc --noEmit   # 验证 TypeScript 类型
```

---

## 🏗️ Architecture Overview

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + TailwindCSS 4
- Backend: Cloudflare Workers (Pages Functions)
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2 (backups), KV (sessions)

**Project Structure:**
```
/components     → React UI components
/pages          → Page-level components
/services       → API client services
/functions/api  → Cloudflare Workers API handlers
/styles         → CSS files (main.css)
```

---

## 🎨 UI Design Tokens

> **IMPORTANT**: All UI code MUST use these tokens. No magic numbers.

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-[24px]` | 24px | Cards, containers, large images |
| `rounded-[32px]` | 32px | Modals, main panels |
| `rounded-[20px]` | 20px | Primary buttons |
| `rounded-[16px]` | 16px | Input fields, secondary buttons |

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `shadow-subtle` | `0 1px 2px 0 rgba(0,0,0,0.05)` | List items |
| `shadow-elevation` | `0 10px 40px -10px rgba(0,0,0,0.05)` | Cards |
| `shadow-glow` | `0 0 20px rgba(244,63,94,0.3)` | Highlights |

### Colors
- Page background: `#fafafa` (`bg-slate-50`)
- Brand: `rose-500`
- Text: `slate-900` (primary), `slate-500` (secondary)

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Main app entry, routing |
| `components/BottomNav.tsx` | Bottom navigation with long-press gesture |
| `services/logsService.ts` | Log API client |
| `functions/api/logs.ts` | Log CRUD API handler |
| `styles/main.css` | Global styles and CSS variables |
| `wrangler.toml` | Cloudflare configuration |
| `PROJECT.md` | Detailed project documentation |
| `DEPLOYMENT.md` | Deployment guide |

---

## ⚠️ Known Issues & Solutions

### iOS Safari Haptic Feedback
- Must wrap `<input type="checkbox" switch>` in `<label>`
- Click on `<label>` element, not `<input>`
- Reference: `components/BottomNav.tsx`

### Long Press vs Short Press
- Use `isLongPressRef` flag to prevent false triggers
- Short press threshold: 480ms (80% of 600ms)
- Movement tolerance: 10px

---

## 🔗 Related Documentation

- [PROJECT.md](./PROJECT.md) — Full project details
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment instructions

---

*Last updated: 2026-01-07*

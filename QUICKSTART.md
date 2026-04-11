# ITMAGNET Frontend - Quick Start Guide

## What You Just Got

A **production-ready Next.js SaaS frontend** for an AI-first ticket management platform. This is **not** a simple CRUD app—it's designed to feel like Zendesk, Freshdesk, or Intercom with AI woven into every interaction.

## 🎯 Core Capabilities

### For Customers
- Create support tickets with AI auto-categorization
- See real-time priority classification
- Chat-style comments thread
- Track ticket status

### For Support Agents
- Live ticket queue with filtering & sorting
- AI-powered response suggestions (RAG-based)
- Ticket summarization at a glance
- Semantic search to find similar resolved tickets
- Confidence scoring on AI suggestions

### For Admins
- Dashboard analytics (tickets, resolution time, categories)
- Monitor high-risk tickets
- Assign tickets to agents
- Track AI performance (confidence, accuracy)
- Team & integration settings

## 🚀 Get Running in 2 Minutes

```bash
# 1. Install & run
npm install
npm run dev

# 2. Visit http://localhost:3000

# 3. Create `.env.local`
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api" > .env.local

# 4. Login with test credentials (from backend)
```

## 📂 What's Included

| Folder | Files | Purpose |
|--------|-------|---------|
| `app/` | 11 pages | All routes (dashboard, tickets, auth, search, AI, settings) |
| `components/` | 17 components | UI primitives + domain-specific (tickets, AI, search) |
| `hooks/` | 4 hooks | Data fetching (React Query) + state (Zustand) |
| `lib/` | 3 files | API client, Axios config, utilities |
| `types/` | 1 file | Shared TypeScript interfaces |

**Total**: 40+ production-grade source files, fully typed.

## 🔌 API Integration Points

The frontend expects these backend endpoints:

### Authentication
- `POST /auth/login` → Returns `{ data: { user, accessToken, refreshToken } }`
- `POST /auth/register` → Same format
- `GET /auth/me` → Current user
- `POST /auth/logout`

### Tickets
- `GET /tickets?page=1&limit=20&status=open&priority=high` → Lists
- `POST /tickets` → Create
- `GET /tickets/:id` → Detail
- `PATCH /tickets/:id` → Update
- `GET /tickets/stats` → Analytics

### Comments
- `GET /tickets/:ticketId/comments`
- `POST /tickets/:ticketId/comments`

### AI Features
- `POST /ai/classify` → Auto-detect category/priority
- `POST /ai/summarize` → Quick overview
- `POST /ai/suggest-reply` → RAG-based response
- `POST /ai/search` → Semantic search

## 🎨 Design System

- **Colors**: Brand indigo (`#4f46e5`), Slate grays, Status indicators
- **Typography**: System fonts (Inter via Tailwind)
- **Spacing**: 4px base unit (Tailwind's default)
- **Components**: 5 UI primitives + 12 domain-specific
- **Responsive**: Mobile-first, works on all screen sizes

## 💾 Data Flow

```
User Action
    ↓
React Component
    ↓
React Query Hook (useTickets, useAnalytics, etc.)
    ↓
API Client (lib/axios.ts)
    ↓
Backend API
    ↓
Response → Query Cache → Component Re-render
```

## 🔒 Authentication

```typescript
// Stored in Zustand + localStorage
const { user, accessToken, setToken, logout } = useAuthStore();

// Automatically passed to all API requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itmagnet_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## 📱 Pages at a Glance

| Route | Purpose | Key Feature |
|-------|---------|------------|
| `/` | Landing | Hero + CTA |
| `/auth/login` | Sign in | JWT flow |
| `/auth/register` | Sign up | Role assignment |
| `/dashboard` | Main hub | Live analytics + AI insights |
| `/tickets` | Queue | Paginated list with filters |
| `/tickets/[id]` | Detail | Full AI copilot + comments |
| `/search` | Discovery | Semantic search (RAG) |
| `/ai` | Copilot demo | AI suggestion sandbox |
| `/settings` | Admin | User & integration mgmt |

## 🤖 AI Integration Points

The frontend calls these AI endpoints naturally:

1. **Classify on ticket creation**
   - User fills title/description
   - Frontend calls `/ai/classify` (no UI wait)
   - Category & priority pre-populated

2. **Summarize on detail view**
   - Agent opens ticket
   - AI summary loads in sidebar

3. **Suggest reply in copilot**
   - Agent clicks "Suggest reply"
   - RAG search finds similar resolved tickets
   - AI generates response + confidence score

4. **Search with semantic meaning**
   - Search bar accepts natural language
   - `/ai/search` returns contextual results

## 🛠️ Extending the Frontend

### Add a New Ticket Status
1. Update `types/index.ts` - Add to `Ticket['status']` union
2. Update `lib/api.ts` - If backend needs new query params
3. Update components using status (badge colors, filtering)

### Add a New AI Feature
1. Add to `aiApi` in `lib/api.ts`
2. Create hook in `hooks/useAi.ts`
3. Use in component
4. Display result in UI

### Add a New Page
```typescript
// app/my-feature/page.tsx
'use client';
import { DashboardShell } from '@/components/layouts/dashboard-shell';

export default function MyFeaturePage() {
  return (
    <DashboardShell activePath="/my-feature">
      {/* Your content */}
    </DashboardShell>
  );
}
```

## 🚢 Deployment Checklist

- [ ] Backend API running and accessible
- [ ] `.env.local` configured with correct API URL
- [ ] `npm run build` passes all checks
- [ ] Test auth flow (login/register)
- [ ] Test ticket creation with AI classification
- [ ] Verify AI endpoints respond correctly
- [ ] Test on mobile (responsive)
- [ ] Check browser console for errors
- [ ] Deploy to Vercel or Docker

## 📊 Performance Metrics

- **Bundle Size**: ~87 KB First Load JS (shared)
- **Route Sizes**: 596 B - 3.5 KB per page
- **Caching**: React Query stale-time configurable
- **Image Optimization**: `next/image` ready (add images in `public/`)

## 🔍 Debugging

### Check API Connection
```typescript
// In browser console
import { api } from '@/lib/axios';
api.get('/auth/me').then(r => console.log(r.data))
```

### See Query State
```typescript
// React Query DevTools (optional, add package)
npm install @tanstack/react-query-devtools
// Import in components/providers.tsx
```

### View localStorage
```javascript
localStorage.getItem('itmagnet_access_token')
```

## 📚 File Navigation Tips

- **Need to modify API call?** → `lib/api.ts`
- **Add data fetching hook?** → `hooks/useTickets.ts` or `hooks/useAi.ts`
- **Modify UI component?** → `components/ui/` or domain folder
- **Add new page?** → `app/` with matching route
- **Update types?** → `types/index.ts`
- **Change styling?** → `tailwind.config.ts` or `app/globals.css`

## 🎓 Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token in localStorage, re-login |
| CORS errors | Verify backend has `Access-Control-Allow-Origin` |
| "Cannot find module" | Run `npm install`, verify imports |
| Mutation doesn't work | Check method (POST vs PATCH), auth token |
| Build fails | Run `npm run build` locally, check TypeScript errors |
| Styling looks broken | Clear `.next` folder, restart dev server |

## 🎯 Next Steps

1. **Set up backend** if not already running
2. **Configure API URL** in `.env.local`
3. **Test auth flow** (login/register)
4. **Create a test ticket** with AI classification
5. **Try AI copilot** on ticket detail page
6. **Explore the codebase** - it's well-organized!
7. **Deploy to production** when ready

---

**You're ready to build the future of customer support with AI! 🚀**

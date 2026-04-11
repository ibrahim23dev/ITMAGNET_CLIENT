# ITMAGNET Frontend

Production-grade AI-first Customer Ticket Management SaaS frontend built with Next.js 14, TypeScript, Tailwind CSS, and modern best practices.

## 🚀 Features

- **AI-First UX**: Every interaction powered by AI insights
- **JWT Authentication**: Secure role-based access (Admin, Agent, Customer)
- **Real-time Dashboard**: Live ticket analytics and AI insights
- **Intelligent Ticket Management**: Auto-classification, priority detection, RAG-based search
- **AI Copilot Panel**: Summarize tickets, generate replies, get smart recommendations
- **Semantic Search**: AI-powered ticket discovery using natural language
- **Comments System**: Chat-style threading with AI-suggested responses
- **Admin Console**: User management, ticket assignment, AI performance tracking
- **Responsive Design**: Premium SaaS UI with dark/light mode ready
- **Production Ready**: Optimized builds, type-safe, fully deployable

## 📋 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Server state & caching
- **Axios** - HTTP client with interceptors
- **Lucide Icons** - Beautiful icon library
- **Recharts** - Analytics visualization (included for future use)

## 🔧 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running at `http://localhost:5000/api`

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🌍 Environment Configuration

Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 📁 Project Structure

```
ITMAGNET CLIENT/
├── app/                       # Next.js App Router pages
│   ├── auth/                  # Authentication pages (login, register)
│   ├── dashboard/             # Main dashboard with analytics
│   ├── tickets/               # Ticket list & detail pages
│   ├── search/                # AI semantic search page
│   ├── ai/                    # AI Copilot page
│   ├── settings/              # Team & integration settings
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Global styles & Tailwind
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── tabs.tsx
│   ├── layouts/               # Page layouts
│   │   └── dashboard-shell.tsx
│   ├── navigation/            # Navigation components
│   │   └── sidebar.tsx
│   ├── analytics/             # Analytics components
│   │   └── overview-card.tsx
│   ├── tickets/               # Ticket components
│   │   └── ticket-card.tsx
│   ├── ai/                    # AI features
│   │   └── assistant-panel.tsx
│   ├── search/                # Search components
│   │   └── semantic-search.tsx
│   ├── comments/              # Comment threads
│   │   └── comment-thread.tsx
│   └── providers.tsx          # React Query provider
├── hooks/                     # React hooks for data fetching
│   ├── useAuthStore.ts        # Zustand auth store
│   ├── useTickets.ts          # Ticket queries & mutations
│   ├── useAnalytics.ts        # Analytics queries
│   └── useAi.ts               # AI features hooks
├── lib/
│   ├── axios.ts               # Axios client with interceptors
│   ├── api.ts                 # API endpoints facade
│   └── utils.ts               # Utility functions
├── types/                     # TypeScript types
│   └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.mjs
```

## 🔐 Authentication Flow

1. User registers or logs in at `/auth/register` or `/auth/login`
2. Backend returns JWT tokens (access + refresh)
3. Tokens stored in localStorage (production: use httpOnly cookies)
4. Axios interceptor automatically adds `Authorization: Bearer <token>` header
5. On 401, app should trigger re-authentication

### Authenticaton Endpoints
- **POST** `/auth/register` - Create account
- **POST** `/auth/login` - Get JWT tokens
- **GET** `/auth/me` - Current user profile
- **POST** `/auth/logout` - Invalidate tokens

## 🎫 Ticket Management

### Key Pages
- `/tickets` - Ticket queue with filters
- `/tickets/[id]` - Detail view with AI copilot + comments
- `/dashboard` - Real-time analytics & high-priority alerts
- `/search` - Semantic ticket discovery

### Ticket Lifecycle
1. Customer creates ticket via form
2. AI auto-classifies category & priority (real-time, RAG-assisted)
3. Agent reviews & assigns
4. AI suggests responses from similar resolved tickets
5. Agent sends response
6. Ticket status updates (open → resolved → closed)

## 🤖 AI Features

### AI Endpoints Used
- **POST** `/ai/classify` - Auto-detect category & priority
- **POST** `/ai/summarize` - Quick ticket overview
- **POST** `/ai/suggest-reply` - RAG-based response suggestions
- **POST** `/ai/search` - Semantic similarity search
- **POST** `/ai/agent-workflow` - Full workflow (summarize + search + suggest)

### Assistant Panel
The AI copilot sits on the ticket detail page and provides:
- Ticket summary
- Tone selection (friendly, professional, concise)
- RAG context toggle
- AI-generated reply suggestions with confidence score

## 📊 Analytics Dashboard

Real-time insights including:
- Total tickets, open tickets, high-priority count
- Average resolution time
- Top issue categories
- High-risk ticket alerts
- Recommended agent actions

## 🔄 State Management

### Zustand Auth Store
```typescript
const { user, accessToken, setUser, setToken, logout } = useAuthStore();
```

### React Query (Data Fetching)
- Automatic caching & stale-time management
- Built-in loading/error states
- Query invalidation on mutations
- Optimistic updates ready

```typescript
const tickets = useTicketsQuery({ page: 1, limit: 12 });
const { mutate } = useCreateTicket();
```

## 🎨 Styling

- **Tailwind CSS** v3.4 for utility classes
- Custom theme: brand colors, shadow utilities
- Fully responsive (mobile-first design)
- Dark mode ready (extend tailwind.config.ts)

### Color Palette
- Brand Primary: `#4f46e5` (Indigo)
- Neutral backgrounds: Slate shades
- Status colors: Green (success), Red (danger), Amber (warning)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npm start
```

Or connect GitHub repo to Vercel for automatic deployments.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)
- Set `NEXT_PUBLIC_API_BASE_URL` to your production API
- Use httpOnly cookies instead of localStorage for tokens
- Enable CORS on backend for your domain

## 📝 API Integration Checklist

- [ ] Backend running and accessible
- [ ] `/auth/login` returns JWT tokens
- [ ] `/tickets` endpoints working with pagination
- [ ] `/ai/*` endpoints operational
- [ ] WebSocket support (optional, for real-time updates)
- [ ] Comments endpoints fully implemented
- [ ] Error responses match expected format

## 🛠️ Development

### Start Dev Server
```bash
npm run dev
```

### Type Checking
```bash
npx tsc --noEmit
```

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🔌 API Client

The Axios client is configured in `lib/axios.ts` with:
- Base URL from `NEXT_PUBLIC_API_BASE_URL`
- JWT token injection on every request
- Error handling ready for middleware

Extend with response interceptors for error handling:
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle auth failure
    }
    return Promise.reject(error);
  }
);
```

## 📱 Future Enhancements

- [ ] WebSocket for real-time ticket updates
- [ ] Notification system (toast + push)
- [ ] Activity timeline (who did what, when)
- [ ] Role-specific dashboards (admin vs agent vs customer)
- [ ] Export tickets to CSV/PDF
- [ ] Bulk operations (assign, close, tag)
- [ ] API rate limiting UI
- [ ] A/B testing framework for AI suggestions

## 🏆 Best Practices Implemented

✅ Type-safe API layer
✅ Client-side caching with React Query
✅ Optimistic UI updates ready
✅ Error boundaries (add at page level as needed)
✅ Accessibility attributes (`role`, `aria-*`)
✅ Mobile-responsive design
✅ SEO metadata (per page via Metadata API)
✅ Code splitting (automatic per route)
✅ Image optimization (use `next/image`)
✅ Environment isolation

## 📖 Documentation

- API Docs: See `../ITMAGNET API Documentation.md` (backend repo)
- Tailwind: https://tailwindcss.com/docs
- React Query: https://tanstack.com/query
- Next.js: https://nextjs.org/docs

## 📞 Support

For issues or questions:
1. Check the backend API is running
2. Verify `.env.local` is set correctly
3. Check browser console for network errors
4. Review API response structure in network tab

## 📄 License

Internal use only. ITMAGNET SaaS Platform.

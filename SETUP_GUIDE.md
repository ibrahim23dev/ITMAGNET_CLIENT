# Project Setup & Deployment Guide

## ✅ Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running at configured URL

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install
```

This will install:
- **Next.js 15**: React framework with app router
- **React Query 5.35**: Data fetching and caching
- **Axios 1.7.2**: HTTP client with interceptors
- **Zustand 4.5**: Lightweight state management
- **Tailwind CSS 3.4**: Utility-first CSS
- **Recharts 2.12**: React charting library
- **Lucide React 0.599**: Icon library

### 2. Environment Setup

Create `.env.local` from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

Update with your backend URL:
```env
NEXT_PUBLIC_API_BASE_URL=http://YOUR_BACKEND_URL/api
```

## 🔧 Development

### Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### Features Available:
- Hot module reloading
- Debug logging enabled
- API request/response logging
- Auto token refresh (if configured)

### File Structure
```
app/
├── dashboard/          # Main dashboard
├── auth/              # Login/register
├── tickets/           # Ticket management
├── ai/                # AI features
└── layout.tsx         # Root layout

components/
├── dashboard/         # Dashboard components
├── tickets/          # Ticket components
├── ui/               # Reusable UI components
└── layouts/          # Layout wrappers

hooks/
├── useAuthStore.ts   # Auth state
├── useAuthApi.ts     # Auth queries
├── useTickets.ts     # Ticket queries
└── useApiError.ts    # Error handling

lib/
├── api.ts            # API endpoints
├── api-service.ts    # API wrapper
├── axios.ts          # HTTP client
├── api-utils.ts      # Utilities (rate limit, throttle)
├── error-handler.ts  # Error parsing
└── cookies.ts        # Cookie management

types/
└── index.ts          # TypeScript types
```

## 🔐 Authentication Flow

1. **Login**: User enters credentials → Token stored → Redirect to dashboard
2. **Token Refresh**: Auto refresh before expiry (every 5 minutes by default)
3. **Protected Routes**: Middleware checks token → Redirect if missing
4. **Logout**: Clear tokens → Redirect to login

## 📱 API Integration Checklist

- ✅ **Token Management**: Automatic storage and refresh
- ✅ **Error Handling**: Centralized error parsing and recovery
- ✅ **Rate Limiting**: Built-in request throttling
- ✅ **Caching**: React Query with configurable TTL
- ✅ **Retries**: Exponential backoff for transient errors
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: Lazy loading, code splitting
- ✅ **Security**: CORS, CSRF protection ready

## 🏗️ Building for Production

### Build Application
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Optimizations Applied:
- Tree shaking (unused code removed)
- Code splitting (route-based)
- Image optimization
- CSS minification
- JavaScript minification

### Production Environment Variables
Create `.env.production` or set in hosting platform:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_DEBUG=false
NODE_ENV=production
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🚨 Common Issues & Solutions

### Issue: API calls return 401 (Unauthorized)
**Solution**: 
- Check if backend requires Bearer token format
- Verify token is stored correctly in cookies/localStorage
- Check token expiration and refresh logic

### Issue: CORS errors
**Solution**:
- Backend must allow frontend origin in CORS config
- Check API_BASE_URL matches backend domain
- Verify withCredentials is enabled

### Issue: Tokens not persisting
**Solution**:
- Check if cookies are blocked by browser
- Verify secure flag not set on localhost (use SameSite=Lax)
- Check localStorage access permissions

### Issue: Slow API responses
**Solution**:
- Check React Query cache settings
- Verify backend performance
- Monitor network in DevTools
- Use React Query DevTools for debugging

## 🔍 Monitoring & Debugging

### React Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to layout.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

### Console Logging
Development mode logs all API calls:
```
[API Success] GET /auth/me
[API Error] POST /tickets { status: 400, data: {...} }
```

### Network Monitoring
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Check request/response headers and body

## 📊 Performance Metrics

Target metrics for optimal performance:
- API response time: < 500ms
- First contentful paint: < 2s
- Time to interactive: < 4s
- Core web vitals: Good (LCP < 2.5s, FID < 100ms)

## 🔄 Deployment Steps

### Deploying to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploying to Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Environment Variables for Hosting
- `NEXT_PUBLIC_API_BASE_URL`: Your API endpoint
- `NEXT_PUBLIC_DEBUG`: false (for production)
- `NODE_ENV`: production

## 📝 Code Quality

### Run Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## 📞 Support

For API integration issues:
1. Check `API_INTEGRATION_GUIDE.md`
2. Review error logs in browser console
3. Check React Query DevTools
4. Verify backend API is running
5. Check environment variables are correct

---

**Last Updated**: April 2026
**Version**: 1.0.0 (Updated with Full API Integration)

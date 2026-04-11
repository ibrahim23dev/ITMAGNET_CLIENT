# 🛠️ Error Handling & Troubleshooting Guide

**Last Updated:** April 11, 2026  
**Version:** 1.0.0  
**Status:** Production-Ready

---

## 📋 Table of Contents

1. [Common Runtime Errors](#common-runtime-errors)
2. [API Integration Issues](#api-integration-issues)
3. [Authentication Errors](#authentication-errors)
4. [Data Fetching Problems](#data-fetching-problems)
5. [Build & Compilation Errors](#build--compilation-errors)
6. [Debugging Tools & Commands](#debugging-tools--commands)
7. [Error Prevention Patterns](#error-prevention-patterns)

---

## Common Runtime Errors

### ❌ "Cannot read properties of undefined (reading 'map')"

**Cause:** Data from React Query is undefined, attempting to map over it without checking.

**Example Error:**
```
TypeError: Cannot read properties of undefined (reading 'map')
at location app/dashboard/page.tsx:33
{tickets.data?.tickets.map(...)}
```

**Solution:**
```tsx
// ✗ WRONG - No null check
{tickets.data?.tickets.map(ticket => <TicketCard ticket={ticket} />)}

// ✓ CORRECT - Check if data exists
{tickets.data && tickets.data.tickets.length > 0 ? (
  tickets.data.tickets.map(ticket => <TicketCard ticket={ticket} />)
) : (
  <p>No tickets available</p>
)}

// ✓ EVEN BETTER - Handle loading/error states
{tickets.isLoading ? (
  <LoadingSpinner />
) : tickets.error ? (
  <ErrorMessage error={tickets.error} />
) : tickets.data?.tickets && tickets.data.tickets.length > 0 ? (
  tickets.data.tickets.map(ticket => <TicketCard ticket={ticket} />)
) : (
  <EmptyState />
)}
```

**Prevention:**
- Always check for `isLoading` state first
- Always handle `error` state with user-friendly message
- Verify data structure before mapping
- Use TypeScript strict mode to catch type errors

---

### ❌ "Property 'X' does not exist on type '{}'"

**Cause:** Response data structure doesn't match TypeScript interface, typically from missing response unwrapping.

**Example:**
```
Type error: Property 'tickets' does not exist on type '{}'
```

**Root Cause:**
The API response structure is:
```typescript
// Axios returns:
{ data: ApiResponse<T> }

// ApiResponse is:
{ success: boolean, data: T }

// So TicketListResponse response is:
{ data: { success: true, data: { tickets: [...], meta: {...} } } }
```

**Solution - Proper Unwrapping:**

```typescript
// ✗ WRONG - Only unwraps one level
const response = await ticketApi.list(params);
return response.data;  // This is ApiResponse, not TicketListResponse!

// ✓ CORRECT - Unwraps both levels
const response = await ticketApi.list(params);
return response.data.data;  // This is TicketListResponse

// ✓ BETTER - With validation
const response = await ticketApi.list(params);
const data = response.data?.data;
if (!data || !Array.isArray(data.tickets)) {
  throw new Error('Invalid response structure: expected tickets array');
}
return data;
```

**In React Query Hooks:**

```typescript
export const useTicketsQuery = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const response = await ticketApi.list(params);
      
      // ✓ Proper validation
      const data = response.data?.data;
      if (!data || !Array.isArray(data.tickets)) {
        throw new Error('Invalid response structure');
      }
      return data;  // Now safely typed as TicketListResponse
    },
  });
};
```

---

### ❌ "401 Unauthorized - Token Expired"

**Cause:** JWT token is expired or missing.

**Solution:**

```typescript
// Check localStorage
localStorage.getItem('itmagnet_access_token')

// Token is automatically injected by axios interceptor in lib/axios.ts
// If 401 is received, token is either:
// 1. Not stored (user didn't login)
// 2. Expired (user needs to login again)
// 3. Invalid due to server restart

// Automatic handling (from lib/axios.ts):
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem('itmagnet_access_token');
      // Optional: redirect to login
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

**Prevention:**
- Always login before accessing protected routes
- Store valid JWT token in localStorage
- Implement token refresh logic (future enhancement)
- Use httpOnly cookies for production (more secure)

---

## API Integration Issues

### ❌ "CORS error - No 'Access-Control-Allow-Origin' header"

**Cause:** Backend doesn't allow requests from frontend origin.

**Solution - Backend:**
```typescript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Solution - Frontend (Testing):**
```typescript
// In .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

// Verify it's reached correctly
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
```

**Debug:**
```javascript
// In browser console
// Check what origin is being sent
fetch('http://localhost:5000/api/tickets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('itmagnet_access_token')}`
  }
}).then(r => console.log(r)).catch(e => console.error(e));
```

---

### ❌ "Network request timeout after 15000ms"

**Cause:** Backend is too slow or unreachable, axios timeout is 15 seconds.

**Solution:**

```typescript
// lib/axios.ts has timeout: 15000
// To increase timeout:
const api = axios.create({
  timeout: 30000,  // 30 seconds instead of 15
});

// Or for specific endpoints:
api.get('/slow-endpoint', { timeout: 60000 })
```

**Debugging:**
```javascript
// Check if backend is responding
curl -i http://localhost:5000/api/health

// Check network tab in DevTools (F12)
// Look for slow requests, large payloads, or failed connections
```

---

### ❌ "Response has invalid structure"

**Cause:** Backend is returning data in unexpected format.

**Solution - Validation:**

```typescript
// All API endpoints now validate responses:
export const ticketApi = {
  list: (params?) => 
    api.get<ApiResponse<TicketListResponse>>('/tickets', { params })
      .then(res => {
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to fetch');
        }
        return res;
      }),
};

// Usage in hook:
const response = await ticketApi.list(params);
const data = response.data?.data;  // Safely unwrapped
```

---

## Authentication Errors

### ❌ "Login fails with 400 Bad Request"

**Cause:** Invalid email/password format.

**Check:**

```typescript
// Backend expects:
interface AuthPayload {
  email: string;
  password: string;
  name?: string;  // Required for registration only
}

// Valid request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Solution:**
```tsx
// Add validation before sending
const handleLogin = async (email: string, password: string) => {
  if (!email || !email.includes('@')) {
    setError('Invalid email format');
    return;
  }
  if (password.length < 8) {
    setError('Password too short');
    return;
  }
  
  try {
    await login({ email, password });
  } catch (error) {
    setError(error.message);
  }
};
```

---

### ❌ "Token is not being sent with requests"

**Cause:** Token not stored properly or interceptor not working.

**Debug:**
```javascript
// 1. Check if token is stored
console.log(localStorage.getItem('itmagnet_access_token'));

// 2. Check if it's being sent (DevTools → Network tab)
// Look for Authorization header in request

// 3. Check axios interceptor
// If token is undefined, login didn't save it

// 4. Verify login response saves token
const response = await authApi.login({ email, password });
localStorage.setItem('itmagnet_access_token', response.data.data.accessToken);
```

---

## Data Fetching Problems

### ❌ "Query infinitely loops/refetches"

**Cause:** Query dependencies not properly configured.

**Solution:**

```typescript
// ✗ WRONG - Will refetch on every render
useQuery({
  queryKey: ['tickets'],  // ← Missing params
  queryFn: async () => ticketApi.list(params),
});

// ✓ CORRECT - Includes dependencies
useQuery({
  queryKey: ['tickets', params],  // ← Includes params
  queryFn: async () => ticketApi.list(params),
});

// ✓ WITH CACHING - Reduces refetches
useQuery({
  queryKey: ['tickets', params],
  queryFn: async () => ticketApi.list(params),
  staleTime: 30000,      // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
});
```

---

### ❌ "Mutation doesn't update UI after success"

**Cause:** React Query cache not invalidated after mutation.

**Solution:**

```typescript
// ✓ Invalidate cache after mutation
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => ticketApi.create(payload),
    onSuccess: () => {
      // Invalidate tickets list to refetch
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Usage:
const createMutation = useCreateTicket();
const handleCreate = async () => {
  await createMutation.mutateAsync({ title: 'New Ticket' });
  // UI automatically updates after cache invalidation
};
```

---

## Build & Compilation Errors

### ❌ "Failed to compile - Syntax error"

**Cause:** JSX syntax error, usually unclosed tags or duplicate code.

**Solution:**
```tsx
// ✗ WRONG
<div>
  {items.map(item => <Item key={item.id} />)}
</div>
</div>  // Extra closing tag

// ✓ CORRECT
<div>
  {items.map(item => <Item key={item.id} />)}
</div>
```

**Fix:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

---

### ❌ "TypeScript type error - Property 'X' does not exist"

**Cause:** Type mismatch or missing null check.

**Solution:**

```tsx
// ✗ WRONG
const summary = data.summary;  // data might be undefined

// ✓ CORRECT
const summary = data?.summary || 'No summary';

// ✓ WITH TYPE GUARD
if (data && 'summary' in data) {
  const summary = data.summary;
}
```

---

### ❌ "npm install fails with peer dependency warnings"

**Solution:**
```bash
# Force legacy peer dependency resolution
npm install --legacy-peer-deps

# Or use yarn (handles dependencies better)
yarn install
```

---

## Debugging Tools & Commands

### 🔍 Development Debugging

**Enable Debug Logging:**

```typescript
// In lib/axios.ts, logging is automatic in development:
if (process.env.NODE_ENV === 'development') {
  console.debug('[API Request]', method, url, config);
  console.debug('[API Response]', method, url, status, data);
  console.error('[API Error]', { method, url, status, message, data });
}
```

**Check React Query DevTools:**

```bash
# Install and add DevTools
npm install @tanstack/react-query-devtools

# Add to your app (components/providers.tsx)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

### 🔍 Browser Console Debugging

```javascript
// Check current auth state
localStorage.getItem('itmagnet_access_token')

// Check API environment
process.env.NEXT_PUBLIC_API_BASE_URL

// Make test API call
fetch('http://localhost:5000/api/tickets', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('itmagnet_access_token')}`
  }
}).then(r => r.json()).then(console.log).catch(console.error)

// Check Zustand auth store
import { useAuthStore } from '@/hooks/useAuthStore'
const store = useAuthStore.getState()
console.log(store)  // Shows { user, accessToken, setUser, setToken, logout }
```

---

### 🔍 Build Debugging

```bash
# Check build output
npm run build

# See what files were changed
git status

# View TypeScript errors without building
npx tsc --noEmit

# Debug Next.js build
DEBUG=* npm run build

# Clean build
rm -rf .next node_modules
npm install
npm run build
```

---

### 🔍 Network Debugging

```bash
# Using curl to test API
curl -i -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Check if API is accessible
curl -i http://localhost:5000/api/health
```

---

## Error Prevention Patterns

### ✅ Pattern 1: Safe Data Access

```typescript
// Always use optional chaining + default values
const value = response?.data?.nested?.property ?? 'default';

// Or with null coalescing operator
const value = response?.data?.nested?.property || [];
```

### ✅ Pattern 2: Load & Error States

```tsx
{isLoading ? (
  <Skeleton />
) : error ? (
  <ErrorBoundary error={error} />
) : data ? (
  <Content data={data} />
) : (
  <EmptyState />
)}
```

### ✅ Pattern 3: Response Validation

```typescript
// Validate API responses before using
const response = await api.get('/resource');
if (!response.data?.success) {
  throw new Error(response.data?.message || 'Request failed');
}
const data = response.data.data;
if (!data || typeof data !== 'object') {
  throw new Error('Invalid data structure');
}
```

### ✅ Pattern 4: Error Boundaries

```tsx
// Create error boundaries for pages
'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Page Error:', error);
  }, [error]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Try again
      </button>
    </div>
  );
}
```

---

## 📞 Quick Reference

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `Cannot read properties of undefined (reading 'X')` | Null/undefined object | Add null check before access |
| `401 Unauthorized` | Missing/expired token | Login again |
| `CORS error` | Backend missing CORS headers | Fix backend CORS config |
| `Network request timeout` | Backend slow/down | Check backend, increase timeout |
| `Property 'X' does not exist` | Type mismatch | Fix data unwrapping/types |
| `React Query infinite loop` | Bad cache key | Include params in queryKey |
| `Mutation doesn't update UI` | Cache not invalidated | Add onSuccess with invalidateQueries |
| `Build fails with type error` | TypeScript error | Fix type annotations |

---

## 🎯 Next Steps

1. **Monitor errors** - Check browser console and DevTools
2. **Log API calls** - Verify requests/responses in Network tab
3. **Test locally** - Ensure backend is running on correct port
4. **Validate data** - Always check structure before using
5. **Handle states** - Show loading/error/empty states to users

---

**Need more help?** Check:
- [README.md](README.md) - Feature documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide

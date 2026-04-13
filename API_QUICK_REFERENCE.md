# API Quick Reference Guide

**Quick Lookup for Developers**

## 🔗 All Endpoints (Quick Summary)

### Auth Endpoints
```
POST   /auth/login              # Login with credentials
POST   /auth/register           # Create new account
GET    /auth/me                 # Get current user
POST   /auth/logout             # Logout
POST   /auth/refresh            # Refresh access token
GET    /auth/verify             # Verify token validity
```

### Ticket Endpoints
```
GET    /tickets                 # List all tickets (paginated)
GET    /tickets/{id}            # Get single ticket
POST   /tickets                 # Create new ticket
PATCH  /tickets/{id}            # Update ticket
PATCH  /tickets/{id}/assign     # Assign to agent
DELETE /tickets/{id}            # Delete ticket
GET    /tickets/search          # Search tickets
```

### Comment Endpoints
```
GET    /tickets/{id}/comments   # List comments
POST   /tickets/{id}/comments   # Add comment
PATCH  /comments/{id}           # Edit comment
DELETE /comments/{id}           # Delete comment
```

### AI Endpoints
```
POST   /ai/classify             # Classify ticket content
POST   /ai/summarize            # Summarize ticket
POST   /ai/suggest-reply        # Suggest response
POST   /ai/search               # AI-powered search
POST   /ai/agent-workflow       # Run AI workflow
```

### Analytics Endpoints
```
GET    /analytics/kpi           # KPI dashboard
GET    /analytics/realtime      # Real-time stats
GET    /analytics/historical    # Historical data
GET    /analytics/realtime/poll # Poll for updates
```

### User Endpoints
```
GET    /auth/users              # List users (admin)
GET    /users/{id}              # Get user details
PATCH  /auth/me                 # Update profile
PATCH  /auth/users/{id}/toggle-status  # Toggle status (admin)
DELETE /users/{id}              # Delete user (admin)
```

---

## 🎯 Common Tasks

### Login
```typescript
const response = await authApi.login({
  email: 'user@example.com',
  password: 'Password123'
});

// Response contains:
// - user: User object
// - accessToken: JWT token (7 days)
// - refreshToken: JWT token (30 days)

// Store tokens
setCookie('itmagnet_access_token', response.accessToken, 7);
setCookie('itmagnet_refresh_token', response.refreshToken, 30);
```

### Fetch Tickets
```typescript
const response = await ticketApi.list({
  page: 1,
  limit: 10,
  status: 'open',
  priority: 'high'
});

// Response: { tickets: [], meta: { page, limit, total, totalPages } }
```

### Create Ticket
```typescript
const ticket = await ticketApi.create({
  title: 'Issue title',
  description: 'Full description',
  priority: 'high',
  category: 'bug',
  tags: ['tag1', 'tag2']
});
```

### Update Ticket
```typescript
const updated = await ticketApi.update(ticketId, {
  status: 'in_progress',
  priority: 'medium'
});
```

### Get AI Classification
```typescript
const result = await aiApi.classify({
  title: 'App crashes',
  text: 'Crashes on startup'
});

// Response: { classification, confidence, suggestedPriority, suggestedCategory }
```

### Get Analytics
```typescript
const stats = await analyticsApi.kpi();

// Contains: totalTickets, openTickets, avgResolutionTime, topCategories, riskTickets
```

---

## 🔑 Authentication Pattern

```typescript
// 1. User logs in
await authApi.login({ email, password });

// 2. Store tokens (automatic via setCookie)
// Axios interceptor automatically:
// - Injects token in every request Authorization header
// - On 401: Triggers token refresh
// - On refresh success: Retries original request
// - On refresh fail: Redirects to login

// 3. Auto-refresh every 5 minutes
useAutoRefreshToken(); // Call once in layout

// 4. On logout
await authApi.logout();
```

---

## ⚠️ Error Handling

```typescript
try {
  await someApiCall();
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);      // HTTP status
    console.log(error.message);     // Error message
    console.log(error.code);        // Error code
    console.log(error.requestId);   // Request ID for debugging
  }
}

// Or use error handler hook
const { handleError } = useApiError({
  onAuthError: () => router.push('/login'),
  onValidationError: (errors) => showFieldErrors(errors),
  onError: (message) => toast.error(message)
});
```

---

## 📦 Query Parameters

### Tickets List
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - 'open', 'in_progress', 'resolved', 'closed'
- `priority` - 'low', 'medium', 'high', 'critical'
- `category` - Category filter
- `sortBy` - 'createdAt', 'updatedAt', 'priority'
- `order` - 'asc', 'desc'

### Analytics Historical
- `startDate` - ISO date (2026-04-01)
- `endDate` - ISO date (2026-04-30)
- `metric` - Specific metric to fetch

### Users List
- `role` - 'customer', 'agent', 'admin'
- `status` - 'active', 'inactive'

---

## 💾 Using React Query

```typescript
// Fetch with caching
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['tickets', { page: 1 }],
  queryFn: () => ticketApi.list({ page: 1 }),
  staleTime: 5 * 60 * 1000,    // Fresh for 5 min
  gcTime: 30 * 60 * 1000,      // Cache for 30 min
});

// Mutations with auto-refetch
const { mutate, isPending } = useMutation({
  mutationFn: (data) => ticketApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  }
});

// Call mutation
mutate({ title: '...', description: '...' });
```

---

## 🎨 Response Types

### User Object
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  avatar?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}
```

### Ticket Object
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  customerId: string;
  agentId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Comment Object
```typescript
{
  id: string;
  body: string;
  author: { id, name, email, avatar };
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🚀 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=30000
API_RATE_LIMIT=100
```

---

## 📝 Validation Rules

### Email
- Valid email format required
- Example: user@example.com

### Password
- Minimum 8 characters
- Must contain: uppercase, lowercase, number
- Example: Password123

### Ticket Title
- Required, max 200 characters
- Example: "App crashes on startup"

### Priority
- Must be: low, medium, high, critical

### Status
- Valid: open, in_progress, resolved, closed

---

## ⏱️ Token Expiry

| Token | Expiry | Refresh | Storage |
|-------|--------|---------|---------|
| Access | 7 days | Auto @ 5min | Cookie + Store |
| Refresh | 30 days | Manual on 401 | Cookie |

---

## 🔍 Debug Checklist

Before asking for help:
- [ ] Is `Authorization` header present?
- [ ] Is token valid (not expired)?
- [ ] Are required fields included?
- [ ] Is response status 200/201?
- [ ] Are response field names correct?
- [ ] Is base URL correct in .env?
- [ ] Are query parameters correct?
- [ ] Is request body valid JSON?

---

## 🆘 Common Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| 401 Unauthorized | Token missing/expired | Re-login or refresh token |
| 400 Bad Request | Invalid data | Check validation rules |
| 404 Not Found | Resource doesn't exist | Verify ID is correct |
| 429 Too Many | Rate limited | Add debounce to inputs |
| 500 Server Error | Backend error | Contact backend team |

---

## 📚 Header Format

All requests must include:
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
Accept: application/json
```

---

## 🎯 Success Response Format

```json
{
  "data": { /* actual data */ },
  "status": 200,
  "message": "Success"
}
```

---

## ❌ Error Response Format

```json
{
  "success": false,
  "status": 400,
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "errors": [
    { "field": "fieldName", "message": "Error details" }
  ]
}
```

---

## 🔐 Security Tips

1. ✅ Store tokens in HTTP-only cookies
2. ✅ Never expose tokens in localStorage
3. ✅ Use HTTPS in production
4. ✅ Validate all inputs
5. ✅ Don't log sensitive data
6. ✅ Use proper CORS policies

---

## 📞 Support Resources

- **API Documentation:** See `API_INTEGRATION_GUIDE.md`
- **Error Codes:** Refer to error response examples
- **Types:** Check `types/index.ts`
- **Examples:** Browse `hooks/use*.ts`

---

**Version:** 1.0.0 | **Last Updated:** April 12, 2026

# Backend Integration Contract

**For Backend Developers: Frontend Expectations & Response Formats**

---

## 📋 Content

1. [Response Structure requirements](#response-structure-requirements)
2. [Endpoint Implementations](#endpoint-implementations)
3. [Data Validation](#data-validation)
4. [Error Handling](#error-handling)
5. [Token Management](#token-management)
6. [CORS Configuration](#cors-configuration)

---

## Response Structure Requirements

### Success Response Format

The frontend expects responses in ONE of these formats:

#### Option 1: Wrapped Response (Preferred)
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "field1": "value1"
  },
  "message": "Success message",
  "timestamp": "2026-04-12T12:00:00Z"
}
```

#### Option 2: Direct Response
```json
{
  "id": "507f1f77bcf86cd799439011",
  "field1": "value1"
}
```

#### Option 3: Nested Data
```json
{
  "data": {
    "tickets": [ /* data */ ],
    "meta": { "page": 1, "total": 100 }
  }
}
```

**Frontend will extract data using:**
```typescript
const extractData = <T,>(response: any): T => {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
};
```

### Error Response Format

```json
{
  "success": false,
  "status": 400,
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ],
  "requestId": "req-123-456",
  "timestamp": "2026-04-12T12:00:00Z"
}
```

---

## Endpoint Implementations

### Authentication Endpoints

#### POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "customer",
      "avatar": "https://api.example.com/avatars/john.jpg",
      "status": "active",
      "createdAt": "2026-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Required Headers in Response:**
```http
Content-Type: application/json
Set-Cookie: session_id=...; HttpOnly; Secure; SameSite=Strict
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "status": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "errors": []
}
```

---

#### POST /auth/register

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "customer"
}
```

**Success Response (201 Created):**
Same as login response

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

#### GET /auth/me

**Headers Required:**
```http
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "avatar": "https://api.example.com/avatars/john.jpg",
  "status": "active",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

#### POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST /auth/logout

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Ticket Endpoints

#### GET /tickets?page=1&limit=10&status=open

**Query Parameters:**
```
page=1
limit=10
status=open|in_progress|resolved|closed
priority=low|medium|high|critical
category=bug|feature|documentation
```

**Success Response (200 OK):**
```json
{
  "tickets": [
    {
      "id": "507f1f77bcf86cd799439011",
      "_id": "507f1f77bcf86cd799439011", // Optional, frontend accepts both
      "title": "Login page not loading",
      "description": "Users cannot access login page on mobile",
      "status": "in_progress",
      "priority": "high",
      "category": "bug",
      "agent": {
        "id": "507f1f77bcf86cd799439021",
        "name": "John Agent",
        "email": "agent@example.com"
      },
      "customer": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "tags": ["mobile", "urgent"],
      "attachments": 2,
      "commentsCount": 3,
      "createdAt": "2026-04-10T15:30:00Z",
      "updatedAt": "2026-04-12T08:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Alternative Response Format (Also Accepted):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "...",
    "..." 
  }
]
```

---

#### GET /tickets/{id}

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "_id": "507f1f77bcf86cd799439011", // Optional
  "title": "Login page not loading",
  "description": "Users cannot access login page on mobile",
  "status": "in_progress",
  "priority": "high",
  "category": "bug",
  "agent": {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent",
    "email": "agent@example.com"
  },
  "customer": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "tags": ["mobile", "urgent"],
  "attachments": [
    {
      "id": "attach1",
      "filename": "error.png",
      "url": "https://api.example.com/attachments/error.png",
      "size": 2048,
      "mimeType": "image/png"
    }
  ],
  "comments": [
    {
      "id": "comment1",
      "body": "I'm investigating this",
      "author": { "id": "...", "name": "John Agent" },
      "createdAt": "2026-04-11T10:30:00Z"
    }
  ],
  "assignedAt": "2026-04-11T10:00:00Z",
  "resolvedAt": null,
  "createdAt": "2026-04-10T15:30:00Z",
  "updatedAt": "2026-04-12T08:45:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Ticket not found"
}
```

---

#### POST /tickets

**Request:**
```json
{
  "title": "Dashboard loading slowly",
  "description": "Dashboard takes 10+ seconds to load",
  "priority": "medium",
  "category": "performance",
  "tags": ["dashboard", "performance"]
}
```

**Success Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439045",
  "_id": "507f1f77bcf86cd799439045",
  "title": "Dashboard loading slowly",
  "description": "Dashboard takes 10+ seconds to load",
  "status": "open",
  "priority": "medium",
  "category": "performance",
  "customerId": "507f1f77bcf86cd799439011",
  "tags": ["dashboard", "performance"],
  "createdAt": "2026-04-12T10:15:00Z",
  "updatedAt": "2026-04-12T10:15:00Z"
}
```

---

#### PATCH /tickets/{id}

**Request (can include any fields to update):**
```json
{
  "status": "resolved",
  "priority": "low",
  "description": "Updated description"
}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Login page not loading",
  "description": "Updated description",
  "status": "resolved",
  "priority": "low",
  "updatedAt": "2026-04-12T11:00:00Z"
}
```

---

#### PATCH /tickets/{id}/assign

**Request:**
```json
{
  "agentId": "507f1f77bcf86cd799439021"
}
```

**Success Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "agent": {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent",
    "email": "agent@example.com"
  },
  "assignedAt": "2026-04-12T11:05:00Z"
}
```

---

#### DELETE /tickets/{id}

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

---

### Comments Endpoints

#### GET /tickets/{ticketId}/comments

**Success Response (200 OK):**
```json
[
  {
    "id": "comment1",
    "ticketId": "507f1f77bcf86cd799439011",
    "body": "I'm looking into this issue",
    "author": {
      "id": "507f1f77bcf86cd799439021",
      "name": "John Agent",
      "email": "agent@example.com",
      "avatar": "https://api.example.com/avatars/john.jpg"
    },
    "createdAt": "2026-04-11T10:30:00Z",
    "updatedAt": "2026-04-11T10:30:00Z"
  }
]
```

---

#### POST /tickets/{ticketId}/comments

**Request:**
```json
{
  "body": "Fixed! Updated media queries to support all viewports"
}
```

**Success Response (201 Created):**
```json
{
  "id": "comment2",
  "ticketId": "507f1f77bcf86cd799439011",
  "body": "Fixed! Updated media queries to support all viewports",
  "author": {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent"
  },
  "createdAt": "2026-04-12T12:00:00Z"
}
```

---

#### PATCH /comments/{commentId}

**Request:**
```json
{
  "body": "Updated comment text"
}
```

**Success Response (200 OK):**
```json
{
  "id": "comment1",
  "body": "Updated comment text",
  "updatedAt": "2026-04-12T12:05:00Z"
}
```

---

#### DELETE /comments/{commentId}

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### AI Endpoints

#### POST /ai/classify

**Request:**
```json
{
  "title": "App crashes on startup",
  "text": "The application immediately crashes when opened on iOS devices"
}
```

**Success Response (200 OK):**
```json
{
  "classification": "bug",
  "confidence": 0.98,
  "suggestedPriority": "high",
  "suggestedCategory": "crash",
  "suggestedTags": ["ios", "crash", "startup"],
  "reasoning": "Keywords indicate critical bug"
}
```

---

#### POST /ai/summarize

**Request:**
```json
{
  "ticketId": "507f1f77bcf86cd799439011",
  "text": "Full ticket text and comments..."
}
```

**Success Response (200 OK):**
```json
{
  "summary": "Users unable to login on iOS due to viewport sizing",
  "keyPoints": [
    "Mobile-specific issue",
    "Affects iOS platform",
    "Login functionality impaired"
  ],
  "suggestedActions": [
    "Test on iOS devices",
    "Review CSS media queries"
  ]
}
```

---

#### GET /analytics/kpi

**Success Response (200 OK):**
```json
{
  "totalTickets": 150,
  "openTickets": 45,
  "inProgressTickets": 30,
  "resolvedTickets": 70,
  "closedTickets": 5,
  "highPriorityTickets": 12,
  "avgResolutionTime": "2h 30m",
  "topCategories": [
    { "category": "bug", "count": 60 },
    { "category": "feature-request", "count": 45 }
  ],
  "riskTickets": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Critical login issue",
      "priority": "critical",
      "riskLevel": "critical",
      "daysOpen": 3
    }
  ]
}
```

---

## Data Validation

### Required Fields by Endpoint

**POST /auth/login:**
- ✓ email (valid email format)
- ✓ password (8+ chars, uppercase/lowercase/number)

**POST /auth/register:**
- ✓ name (non-empty)
- ✓ email (valid email format, unique)
- ✓ password (8+ chars, uppercase/lowercase/number)
- ✓ role (customer|agent|admin)

**POST /tickets:**
- ✓ title (required, max 200 chars)
- ✓ description (required, min 10 chars)
- ✓ priority (low|medium|high|critical)
- ✓ category (valid category)
- ✗ tags (optional array)

**PATCH /tickets/{id}:**
- ✗ status (optional, if provided must be valid)
- ✗ priority (optional, if provided must be valid)
- ✗ description (optional)

**POST /tickets/{id}/comments:**
- ✓ body (required, min 1 char, max 5000 chars)

---

## Error Handling

### HTTP Status Codes

| Code | Usage | Error Code |
|------|-------|-----------|
| 400 | Bad/Invalid Request | VALIDATION_ERROR |
| 401 | Token missing/invalid | UNAUTHORIZED |
| 403 | User lacks permissions | FORBIDDEN |
| 404 | Resource doesn't exist | NOT_FOUND |
| 409 | Resource already exists | CONFLICT |
| 429 | Rate limited | RATE_LIMIT_EXCEEDED |
| 500 | Internal error | SERVER_ERROR |

### Validation Error Format

```json
{
  "success": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, and number"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid token or token expired"
}
```

---

## Token Management

### Access Token

- **Type:** JWT
- **Expiry:** 7 days
- **Storage:** HTTP-only Cookie
- **Usage:** Authorization: Bearer {token}
- **Algorithm:** HS256

### Refresh Token

- **Type:** JWT
- **Expiry:** 30 days
- **Storage:** HTTP-only Cookie
- **Usage:** POST /auth/refresh body

### Token Claims

```json
{
  "sub": "userId",
  "email": "user@example.com",
  "role": "customer|agent|admin",
  "iat": 1676440200,
  "exp": 1676964000
}
```

---

## CORS Configuration

### Required Headers

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Preflight Requests

For preflight (OPTIONS), respond with:
```http
200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## Field Name Mapping

Frontend accepts both MongoDB (`_id`) and standard (`id`) formats:

```javascript
// These are equivalent:
{ "id": "123", ... }      // Standard
{ "_id": "123", ... }     // MongoDB

// Frontend normalizes to:
ticket.id                 // Always accessible
```

---

## Timestamp Format

All timestamps must be ISO 8601:
```
2026-04-12T12:00:00Z
```

Not accepted:
```
04/12/2026
1676440200
12-04-2026 12:00
```

---

## Common Implementation Mistakes

❌ **Don't:**
- Return timestamps in non-ISO format
- Mix id and _id without normalization
- Return wrapped responses for errors
- Omit status field from error responses
- Return capital True/False instead of lower-case true/false
- Use 200 OK for creation (use 201 Created)
- Return HTML error pages

✅ **Do:**
- Always use ISO 8601 timestamps
- Normalize ID fields
- Always include error.status and error.code
- Use correct HTTP status codes
- Return JSON with proper boolean values
- Use 201 for POST creation endpoints
- Return JSON even for errors

---

## Testing the Integration

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Expected: 200 OK with user + tokens
```

### Test Get Tickets
```bash
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json"

# Expected: 200 OK with paginated tickets
```

### Test Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Issue","description":"Details...","priority":"high","category":"bug"}'

# Expected: 201 Created with new ticket
```

---

## Support

For integration questions:
1. Check this contract document
2. Review response format examples
3. Check error response format
4. Verify field names match
5. Ensure timestamps are ISO 8601

Contact: backend-support@itmagnet.example.com

---

**Version:** 1.0.0 | **Last Updated:** April 12, 2026

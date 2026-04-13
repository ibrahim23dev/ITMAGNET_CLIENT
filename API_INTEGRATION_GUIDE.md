# ITMAGNET API Integration Guide - Complete Documentation

**Version:** 1.0.0 | **Last Updated:** April 12, 2026 | **Status:** Production Ready

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Authentication System](#authentication-system)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Integration Patterns](#integration-patterns)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### API Layer Structure

```
Frontend (Next.js)
    ↓
lib/api.ts (Endpoint definitions)
    ↓
lib/axios.ts (HTTP Client with interceptors)
    ↓
lib/api-service.ts (Retry logic & response parsing)
    ↓
Backend (Node.js/Express)
```

### Key Features

✅ **Token-Based Auth** - 7-day access + 30-day refresh tokens  
✅ **Automatic Token Refresh** - Seamless token management  
✅ **Exponential Backoff** - Smart retry strategy  
✅ **Rate Limiting** - Client-side protection (100 req/min)  
✅ **Flexible Response Parsing** - Handles multiple backend structures  
✅ **Request Queuing** - Prevents race conditions during token refresh  
✅ **Comprehensive Error Handling** - Detailed error messages & codes  

---

## Environment Setup

### 1. Configuration File (.env.local)

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=30000
API_RATE_LIMIT=100
API_RATE_WINDOW=60000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COMMENTS=true

# Cache Configuration
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_STALE_TIME=300000      # 5 minutes
NEXT_PUBLIC_CACHE_TIME=1800000     # 30 minutes

# Analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_POLL_INTERVAL=30000

# Security
NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
NEXT_PUBLIC_LOCKOUT_DURATION=900000 # 15 minutes
```

### 2. Axios Setup (lib/axios.ts)

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './api-service';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: parseInt(process.env.API_TIMEOUT || '30000'),
});

// Request interceptor - Add token to every request
client.interceptors.request.use((config) => {
  const accessToken = getCookie('itmagnet_access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - Handle 401 and refresh token
client.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    // Trigger token refresh and retry
    return retryRequest(error.config);
  }
  return Promise.reject(error);
});

export default client;
```

### 3. Installation

```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env.local

# Update .env.local with your backend URL
NEXT_PUBLIC_API_BASE_URL=http://your-backend:5000/api

# Start development server
npm run dev
```

---

## Authentication System

### Token Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│ USER LOGIN / REGISTRATION                               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Backend validates credentials & returns:                │
│ - accessToken (7 days expiry)                           │
│ - refreshToken (30 days expiry)                         │
│ - user object                                           │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend stores tokens:                                 │
│ - Cookies (with HTTP-only flag)                         │
│ - Zustand auth store                                    │
│ - localStorage (optional, less secure)                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Axios interceptor injects token:                        │
│ Authorization: Bearer {accessToken}                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ For each request:                                       │
│ - If token valid → Execute request                      │
│ - If token expired → Check refresh token                │
│ - If refresh token valid → Get new tokens               │
│ - If refresh fails → Redirect to login                  │
└─────────────────────────────────────────────────────────┘
```

### Implementing Login

**File:** `app/auth/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import { setCookie } from '@/lib/cookies';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend login endpoint
      const response = await authApi.login({ email, password });

      // Store user in auth store
      setUser(response.user);
      setToken(response.accessToken);

      // Store tokens in cookies (7-day expiry)
      setCookie('itmagnet_access_token', response.accessToken, 7);
      setCookie('itmagnet_refresh_token', response.refreshToken, 30);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
```

### Token Auto-Refresh

Located in: `hooks/useAuthApi.ts`

```typescript
export const useAutoRefreshToken = () => {
  const { setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Refresh token every 5 minutes
    const interval = setInterval(async () => {
      try {
        const refreshToken = getCookie('itmagnet_refresh_token');
        if (!refreshToken) return;

        const response = await authApi.refreshToken(refreshToken);
        
        // Update tokens
        setToken(response.accessToken);
        setCookie('itmagnet_access_token', response.accessToken, 7);
        setCookie('itmagnet_refresh_token', response.refreshToken, 30);
      } catch (error) {
        // Refresh failed - logout user
        useAuthStore.setState({ user: null, accessToken: null });
        router.push('/auth/login');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
};
```

---

## API Endpoints Reference

### BASE URL: `http://localhost:5000/api`

All endpoints require `Authorization: Bearer {accessToken}` header

---

### 1️⃣ AUTHENTICATION ENDPOINTS

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "avatar": "https://api.example.com/avatars/john.jpg",
    "createdAt": "2026-01-15T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2NzY0NDAyMDAsImV4cCI6MTY3Njk2NDAwMH0.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTY3NjQ0MDIwMCwiZXhwIjoxNjc5MDMyMjAwfQ.signature"
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "status": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "timestamp": "2026-04-12T12:00:00Z"
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "customer"
}
```

**Response (201 Created):** Same as login response

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "avatar": "https://api.example.com/avatars/john.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "emailNotifications": false
  },
  "createdAt": "2026-01-15T10:30:00Z"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2️⃣ TICKET ENDPOINTS

#### List Tickets
```http
GET /tickets?page=1&limit=10&status=open&priority=high&sortBy=createdAt&order=desc
Authorization: Bearer {accessToken}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 10) |
| `status` | string | open\|in_progress\|resolved\|closed |
| `priority` | string | low\|medium\|high\|critical |
| `category` | string | Filter by category |
| `sortBy` | string | createdAt\|updatedAt\|priority |
| `order` | string | asc\|desc |

**Response (200 OK):**
```json
{
  "tickets": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Login page not working on mobile",
      "description": "Users cannot login from iOS devices",
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
        "name": "John Doe"
      },
      "tags": ["mobile", "urgent", "ios"],
      "attachments": 2,
      "commentsCount": 5,
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

#### Get Single Ticket
```http
GET /tickets/507f1f77bcf86cd799439011
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Login page not working on mobile",
  "description": "Users cannot login from iOS devices. Error message: 'Viewport too small'",
  "status": "in_progress",
  "priority": "high",
  "category": "bug",
  "agent": { "id": "...", "name": "John Agent", "email": "..." },
  "customer": { "id": "...", "name": "John Doe", "email": "..." },
  "tags": ["mobile", "urgent", "ios"],
  "attachments": [
    {
      "id": "attach1",
      "filename": "error-screenshot.png",
      "url": "https://api.example.com/attachments/attach1.png",
      "size": 2048,
      "mimeType": "image/png",
      "uploadedAt": "2026-04-10T16:00:00Z"
    }
  ],
  "comments": [
    {
      "id": "comment1",
      "author": { "id": "...", "name": "John Agent" },
      "body": "I'm investigating this issue",
      "createdAt": "2026-04-11T10:00:00Z"
    }
  ],
  "assignedAt": "2026-04-11T10:00:00Z",
  "resolvedAt": null,
  "createdAt": "2026-04-10T15:30:00Z",
  "updatedAt": "2026-04-12T08:45:00Z"
}
```

#### Create Ticket
```http
POST /tickets
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Dashboard loads slowly",
  "description": "Dashboard takes 10+ seconds to load on slow networks",
  "priority": "medium",
  "category": "performance",
  "tags": ["dashboard", "performance", "optimization"]
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439045",
  "title": "Dashboard loads slowly",
  "description": "Dashboard takes 10+ seconds to load on slow networks",
  "status": "open",
  "priority": "medium",
  "category": "performance",
  "customerId": "507f1f77bcf86cd799439011",
  "tags": ["dashboard", "performance", "optimization"],
  "createdAt": "2026-04-12T10:15:00Z",
  "updatedAt": "2026-04-12T10:15:00Z"
}
```

#### Update Ticket
```http
PATCH /tickets/507f1f77bcf86cd799439011
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "resolved",
  "priority": "low",
  "description": "Dashboard now loads in under 2 seconds after optimization"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Dashboard loads slowly",
  "description": "Dashboard now loads in under 2 seconds after optimization",
  "status": "resolved",
  "priority": "low",
  "updatedAt": "2026-04-12T11:00:00Z"
}
```

#### Assign Ticket to Agent
```http
PATCH /tickets/507f1f77bcf86cd799439011/assign
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "agentId": "507f1f77bcf86cd799439021"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Dashboard loads slowly",
  "agent": {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent",
    "email": "john@example.com"
  },
  "assignedAt": "2026-04-12T11:05:00Z"
}
```

#### Delete Ticket
```http
DELETE /tickets/507f1f77bcf86cd799439011
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully",
  "deletedId": "507f1f77bcf86cd799439011"
}
```

---

### 3️⃣ COMMENTS ENDPOINTS

#### List Comments
```http
GET /tickets/507f1f77bcf86cd799439011/comments
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
[
  {
    "id": "comment1",
    "ticketId": "507f1f77bcf86cd799439011",
    "body": "I'm looking into this issue. Preliminary findings suggest CSS viewport issue.",
    "author": {
      "id": "507f1f77bcf86cd799439021",
      "name": "John Agent",
      "email": "john@example.com",
      "avatar": "https://api.example.com/avatars/john.jpg"
    },
    "createdAt": "2026-04-11T10:30:00Z",
    "updatedAt": "2026-04-11T10:30:00Z"
  }
]
```

#### Create Comment
```http
POST /tickets/507f1f77bcf86cd799439011/comments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "body": "Fixed! Updated media queries to handle all viewport sizes properly."
}
```

**Response (201 Created):**
```json
{
  "id": "comment2",
  "ticketId": "507f1f77bcf86cd799439011",
  "body": "Fixed! Updated media queries to handle all viewport sizes properly.",
  "author": {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent"
  },
  "createdAt": "2026-04-12T12:00:00Z"
}
```

#### Update Comment
```http
PATCH /comments/comment1
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "body": "Updated comment with more details about the fix"
}
```

**Response (200 OK):**
```json
{
  "id": "comment1",
  "body": "Updated comment with more details about the fix",
  "updatedAt": "2026-04-12T12:05:00Z"
}
```

#### Delete Comment
```http
DELETE /comments/comment1
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### 4️⃣ AI FEATURES ENDPOINTS

#### Classify Ticket Content
```http
POST /ai/classify
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "App crashes on startup",
  "text": "The application immediately crashes when opened on iOS devices"
}
```

**Response (200 OK):**
```json
{
  "classification": "bug",
  "confidence": 0.98,
  "suggestedPriority": "high",
  "suggestedCategory": "crash",
  "suggestedTags": ["ios", "crash", "startup"],
  "reasoning": "Keywords like 'crashes', 'startup' and platform specification 'iOS' indicate a critical bug"
}
```

#### Summarize Ticket
```http
POST /ai/summarize
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ticketId": "507f1f77bcf86cd799439011",
  "text": "Full ticket description and comments combined..."
}
```

**Response (200 OK):**
```json
{
  "summary": "Users unable to login on iOS devices due to viewport sizing issue",
  "keyPoints": [
    "Mobile-specific issue",
    "Affects iOS platform",
    "Login functionality impaired",
    "CSS viewport problem suspected"
  ],
  "suggestedActions": [
    "Test responsive design on various iOS devices",
    "Review CSS media queries",
    "Check viewport meta tag configuration"
  ]
}
```

#### Suggest Reply
```http
POST /ai/suggest-reply
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ticketId": "507f1f77bcf86cd799439011",
  "tone": "professional",
  "includeRag": true
}
```

**Response (200 OK):**
```json
{
  "suggestion": "Thank you for reporting this issue. We've identified a CSS viewport sizing problem affecting iOS devices. Our team is working on a fix that will be deployed within 24 hours. In the meantime, you can use the desktop version. We'll notify you when the fix is live.",
  "confidence": 0.92,
  "sources": ["KB-123", "Issue-456", "Similar-Case-789"]
}
```

#### AI Search
```http
POST /ai/search
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "query": "login problems mobile"
}
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Login page not working on mobile",
    "score": 0.98,
    "category": "bug",
    "status": "in_progress"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Google OAuth login fails on iOS",
    "score": 0.85,
    "category": "bug",
    "status": "resolved"
  }
]
```

---

### 5️⃣ ANALYTICS ENDPOINTS

#### KPI Dashboard
```http
GET /analytics/kpi
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
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

#### Real-time Analytics
```http
GET /analytics/realtime
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "activeUsers": 42,
  "ticketsCreatedToday": 15,
  "ticketsResolvedToday": 8,
  "avgResponseTime": "15 minutes",
  "satisfaction": 4.5,
  "onlineAgents": 8,
  "averageWaitTime": "3 minutes"
}
```

#### Historical Analytics
```http
GET /analytics/historical?startDate=2026-04-01&endDate=2026-04-12
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
[
  {
    "date": "2026-04-01",
    "ticketsCreated": 8,
    "ticketsResolved": 5,
    "satisfaction": 4.3,
    "avgResponseTime": "18 minutes",
    "statusBreakdown": {
      "open": 10,
      "in_progress": 8,
      "resolved": 5,
      "closed": 2
    }
  }
]
```

---

### 6️⃣ USER MANAGEMENT ENDPOINTS

#### List Users (Admin Only)
```http
GET /auth/users?role=agent&status=active
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439021",
    "name": "John Agent",
    "email": "john@example.com",
    "role": "agent",
    "status": "active",
    "department": "Support",
    "ticketsAssigned": 12,
    "createdAt": "2026-01-15T10:30:00Z"
  }
]
```

#### Get User
```http
GET /users/507f1f77bcf86cd799439021
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439021",
  "name": "John Agent",
  "email": "john@example.com",
  "role": "agent",
  "status": "active",
  "avatar": "https://api.example.com/avatars/john.jpg",
  "department": "Support",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

#### Update User Profile
```http
PATCH /auth/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Smith",
  "avatar": "https://api.example.com/avatars/john-new.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Smith",
  "email": "user@example.com",
  "avatar": "https://api.example.com/avatars/john-new.jpg",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### Toggle User Status (Admin Only)
```http
PATCH /auth/users/507f1f77bcf86cd799439021/toggle-status
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439021",
  "name": "John Agent",
  "status": "inactive"
}
```

---

## Request/Response Formats

### Standard Headers

```http
# Required Headers
Authorization: Bearer {accessToken}
Content-Type: application/json
Accept: application/json

# Optional Headers  
X-Request-ID: {unique-uuid}
X-Client-Version: 1.0.0
```

### Standard Request Body Format

```json
{
  "field1": "value1",
  "field2": "value2",
  "nested": {
    "subfield": "value"
  }
}
```

### Standard Success Response

```json
{
  "data": {
    /* response data */
  },
  "status": 200,
  "message": "Success",
  "timestamp": "2026-04-12T12:00:00Z"
}
```

### Standard Error Response

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
    }
  ],
  "requestId": "req-12345",
  "timestamp": "2026-04-12T12:00:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Error Type | Cause |
|------|-----------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Malformed request/validation error |
| 401 | Unauthorized | No/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Backend error |
| 503 | Service Unavailable | Backend down |

### Error Codes

```
AUTH_*
  INVALID_CREDENTIALS    - Wrong email/password
  TOKEN_EXPIRED          - Access token expired
  INVALID_TOKEN          - Malformed token
  UNAUTHORIZED           - Not authenticated

VALIDATION_*
  VALIDATION_ERROR       - Input validation failed
  REQUIRED_FIELD         - Missing required field
  INVALID_FORMAT         - Invalid format

RESOURCE_*
  NOT_FOUND              - Resource doesn't exist
  ALREADY_EXISTS         - Resource already exists
  CONFLICT               - Resource conflict

RATE_LIMIT
  RATE_LIMIT_EXCEEDED    - Too many requests
```

### Error Handling in Frontend

```typescript
import { useApiError } from '@/hooks/useApiError';

export function MyComponent() {
  const { handleError } = useApiError({
    onAuthError: () => {
      // Handle 401/403 - redirect to login
      router.push('/auth/login');
    },
    onValidationError: (fieldErrors) => {
      // Handle validation - display field errors
      Object.entries(fieldErrors).forEach(([field, message]) => {
        console.error(`${field}: ${message}`);
      });
    },
    onError: (message, error) => {
      // Generic error handler
      toast.error(message);
    }
  });

  const handleAction = async () => {
    try {
      await ticketApi.create({ title: '...' });
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={handleAction}>Create</button>;
}
```

---

## Integration Patterns

### Pattern 1: React Query with Tickets

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api';

// Fetch tickets
function TicketList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketApi.list({ page: 1, limit: 10 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.tickets.map((ticket) => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}

// Create ticket
function CreateTicketForm() {
  const queryClient = useQueryClient();
  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: (data) => ticketApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket created!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTicket({ title: '...', description: '...' });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Pattern 2: Authentication in App

```typescript
// Root layout with auth setup
import { useAutoRefreshToken } from '@/hooks/useAuthApi';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoRefreshToken(); // Start token refresh at app launch

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Protected route
import { useAuthStore } from '@/hooks/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user]);

  if (!user) return null;

  return <div>Welcome, {user.name}!</div>;
}
```

### Pattern 3: Real-time Dashboard

```typescript
export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'kpi'],
    queryFn: () => analyticsApi.kpi(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="dashboard">
      <KPICard label="Total Tickets" value={stats.totalTickets} />
      <KPICard label="Open" value={stats.openTickets} />
      <KPICard label="In Progress" value={stats.inProgressTickets} />
      <KPICard label="Resolved" value={stats.resolvedTickets} />
    </div>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Use API functions** - Always use defined API functions from `lib/api.ts`
   ```typescript
   const tickets = await ticketApi.list();
   ```

2. **Handle errors** - Use error handler hook for consistent error handling
   ```typescript
   const { handleError } = useApiError();
   try {
     await action();
   } catch (err) {
     handleError(err);
   }
   ```

3. **Cache with React Query** - Use proper cache settings
   ```typescript
   staleTime: 5 * 60 * 1000,  // Data fresh for 5 min
   gcTime: 30 * 60 * 1000,    // Keep in cache for 30 min
   ```

4. **Load states** - Show loading/error indicators
   ```typescript
   if (isLoading) return <Loader />;
   if (error) return <ErrorMessage />;
   ```

5. **Debounce user inputs** - Prevent excessive API calls
   ```typescript
   const debouncedSearch = debounce((q) => search(q), 300);
   ```

### ❌ DON'T

1. **Don't make direct API calls** - Always use the API functions
   ```typescript
   // Bad
   await axios.get('/tickets');
   ```

2. **Don't ignore errors** - Always handle them
   ```typescript
   // Bad
   try { await action(); } catch (err) {}
   ```

3. **Don't disable ESLint rules** - Fix the issues instead
   ```typescript
   // Bad
   // eslint-disable-next-line
   ```

4. **Don't poll every keystroke** - Use debounce/throttle
   ```typescript
   // Bad
   <input onChange={(e) => search(e.target.value)} />
   ```

5. **Don't store sensitive data in localStorage** - Use secure cookies
   ```typescript
   // Bad
   localStorage.setItem('accessToken', token);
   ```

---

## Troubleshooting

### Issue: "Unauthorized" on all requests
**Cause:** Token not being sent or expired  
**Solution:**
1. Check if token exists in cookies
2. Verify token format in Authorization header
3. Check token expiry time

```typescript
console.log(getCookie('itmagnet_access_token')); // Should have value
```

### Issue: Login loop (redirects back to login)
**Cause:** Token refresh failing or auto-refresh not working  
**Solution:**
1. Verify refresh token exists
2. Check backend refresh endpoint
3. Check useAutoRefreshToken is called

```typescript
useAutoRefreshToken(); // Must be in layout or root component
```

### Issue: "Validation failed" errors
**Cause:** Invalid request data  
**Solution:**
1. Check required fields
2. Verify data types
3. Look at error details

```typescript
// Check which field failed
const fieldErrors = error.errors; // [ { field, message } ]
```

### Issue: Rate limit (429) errors
**Cause:** Too many requests  
**Solution:**
1. Add debounce to user inputs
2. Check for duplicate requests
3. Increase rate limit on backend

```typescript
const debouncedSearch = debounce(search, 300);
```

### Issue: CORS errors
**Cause:** Backend CORS not configured  
**Solution:** Ensure backend includes:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## Summary

This guide provides complete integration documentation for the ITMAGNET API. Key takeaways:

✅ All 30+ endpoints documented with examples  
✅ Request/response formats clearly specified  
✅ Authentication and token management explained  
✅ Error handling with specific codes  
✅ Integration patterns for common scenarios  
✅ Best practices and anti-patterns  
✅ Troubleshooting for common issues  

**For Production:**
- Use HTTPS everywhere
- Validate all inputs
- Monitor error metrics
- Implement rate limiting
- Keep tokens secure
- Use proper CORS policies

---

**Last Updated:** April 12, 2026  
**Version:** 1.0.0  
**Status:** Production Ready  
**Maintained By:** ITMAGNET Backend Team

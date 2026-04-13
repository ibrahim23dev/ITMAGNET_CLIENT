# Backend Testing & Validation Guide

**Ensure Full Compatibility Between Frontend & Backend APIs**

---

## 📋 Content

1. [Quick Start Testing](#quick-start-testing)
2. [Complete Integration Checklist](#complete-integration-checklist)
3. [Endpoint Verification Procedures](#endpoint-verification-procedures)
4. [Response Format Validation](#response-format-validation)
5. [Error Handling Tests](#error-handling-tests)
6. [Performance Benchmarks](#performance-benchmarks)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start Testing

### Step 1: Verify Backend is Running

```bash
# Test basic connectivity
curl -X GET http://localhost:5000/health \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "status": "ok",
#   "uptime": 12345,
#   "timestamp": "2026-04-12T12:00:00Z"
# }
```

### Step 2: Test Authentication

```bash
# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "role": "customer"
  }'

# Expected Status: 201 Created
# Response includes: user object, accessToken, refreshToken
```

### Step 3: Test Token Usage

```bash
# Get current user (requires valid token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

# Expected Status: 200 OK
# Response: User profile object
```

### Step 4: Test Data Endpoints

```bash
# Get tickets list
curl -X GET http://localhost:5000/api/tickets?page=1&limit=10 \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

# Expected Status: 200 OK
# Response: Tickets array with pagination metadata
```

---

## Complete Integration Checklist

### Authentication Testing

- [ ] **POST /auth/register**
  - [ ] Creates user successfully
  - [ ] Returns user object with id, email, name, role
  - [ ] Returns accessToken (JWT format)
  - [ ] Returns refreshToken (JWT format)
  - [ ] Returns 201 Created status
  - [ ] Rejects duplicate email with 409 Conflict
  - [ ] Validates password strength
  - [ ] Validates email format

- [ ] **POST /auth/login**
  - [ ] Authenticates valid credentials
  - [ ] Returns same token format as register
  - [ ] Sets HttpOnly cookies correctly
  - [ ] Returns 200 OK status
  - [ ] Rejects invalid email with 401
  - [ ] Rejects invalid password with 401
  - [ ] Accepts both email and username if supported

- [ ] **GET /auth/me**
  - [ ] Returns current user profile when token valid
  - [ ] Returns 401 for missing token
  - [ ] Returns 401 for expired token
  - [ ] Returns 401 for invalid token
  - [ ] Includes all user fields: id, name, email, role, status

- [ ] **POST /auth/refresh**
  - [ ] Issues new accessToken with valid refreshToken
  - [ ] Returns new refreshToken
  - [ ] Returns 200 OK status
  - [ ] Returns 401 with expired refreshToken
  - [ ] Returns 401 with invalid refreshToken
  - [ ] Maintains user context

- [ ] **POST /auth/logout**
  - [ ] Returns 200 OK
  - [ ] Clears tokens/cookies
  - [ ] Subsequent requests should fail

### Ticket Management Testing

- [ ] **GET /tickets**
  - [ ] Returns paginated list (default 10 per page)
  - [ ] Accepts pagination params: page, limit
  - [ ] Accepts filter params: status, priority, category
  - [ ] Returns meta object with pagination info
  - [ ] Returns empty array when no tickets
  - [ ] Respects user role (customer sees own, agent sees assigned)

- [ ] **GET /tickets/{id}**
  - [ ] Returns full ticket details
  - [ ] Returns 404 for non-existent ticket
  - [ ] Returns 403 for unauthorized access
  - [ ] Includes related data: agent, customer, comments, attachments

- [ ] **POST /tickets**
  - [ ] Creates ticket with valid data
  - [ ] Returns 201 Created status
  - [ ] Sets status to "open" initially
  - [ ] Sets createdAt timestamp
  - [ ] Associates with current user as customer
  - [ ] Validates required fields
  - [ ] Validates title length limitation
  - [ ] Validates priority enum values

- [ ] **PATCH /tickets/{id}**
  - [ ] Updates valid fields
  - [ ] Returns updated ticket
  - [ ] Updates updatedAt timestamp
  - [ ] Validates status transition rules if applicable
  - [ ] Returns 403 for unauthorized updates
  - [ ] Returns 404 for non-existent ticket
  - [ ] Allows partial updates

- [ ] **PATCH /tickets/{id}/assign**
  - [ ] Assigns valid agent
  - [ ] Sets assignedAt timestamp
  - [ ] Returns 404 for invalid agent
  - [ ] Returns 403 for non-admin assignment
  - [ ] Returns updated ticket with agent info

- [ ] **DELETE /tickets/{id}**
  - [ ] Deletes ticket successfully
  - [ ] Returns 200 OK or 204 No Content
  - [ ] Returns 404 for non-existent ticket
  - [ ] Returns 403 for unauthorized deletion
  - [ ] Subsequent GET returns 404

### Comments Testing

- [ ] **GET /tickets/{ticketId}/comments**
  - [ ] Returns array of comments
  - [ ] Includes author info for each comment
  - [ ] Ordered by creation date (newest last)
  - [ ] Returns empty array if no comments
  - [ ] Returns 404 if ticket doesn't exist

- [ ] **POST /tickets/{ticketId}/comments**
  - [ ] Creates comment successfully
  - [ ] Returns 201 Created status
  - [ ] Includes author as current user
  - [ ] Sets createdAt timestamp
  - [ ] Validates body length (1-5000 chars)
  - [ ] Returns 404 if ticket doesn't exist
  - [ ] Returns 400 if body is empty

- [ ] **PATCH /comments/{commentId}**
  - [ ] Updates comment body
  - [ ] Sets updatedAt timestamp
  - [ ] Returns 403 if not comment author
  - [ ] Returns 404 if comment doesn't exist
  - [ ] Validates body length

- [ ] **DELETE /comments/{commentId}**
  - [ ] Deletes comment successfully
  - [ ] Returns 200 OK status
  - [ ] Returns 403 if not comment author/admin
  - [ ] Returns 404 if doesn't exist

### AI & Analytics Testing

- [ ] **POST /ai/classify**
  - [ ] Accepts title and text
  - [ ] Returns classification field
  - [ ] Returns confidence score (0-1)
  - [ ] Returns suggestedPriority
  - [ ] Returns suggestedCategory
  - [ ] Returns array of suggestedTags

- [ ] **POST /ai/summarize**
  - [ ] Accepts ticket text
  - [ ] Returns summary field (string)
  - [ ] Returns keyPoints array
  - [ ] Returns suggestedActions array

- [ ] **GET /analytics/kpi**
  - [ ] Returns all KPI fields
  - [ ] Calculates metrics correctly
  - [ ] Returns topCategories array
  - [ ] Returns riskTickets array
  - [ ] Numbers are integers (not strings)

---

## Endpoint Verification Procedures

### Test Each Endpoint Independently

#### 1. Authentication Flow Test

```bash
#!/bin/bash

# Set base URL
BASE_URL="http://localhost:5000/api"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="TestPass123"

echo "=== Testing Authentication Flow ==="

# 1. Register
echo "1. Testing POST /auth/register"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"customer\"
  }")

echo "Response: $REGISTER_RESPONSE"

# Extract token (assumes jq is installed)
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken // .accessToken')
echo "Access Token: $ACCESS_TOKEN"

# 2. Get Current User
echo -e "\n2. Testing GET /auth/me"
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | jq .

# 3. Login
echo -e "\n3. Testing POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")
echo $LOGIN_RESPONSE | jq .

# 4. Refresh Token
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken // .refreshToken')
echo -e "\n4. Testing POST /auth/refresh"
curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq .
```

#### 2. Ticket CRUD Test

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
TOKEN="your_access_token_here"

echo "=== Testing Ticket CRUD ==="

# 1. Create Ticket
echo "1. Testing POST /tickets"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test ticket for validation",
    "priority": "medium",
    "category": "bug"
  }')

TICKET_ID=$(echo $CREATE_RESPONSE | jq -r '.id // ._id // .data.id')
echo "Created Ticket ID: $TICKET_ID"
echo "Response: $CREATE_RESPONSE"

# 2. Get Single Ticket
echo -e "\n2. Testing GET /tickets/{id}"
curl -s -X GET $BASE_URL/tickets/$TICKET_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

# 3. List Tickets
echo -e "\n3. Testing GET /tickets"
curl -s -X GET "$BASE_URL/tickets?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

# 4. Update Ticket
echo -e "\n4. Testing PATCH /tickets/{id}"
curl -s -X PATCH $BASE_URL/tickets/$TICKET_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "priority": "high"}' | jq .

# 5. Add Comment
echo -e "\n5. Testing POST /tickets/{id}/comments"
curl -s -X POST $BASE_URL/tickets/$TICKET_ID/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body": "This is a test comment"}' | jq .

# 6. Get Comments
echo -e "\n6. Testing GET /tickets/{id}/comments"
curl -s -X GET $BASE_URL/tickets/$TICKET_ID/comments \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Response Format Validation

### Validate JSON Structure

```bash
# Expected for successful response:
{
  "data": { /* actual data */ },
  "message": "Success message",
  "success": true,
  "timestamp": "2026-04-12T12:00:00Z"
}

# OR (direct format)
{
  "id": "...",
  "field": "value"
}

# Validation checklist:
- [ ] Single root object (not array for success responses)
- [ ] All timestamps in ISO 8601 format
- [ ] No null values where object expected
- [ ] Boolean values lowercase (true/false)
- [ ] No trailing commas
- [ ] UTF-8 encoded
```

### Validate Error Response

```bash
# Expected error response:
{
  "success": false,
  "status": 400,
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "errors": [
    { "field": "fieldName", "message": "Error message" }
  ]
}

# Validation checklist:
- [ ] All error responses have status code
- [ ] All responses have code field
- [ ] Message field is human-readable string
- [ ] Errors array includes field-specific messages
- [ ] HTTP status header matches response.status
```

---

## Error Handling Tests

### Test 401 Unauthorized

```bash
# Missing token
curl -X GET http://localhost:5000/api/tickets

# Expected: 401 Unauthorized
# Response code field: "UNAUTHORIZED"

# Invalid token
curl -X GET http://localhost:5000/api/tickets \
  -H "Authorization: Bearer invalid_token_here"

# Expected: 401 Unauthorized
```

### Test 403 Forbidden

```bash
# Customer accessing admin endpoint
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer {customer_token}"

# Expected: 403 Forbidden
# Response code: "FORBIDDEN"
```

### Test 404 Not Found

```bash
# Non-existent ticket
curl -X GET http://localhost:5000/api/tickets/nonexistent_id \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
# Response code: "NOT_FOUND"
```

### Test 409 Conflict

```bash
# Duplicate email registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User 1",
    "email": "existing@example.com",
    "password": "Pass123"
  }'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User 2",
    "email": "existing@example.com",
    "password": "Pass456"
  }'

# Expected: 409 Conflict on second request
# Response code: "CONFLICT"
```

### Test 400 Bad Request

```bash
# Missing required field
curl -X POST http://localhost:5000/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Missing description"}'

# Expected: 400 Bad Request
# Response includes errors array with field-specific messages
```

### Test 429 Rate Limited

```bash
# Send requests rapidly in loop
for i in {1..150}; do
  curl -s -X GET http://localhost:5000/api/tickets \
    -H "Authorization: Bearer $TOKEN" > /dev/null
done

# Expected (after rate limit hit): 429 Too Many Requests
```

---

## Performance Benchmarks

### Response Time Targets

| Endpoint | Method | Target |
|----------|--------|--------|
| /auth/login | POST | < 500ms |
| /auth/me | GET | < 100ms |
| /tickets | GET (list) | < 300ms |
| /tickets/{id} | GET | < 200ms |
| /tickets | POST | < 400ms |
| /tickets/{id} | PATCH | < 300ms |
| /comments | POST | < 200ms |
| /ai/classify | POST | < 2000ms |
| /analytics/kpi | GET | < 500ms |

### Load Testing Script

```bash
#!/bin/bash
# Test response times under load

echo "=== Performance Testing ==="

# Function to measure response time
measure_time() {
  local start=$(date +%s%N | cut -b1-13)
  curl -s -X GET "http://localhost:5000/api/tickets?page=1" \
    -H "Authorization: Bearer $1" > /dev/null
  local end=$(date +%s%N | cut -b1-13)
  echo "$((end - start))ms"
}

TOKEN="your_token_here"

echo "Measuring 10 sequential requests..."
for i in {1..10}; do
  TIME=$(measure_time $TOKEN)
  echo "Request $i: $TIME"
done

echo -e "\nPerformance test complete"
```

---

## Troubleshooting

### Issue: 401 Unauthorized on Valid Token

**Symptoms:** Token was just retrieved but /auth/me returns 401

**Diagnosis:**
```bash
# Check token format
echo $TOKEN | jq -R 'split(".") | length'
# Should output: 3 (header.payload.signature)

# Check token expiry
echo $TOKEN | jq -R 'split(".")[1] | @base64d | jq .exp'
```

**Solutions:**
- [ ] Verify token is in Authorization header as "Bearer {token}"
- [ ] Check token hasn't expired (exp claim)
- [ ] Ensure backend secret key is correct
- [ ] Check token was properly formatted from response
- [ ] Try getting a fresh token

### Issue: 400 Validation Error

**Symptoms:** POST endpoint returns validation error for valid data

**Example Response:**
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**Debug Steps:**
```bash
# Check sent data
curl -X POST ... -d '{"email":"test@example.com"}' \
  -H "Content-Type: application/json" \
  -v  # Verbose to see exact request

# Verify field names match documentation
# Check field values meet constraints
# Verify data types (string vs number)
```

**Solutions:**
- [ ] Use exact field names from documentation
- [ ] Verify data types (email as string, not array)
- [ ] Check field length limits
- [ ] Validate enum values match allowed options
- [ ] Ensure no extra/typo fields

### Issue: 500 Server Error

**Symptoms:** Backend returns 500 status code

**Response Example:**
```json
{
  "status": 500,
  "code": "SERVER_ERROR",
  "message": "Internal server error (Check logs for details)"
}
```

**Backend Diagnosis (check server logs):**
- [ ] Check database connection
- [ ] Verify environment variables set
- [ ] Check for unhandled exceptions
- [ ] Review request payload (may cause parsing error)
- [ ] Verify backend dependencies are installed

**Frontend Testing:**
```bash
# Check backend is actually running
curl http://localhost:5000/health

# If no response, backend is down
# Check docker/service status
```

### Issue: CORS Blocked

**Symptoms:** Browser console shows CORS error

**Error Example:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions:**
- [ ] Backend must include CORS headers (see CORS Configuration)
- [ ] Verify frontend URL in Access-Control-Allow-Origin
- [ ] Check credentials flag set to include in Axios config
- [ ] Ensure preflight request succeeds (OPTIONS method)

### Issue: Token Refresh Fails

**Symptoms:** After 7 days, requests return 401

**Testing:**
```bash
# Check if refresh endpoint is working
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'"$REFRESH_TOKEN"'"}'

# Should return new accessToken if refreshToken valid
```

**Solutions:**
- [ ] Ensure refreshToken wasn't expired (30-day expiry)
- [ ] Verify refresh endpoint returns new tokens
- [ ] Check frontend is calling refresh before making requests
- [ ] Confirm tokens stored correctly in cookies

---

## Validation Checklist (Pre-Production)

### Functional Testing
- [ ] All endpoints respond with correct HTTP status
- [ ] All response formats match contract specification
- [ ] All error responses include status, code, message
- [ ] Token refresh happens automatically
- [ ] Expired tokens trigger logout
- [ ] CORS allows frontend origin
- [ ] Rate limiting works after threshold
- [ ] Pagination works with different page/limit values

### Security Testing
- [ ] Tokens cannot be reused after logout
- [ ] Refresh token required for token refresh
- [ ] Role-based access control enforced
- [ ] User can only see own resources (unless admin)
- [ ] Passwords hidden in transit (HTTPS)
- [ ] Tokens in HttpOnly cookies (not localStorage)

### Data Validation
- [ ] Empty/null fields rejected appropriately
- [ ] Email format validated
- [ ] Password strength requirements enforced
- [ ] Field length limits enforced
- [ ] Enum values validated
- [ ] Date formats are ISO 8601
- [ ] Special characters handled correctly

### Performance
- [ ] All endpoints meet response time targets
- [ ] Database queries optimized (no N+1)
- [ ] Pagination prevents large response sizes
- [ ] Rate limiting prevents abuse
- [ ] Connection pooling configured

---

## Running Full Integration Test Suite

```bash
#!/bin/bash
# Complete test suite

BACKEND_URL="http://localhost:5000/api"
TEST_EMAIL="integration_test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"
TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local token=$4
  local data=$5
  local expected_status=$6

  echo -n "Testing $name... "
  
  if [ -n "$data" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $method "$BACKEND_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $method "$BACKEND_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo "✓ PASS"
    ((TESTS_PASSED++))
  else
    echo "✗ FAIL (Expected $expected_status, got $HTTP_CODE)"
    ((TESTS_FAILED++))
  fi
}

echo "=== Integration Test Suite ==="

# 1. Register
echo -e "\n--- Authentication ---"
REGISTER=$(curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"role\": \"customer\"
  }")

TOKEN=$(echo $REGISTER | jq -r '.data.accessToken // .accessToken')
test_endpoint "Get Auth Me" "GET" "/auth/me" "$TOKEN" "" "200"

# 2. Tickets
echo -e "\n--- Tickets ---"
CREATE_TICKET=$(curl -s -X POST "$BACKEND_URL/tickets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "Test Description",
    "priority": "medium",
    "category": "bug"
  }')

TICKET_ID=$(echo $CREATE_TICKET | jq -r '.id // ._id // .data.id')

test_endpoint "List Tickets" "GET" "/tickets" "$TOKEN" "" "200"
test_endpoint "Get Ticket" "GET" "/tickets/$TICKET_ID" "$TOKEN" "" "200"
test_endpoint "Update Ticket" "PATCH" "/tickets/$TICKET_ID" "$TOKEN" '{"status":"in_progress"}' "200"

# 3. Comments
echo -e "\n--- Comments ---"
test_endpoint "Add Comment" "POST" "/tickets/$TICKET_ID/comments" "$TOKEN" '{"body":"Test comment"}' "201"
test_endpoint "Get Comments" "GET" "/tickets/$TICKET_ID/comments" "$TOKEN" "" "200"

# 4. Error Handling
echo -e "\n--- Error Handling ---"
test_endpoint "Invalid Token" "GET" "/tickets" "invalid_token" "" "401"
test_endpoint "Not Found" "GET" "/tickets/invalid_id" "$TOKEN" "" "404"

# Results
echo -e "\n=== Test Results ==="
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
if [ $TESTS_FAILED -eq 0 ]; then
  echo "✓ All tests passed!"
  exit 0
else
  echo "✗ Some tests failed"
  exit 1
fi
```

---

## Support & Escalation

If endpoint returns unexpected response:

1. **Check this document** for expected format
2. **Review backend logs** for error details
3. **Verify request format** matches contract
4. **Test with curl** to isolate frontend vs backend issue
5. **Compare timestamp formats** - must be ISO 8601
6. **Verify token validity** - may have expired
7. **Check user permissions** - role-based restrictions

Contact: backend-support@itmagnet.example.com

---

**Version:** 1.0.0 | **Last Updated:** April 12, 2026

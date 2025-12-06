# IDOR Hunting Checklist

> **Definition**: Insecure Direct Object Reference — Access control flaw allowing users to access resources belonging to others
> **Impact**: High — Data leakage, unauthorized modification, privilege escalation
> **Detection**: Two-account testing required

---

## Prerequisites

- [ ] Two test accounts on target platform
  - Account A (Attacker)
  - Account B (Victim)
- [ ] Both accounts in same "tenant" (if multi-tenant app)
- [ ] Ability to extract identifiers (UUIDs, user IDs, etc.)

---

## Phase 1: Identifier Discovery

### Step 1.1: Create Test Accounts
- [ ] Create Account A with unique email (attacker@test.com)
- [ ] Create Account B with unique email (victim@test.com)
- [ ] Complete any required verification for both
- [ ] Document credentials securely

### Step 1.2: Extract Identifiers
For **Account B (victim)**, extract:
- [ ] User UUID/ID (from API responses, URLs)
- [ ] Email address
- [ ] Username/handle
- [ ] Phone number (if applicable)
- [ ] Any other unique identifiers

**Common locations**:
- Profile page URLs: `/users/[uuid]`
- API responses: `{"user": {"id": "uuid-here"}}`
- GraphQL queries: `user(uuid: "...")`
- HTML source: `data-user-id="..."`

### Step 1.3: Identify Testable Endpoints
Map all endpoints that accept identifiers:

**User Resources**:
- [ ] `/api/users/{uuid}` — User profile
- [ ] `/api/users/{uuid}/settings` — User settings
- [ ] `/api/users/{uuid}/orders` — Order history
- [ ] `/api/users/{uuid}/payments` — Payment methods
- [ ] `/api/users/{uuid}/documents` — Uploaded files

**Business Resources** (multi-tenant apps):
- [ ] `/api/organizations/{org_id}/users`
- [ ] `/api/teams/{team_id}/members`
- [ ] `/api/projects/{project_id}/files`

**GraphQL Operations**:
- [ ] `query GetUser(uuid: "...")`
- [ ] `query GetTrips(userId: "...")`
- [ ] `mutation UpdateProfile(uuid: "...", data: {...})`

---

## Phase 2: Systematic Testing

For **each** endpoint identified:

### Step 2.1: Baseline Request (Account B)
1. Login to Account B (victim)
2. Access resource (e.g., profile page)
3. Capture request in Burp/DevTools
4. Note response contents (PII, sensitive data)

**Example**:
```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Cookie: session=account_b_session
```

**Response**:
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "victim@test.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Step 2.2: IDOR Test (Account A)
1. Login to Account A (attacker)
2. Replay same request with Account A's session
3. **Critical**: Replace session cookie, keep victim's UUID in path
4. Check response for victim's data

**Example**:
```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Cookie: session=account_a_session
```

**Expected (Secure)**:
```json
{
  "error": "Unauthorized",
  "message": "You do not have permission to access this resource"
}
```

**Vulnerable (IDOR)**:
```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "victim@test.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Step 2.3: Validate Data Leakage
If 200 OK received, check for:
- [ ] Victim's email present
- [ ] Victim's phone number present
- [ ] Victim's name present
- [ ] Any PII that identifies victim
- [ ] Sensitive data (payment info, documents, orders)

**Severity Scale**:
- **Critical**: Payment info, SSN, passwords
- **High**: Email, phone, full name, order history
- **Medium**: Public profile data (username, bio)
- **Low**: Non-sensitive metadata

---

## Phase 3: Mutation Testing (Write Operations)

### Step 3.1: Test Modifications
Using Account A session, attempt to modify Account B resources:

**Examples**:
```http
PATCH /api/users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Cookie: session=account_a_session
Content-Type: application/json

{
  "firstName": "Hacked",
  "lastName": "ByAttacker"
}
```

```http
POST /api/users/550e8400-e29b-41d4-a716-446655440000/documents HTTP/1.1
Cookie: session=account_a_session
Content-Type: multipart/form-data

[malicious file upload]
```

### Step 3.2: Validate Changes Persisted
- [ ] Login to Account B
- [ ] Check if modifications visible
- [ ] If yes: **Critical severity** (data tampering + IDOR)

---

## Phase 4: GraphQL IDOR Testing

### Step 4.1: Extract Operations
From JS bundles or introspection:
```graphql
query GetUserProfile($uuid: String!) {
  user(uuid: $uuid) {
    uuid
    email
    phone
    orders {
      id
      total
      items
    }
  }
}
```

### Step 4.2: Test with Victim UUID
Using Account A session:
```bash
curl https://api.target.com/graphql \
  -H "Cookie: session=account_a_session" \
  -d '{
    "operationName": "GetUserProfile",
    "query": "query GetUserProfile($uuid: String!) { user(uuid: $uuid) { email phone } }",
    "variables": {"uuid": "550e8400-e29b-41d4-a716-446655440000"}
  }'
```

### Step 4.3: Check for Batch IDOR
Test if mutations accept arrays:
```graphql
mutation UpdateUsers($users: [UserInput]!) {
  updateUsers(input: $users) {
    success
  }
}
```

**Variables**:
```json
{
  "users": [
    {"uuid": "victim-1-uuid", "firstName": "Hacked"},
    {"uuid": "victim-2-uuid", "firstName": "Hacked"}
  ]
}
```

---

## Phase 5: Edge Cases & Variations

### Variation 1: Numeric ID Enumeration
If IDs are sequential integers (not UUIDs):
- [ ] Increment/decrement ID: `/api/users/123` → `/api/users/124`
- [ ] Attempt batch enumeration (automate with script)

**Anti-Pattern**: Don't brute-force UUIDs (2^122 space, not feasible)

### Variation 2: Indirect IDORs
Resources referenced by relationships:
```
GET /api/me/orders/456
→ Returns order belonging to Account B (checked order ID, not user ownership)
```

### Variation 3: Blind IDORs
No visible data leak, but operation succeeds:
```
POST /api/users/[victim-uuid]/delete
→ HTTP 200, but no confirmation message
→ Check if victim's account actually deleted
```

### Variation 4: Business Logic IDORs
Multi-tenant apps with org_id:
```
GET /api/organizations/[org-a]/users
→ Using org-b credentials
→ Leaks user list from different organization
```

---

## Phase 6: Automation

### Tool: IDOR Tester Script
```python
# From .github/tools/idor-tester.py
from testing.idor_tester import IDORTester

tester = IDORTester(
    attacker_session={'cookies': {'session': 'account_a_cookie'}},
    victim_data={'uuid': 'victim-uuid', 'email': 'victim@test.com'}
)

# Test batch of endpoints
endpoints = [
    'https://api.target.com/users/{uuid}',
    'https://api.target.com/users/{uuid}/orders',
    'https://api.target.com/users/{uuid}/payments'
]

for endpoint in endpoints:
    tester.test_endpoint(endpoint, method='GET')

# Save results
tester.save_findings('findings/idor-results.json')
```

---

## Common False Positives

### False Positive 1: Public Profile Data
- Response contains only public info (username, bio, avatar)
- **Not an IDOR** if data is intentionally public

### False Positive 2: Cached Responses
- Response shows victim's data, but from cache (CDN, browser)
- Verify by clearing cache, using different browser

### False Positive 3: Shared Resources
- Multi-tenant apps may intentionally share some resources
- Check if data sharing is documented feature

---

## CVSS Scoring

**Base Score Components**:
- **Attack Vector**: Network (N)
- **Attack Complexity**: Low (L)
- **Privileges Required**: Low (L) — Requires account
- **User Interaction**: None (N)
- **Confidentiality Impact**: High (H) — PII leakage
- **Integrity Impact**: None/Low (N/L) — Read-only IDOR
- **Availability Impact**: None (N)

**Typical CVSS**: 7.0-8.5 (High)
**With write access**: 8.5-9.0 (Critical)

---

## Remediation Recommendations

For report submission:

```markdown
## Recommended Fix

Implement authorization checks before returning user resources:

```python
def get_user_profile(user_uuid):
    # Get requesting user from session
    requesting_user = get_current_user()
    
    # Authorization check
    if requesting_user.uuid != user_uuid:
        if not requesting_user.is_admin():
            raise UnauthorizedException("Cannot access other users' profiles")
    
    # Fetch and return data
    return User.query.get(user_uuid)
```

**Additional Controls**:
1. Use indirect references (session-based lookups, not direct IDs)
2. Implement RBAC (Role-Based Access Control)
3. Log all access attempts for audit trail
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Endpoints tested | 15-20 per program |
| Time per endpoint | 2-5 minutes |
| False positive rate | <20% |
| True positive rate | 5-15% (mature programs) |

---

## Limitations

**When IDOR Testing Fails**:
- UUIDs are truly random (v4) → Not enumerable
- Access control is well-implemented
- All endpoints require proper authorization

**Alternative Strategies**:
- Look for UUID leaks (error messages, logs, URLs)
- Test business logic flaws instead
- Focus on auth bypass vulnerabilities

---

## References

- **OWASP**: [Insecure Direct Object References](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
- **CWE-639**: Authorization Bypass Through User-Controlled Key
- **PortSwigger**: [Access Control Vulnerabilities](https://portswigger.net/web-security/access-control)

---

## Changelog

- **2025-12-06**: Created from Uber sprint patterns (IDOR testing framework)
- **Future**: Add automated multi-account testing, indirect IDOR detection

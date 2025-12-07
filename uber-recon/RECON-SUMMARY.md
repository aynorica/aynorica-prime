# Uber Recon Summary — Phase 1 Complete

**Date**: 2025-12-06  
**Last Updated**: 2025-12-07  
**Scope**: Core Uber domains

---

## Submission History

| Report ID | Title | Status | Submitted | Closed | Notes |
|-----------|-------|--------|-----------|--------|-------|
| #3454674 | Account Takeover via unverified email OTP + 2FA Bypass | **Informative** | 2025-12-06 | 2025-12-07 | Uber's position: "Session required = already compromised". Does NOT accept session→permanent ATO escalation or 2FA bypass as significant. |

### Lessons Learned (Report #3454674)

1. **Uber requires a session-obtaining vector** — They won't accept findings that start with "attacker has session cookies"
2. **2FA bypass alone is not enough** — They consider 2FA as defense-in-depth, not a hard requirement for account changes
3. **Chain required** — Need XSS/CSRF/phishing to obtain session, THEN chain to ATO for acceptance
4. **Future approach**: Find the initial access vector first, then chain with account takeover

### What Would Work

- XSS on any `*.uber.com` → session theft → email change → permanent ATO (full chain)
- CSRF on email change endpoint (if no CSRF protection)
- Subdomain takeover → cookie scope abuse → session theft → ATO

---

## Asset Discovery

| Metric | Count |
|--------|-------|
| Official Uber domains | 1,463 |
| Core domains targeted | 13 |
| Subdomains discovered | 11,666 |
| Live HTTP services | 169 |
| Priority targets | 23 |

## High-Value Targets Identified

### Auth/API (IDOR, Auth Bypass potential)
- `api.uber.com` — Main API
- `auth.uber.com` — Authentication
- `auth-preprod.uberinternal.com` — Preprod auth (staging bugs!)
- `auth-staging.uber.com` — Staging environment
- `accounts.uber.com` — Account management

### Internal Tools (High value, often less hardened)
- `admindevices.uberinternal.com` — Device admin
- `arize.uberinternal.com` — AI/ML platform (Arize AI)
- `blogadmin.uberinternal.com` — Blog admin (PHP/Pantheon stack)

### Business Portals (IDOR goldmine per plan)
- `biz.uber.com` — Uber for Business
- `biz-eats.uber.com` — UberEats business
- `academyforbusiness.uber.com` — Training portal
- `advertiser.uber.com` — Ads platform

### Tech Stack Insights
- Primary: Google Cloud, Cloudflare, Envoy proxy
- Some AWS CloudFront usage
- `blogadmin.uberinternal.com` runs PHP/Pantheon (older stack)
- `base.uber.com` runs Ruby on Rails

## Nuclei Results
- Passive scan: 0 findings (expected for mature program)
- Next: Manual testing required

## Next Steps (Phase 2: Hunt — UPDATED)

**Priority Shift**: Based on informative closure, focus on finding **initial access vectors**:

1. [ ] **XSS hunting** — Test input reflection on business portals, error pages, search params
2. [ ] **CSRF on sensitive endpoints** — Check if email/password change has CSRF tokens
3. [ ] **Subdomain takeover** — Check dangling CNAMEs in `all-subdomains.txt`
4. [ ] IDOR in business portals (`biz.uber.com`, `advertiser.uber.com`)
5. [ ] Test auth flows (auth-preprod, auth-staging)
6. [ ] Explore `arize.uberinternal.com` (AI platform)

**Goal**: Find session-obtaining bug → chain with known ATO flow → resubmit as full chain


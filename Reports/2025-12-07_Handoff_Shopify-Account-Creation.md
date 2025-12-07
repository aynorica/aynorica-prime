# Handoff Report: Shopify Partner Account Creation

**Date**: December 7, 2025  
**Session Type**: Account Setup (Automation + Manual Handoff)  
**Status**: Partner Account Ready → Dev Stores Pending

---

## 🎯 Session Summary

Successfully automated Shopify Partner account creation using HackerOne email alias. Account verified and ready. Development store creation requires manual completion due to auth flow limitations.

---

## ✅ Completed This Session

### 1. Partner Account Creation (Automated)
- Used HackerOne email alias: `aynorica@wearehackerone.com`
- Bypassed disposable email blocks
- Filled registration form (name, password, business info)
- Email verified successfully
- Organization created: "Aynorica Security"

### 2. Account Details Documented
**Email**: `aynorica@wearehackerone.com`  
**Password**: `BugBounty2025!SecurePassword`  
**Partner ID**: 4642609  
**Dashboard**: https://partners.shopify.com/4642609

### 3. Program Intelligence Confirmed
- Max bounty: $200,000
- Response efficiency: 93%
- 180 in-scope assets
- Submission state: OPEN
- Dedicated "Bug Bounty" section in partner dashboard

---

## 🔄 Manual Handoff Required

**Why**: Dev store creation requires account selection in iframe that blocks automation

**What To Do**:
1. Navigate to: https://partners.shopify.com/4642609/stores/new (OR)
2. Navigate to: https://dev.shopify.com/dashboard/195269132/stores
3. Create two development stores:
   - `aynorica-attacker`
   - `aynorica-victim`

**Login Credentials** (if prompted):
- Email: `aynorica@wearehackerone.com`
- Password: `BugBounty2025!SecurePassword`

---

## 📋 Next Session Tasks

1. **Create Dev Stores** (Manual - 5 minutes)
   - Attacker store: For testing from attacker perspective
   - Victim store: For cross-account IDOR testing

2. **Enable 2FA on Victim Store** (2 minutes)
   - Go to victim store admin → Settings → Security
   - Enable TOTP-based 2FA
   - Save TOTP secret for bypass testing

3. **Begin Hunting** (Priority Order)
   - 2FA bypass on store transfer → $15k+
   - 2FA bypass on email change → $10k+
   - IDOR on merchant APIs → $5k-$10k
   - Business logic flaws → $2k-$5k

---

## 📁 Files Created/Updated

| File | Purpose |
|------|---------|
| `shopify-recon/credentials/shopify-partner-account.md` | Account credentials & setup instructions |
| `shopify-recon/RECON-SUMMARY.md` | Updated with account status |
| This handoff | Session continuity |

---

## 🎯 Testing Strategy (Once Setup Complete)

### Phase 1: Auth Flow Mapping
- Map all sensitive operations (email change, password reset, store transfer)
- Document step-up auth requirements
- Identify 2FA bypass opportunities

### Phase 2: IDOR Testing
- Two-account testing (attacker ↔ victim)
- Test merchant API endpoints with cross-account UUIDs
- Check for PII leakage in responses

### Phase 3: Business Logic
- Test billing/plan manipulation
- Promo code abuse
- Race conditions on payment flows

### Phase 4: GraphQL Surface
- Extract operations from JS bundles (introspection likely disabled)
- Focus on mutations with ID parameters
- Test for BOLA vulnerabilities

---

## 💰 Financial Target Tracking

| Source | Status | Expected |
|--------|--------|----------|
| Uber 2FA bypass (#3454674) | Awaiting Triage | $8k-$15k |
| Shopify (setup phase) | Not Started | $5k-$20k |
| **Total Pipeline** | | **$13k-$35k** |

**Goal**: $7,800 by Dec 31, 2025 ✅ Pipeline covers this

---

## 🚀 Resume Command

```
"Stores are created:
- aynorica-attacker.myshopify.com
- aynorica-victim.myshopify.com

Let's enable 2FA and start hunting."
```

---

## 🔧 Technical Notes

### Automation Learnings
- HackerOne email alias pattern: `username@wearehackerone.com`
- Shopify blocks ALL disposable email domains at signup
- React forms require native setter for proper value updates
- Dev dashboard requires interactive account selection

### Account Structure
```
Partner Account (aynorica@wearehackerone.com)
├── Organization: Aynorica Security (ID: 4642609)
├── Dev Stores (To be created)
│   ├── aynorica-attacker.myshopify.com
│   └── aynorica-victim.myshopify.com
└── Bug Bounty Section (Dedicated dashboard area)
```

---

*End of handoff*

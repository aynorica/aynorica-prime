# Bug Bounty Session 7 - Final Handoff

## 🎯 Summary

Uber testing progressed with 2FA bypass report submitted (#3454674). Explored additional attack surfaces including GraphQL, business logic, and promo code enumeration. Shopify pivot initiated but paused pending test store setup.

## 📊 Active Reports

| Program | Report ID | Status | Vulnerability | Expected Payout |
|---------|-----------|--------|---------------|-----------------|
| Uber | #3454674 | New (Awaiting Triage) | 2FA Bypass (Email/Password/Payment) | $8,000 - $15,000 |

## 🔍 Uber Findings This Session

### Confirmed: Promo Code Enumeration (Low-Medium)

**Endpoint**: `POST https://m.uber.com/go/graphql`

| Response | Interpretation |
|----------|----------------|
| "Promotion has expired" | Valid code (existed) |
| "Promotion code is not valid" | Never existed |

**Expired codes found**: UBER2024, DISCOUNT50, NEWUSER, FIRSTRIDE, WELCOME10, SAVE20

**Rate limiting**: ~7 requests before `TooManyRequests`

**Severity**: Low-Medium (not worth separate report, but documents attack surface)

### Tested & Dead Ends

| Test | Result |
|------|--------|
| GraphQL Introspection | Disabled (Apollo production) |
| Business Portal | Requires corporate email |
| Driver Portal | Requires phone verification |
| IDOR via UUID | No user-lookup queries found |
| Uber Eats SSO | Session doesn't carry |

## 📋 Next Steps

### Option A: Wait for Uber Report Triage
- Monitor #3454674 for response (expect 1-3 days based on 99% response rate)
- Prepare additional context if requested

### Option B: Set Up Shopify Testing
**Required Actions**:
1. Go to: `https://partners.shopify.com/signup/bugbounty`
2. Sign up with: `aynorica@wearehackerone.com`
3. Create a development store
4. Share store URL for testing

**Shopify Program Details**:
| Key | Value |
|-----|-------|
| Max Bounty | $200,000 |
| Response Rate | 93% |
| In-Scope Assets | 180 (*.shopify.com, *.myshopify.com, shop.app) |
| Test Rule | Must use stores YOU created via partner signup |

### Option C: Continue Uber with Second Account
**Needed**:
- Real phone number for driver portal
- Corporate email for business portal
- Second rider account for IDOR testing

## 🗂️ Files Created This Session

| File | Purpose |
|------|---------|
| `uber-recon/findings/2025-12-06-session7-promo-enum.md` | Promo code enumeration details |
| `Reports/2025-12-06_Handoff_Uber-Bug-Bounty-Phase7.md` | Uber session handoff |

## 🔐 Session State

### Uber
- **Authenticated**: m.uber.com (via `2fabypasstest@sharklasers.com`)
- **2FA**: Enabled (TOTP: `T6ED2EATXKUF2X325BTTHWXOGOF2IQHP`)
- **User UUID**: `0f9ac5ed-40a0-45e9-a97d-a8028c953566`

### Shopify
- **Status**: Not set up
- **Required**: Partner account + development store

## 💰 Financial Target Tracking

| Target | Progress | Deadline |
|--------|----------|----------|
| $7,800 | $0 (pending triage) | Dec 31, 2025 |

**Path to target**:
- Uber 2FA bypass: $8,000-15,000 (if triaged as valid)
- Shopify backup: High payouts available

---

*Handoff created: 2025-12-06*

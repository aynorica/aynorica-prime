# Shopify Recon Summary

**Target**: `*.shopify.com`, `*.myshopify.com`
**Start Date**: 2025-12-06
**Last Updated**: 2025-12-07

## Status
- [x] Plan Loaded
- [x] Partner Account Created & Verified
- [ ] Development Stores Created (Manual Step Required)
- [ ] 2FA Setup
- [ ] Active Testing

## Partner Account

**Email**: `aynorica@wearehackerone.com`
**Partner ID**: 4642609
**Dashboard**: https://partners.shopify.com/4642609
**Status**: ✅ Active & Verified

**Credentials**: See `shopify-recon/credentials/shopify-partner-account.md`

## Next Session Actions

### 1. Create Development Stores (Manual)

**Option 1 - Partners Dashboard**: https://partners.shopify.com/4642609/stores/new
**Option 2 - Dev Dashboard**: https://dev.shopify.com/dashboard/195269132/stores

**Required Stores**:
- `aynorica-attacker.myshopify.com` (Attacker perspective)
- `aynorica-victim.myshopify.com` (Victim testing)

### 2. Enable 2FA on Victim Store

Once stores created:
1. Log in to victim store admin
2. Settings → Security → Enable TOTP 2FA
3. Save TOTP secret

### 3. Begin Testing

**Priority Attack Surfaces**:
1. 2FA bypass on store transfer (Critical - $15k+)
2. 2FA bypass on email change (Critical - $10k+)
3. IDOR on merchant APIs (High - $5k-$10k)
4. Business logic on billing (Medium - $2k-$5k)

## Program Intelligence

**Max Bounty**: $200,000
**Response Rate**: 93%
**In-Scope Assets**: 180
**Submission State**: OPEN
**Policy**: Requires `@wearehackerone.com` email for signup

## Assets
- **Domains**: `shopify-recon/domains/subdomains_passive.txt`
- **Credentials**: `shopify-recon/credentials/shopify-partner-account.md`
- **Methodologies**: Loaded from `.github/prompts/bugbounty/`

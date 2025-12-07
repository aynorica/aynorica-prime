# Shopify Partner Account Credentials

**Created**: December 7, 2025

## Partner Account

**Email**: `aynorica@wearehackerone.com`  
**Password**: `BugBounty2025!SecurePassword`  
**Name**: Amir Deilamizadeh  
**Organization**: Aynorica Security  
**Partner ID**: 4642609

**Partner Dashboard**: https://partners.shopify.com/4642609

## Account Status

✅ Partner account created  
✅ Email verified  
✅ Organization created

## Next Steps (Manual)

### Create Development Stores

We need two development stores for testing:

1. **Attacker Store**: `aynorica-attacker.myshopify.com`
   - Purpose: IDOR testing, attacker perspective
   
2. **Victim Store**: `aynorica-victim.myshopify.com`
   - Purpose: Victim account for IDOR/auth testing

### How to Create Stores

**Option 1: Via Partners Dashboard**
1. Go to: https://partners.shopify.com/4642609/stores
2. Click "Create a store"
3. Fill in store name
4. Select location (Türkiye)
5. Submit

**Option 2: Via Dev Dashboard** (Recommended for testing)
1. Go to: https://dev.shopify.com/dashboard/195269132/stores
2. Select account: Amir Deilamizadeh (aynorica@wearehackerone.com)
3. Create development stores

## 2FA Setup (After Stores Created)

Once stores are created:

1. Log in to victim store admin
2. Go to Settings → Security
3. Enable two-factor authentication (TOTP)
4. Save TOTP secret for testing
5. Document in this file

## Testing Workflow

With stores created:
- Test auth flows between stores
- IDOR testing (cross-account access)
- 2FA bypass testing per methodology
- Business logic flaw testing

---

## Notes

- HackerOne email alias forwards to: amirdeilamizadeh1996@gmail.com
- Partner account has "Bug Bounty" section in navigation
- Max bounty: $200,000
- Program response rate: 93%

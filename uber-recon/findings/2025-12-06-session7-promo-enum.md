# Session 7 - Promo Code Enumeration Finding

**Date**: 2025-12-06
**Target**: m.uber.com/go/promos
**Severity**: Low-Medium

## Summary

The promo code validation endpoint returns differentiated error messages that allow attackers to enumerate valid/expired promo codes.

## Technical Details

### Endpoint
```
POST https://m.uber.com/go/graphql
```

### GraphQL Mutation
```graphql
mutation ApplyPromoCode($promotionCode: String!) {
  applyPromoCode(promotionCode: $promotionCode) {
    promotionApplied
    __typename
  }
}
```

### Differentiated Responses

| Response Message | Interpretation |
|-----------------|----------------|
| "Promotion has expired" | Code exists/existed (valid) |
| "Promotion code is not valid" | Code never existed (invalid) |
| "TooManyRequests" | Rate limited |

### Discovered Valid Codes (Expired)
- UBER2024
- DISCOUNT50
- NEWUSER
- FIRSTRIDE
- WELCOME10
- SAVE20
- TESTPROMO123

### Rate Limiting
- Threshold: ~7 requests before blocking
- Reset time: Unknown (requires testing)
- Bypass potential: Header rotation, session rotation

## Impact

1. **Promo Code Enumeration**: Attackers can identify valid promo code patterns
2. **Business Intelligence Leak**: Reveals marketing campaign names
3. **Brute Force Potential**: With header rotation, could enumerate actively valid codes
4. **Financial Impact**: Valid active codes could be shared/abused

## Remediation

1. Return generic "Invalid or expired code" for all failures
2. Implement stricter rate limiting (3-5 requests/minute)
3. Add CAPTCHA after X failed attempts
4. Use cryptographically random code generation

## Severity Justification

**Low-Medium** because:
- Rate limiting exists (mitigates bulk enumeration)
- No direct financial exploitation proven
- Information disclosure is limited

Could escalate to **Medium** if:
- Active valid codes can be discovered
- Rate limit can be bypassed

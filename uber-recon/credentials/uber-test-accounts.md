# Uber Test Accounts

> **Purpose**: Test accounts for bug bounty testing on Uber program.
> **Created**: 2025-12-06

---

## Account 1: Rider Account

| Field | Value |
|-------|-------|
| **Email** | `sgbusrqg@sharklasers.com` |
| **Name** | Aynorica Tester |
| **Account Type** | Rider |
| **Created** | 2025-12-06 |
| **Status** | ✅ Active |
| **Disposable Email Provider** | GuerrillaMail (sharklasers.com) |
| **Mobile** | Not added (skipped) |
| **Password** | None (email OTP login) |

### Access Method
- Email-based OTP authentication
- GuerrillaMail inbox: https://www.guerrillamail.com/ (enter `sgbusrqg` as username)

### Notes
- This account can access both Uber Rider and UberEats (unified login)
- Use for IDOR testing on business portals
- Add `X-Bug-Bounty: HackerOne-aynorica` header when testing

---

## Accounts To Create

| Type | Status | Notes |
|------|--------|-------|
| Driver Account | ❌ Not created | Requires drivers.uber.com, more verification |
| UberEats Restaurant | ❌ Not created | Requires merchants.ubereats.com |
| Uber for Business | ❌ Not created | Requires company email, biz.uber.com |

---

## Security Notes

- These are **test accounts** for authorized bug bounty testing only
- Uber bug bounty program: https://hackerone.com/uber
- Always follow Uber's testing guidelines
- Do not test on production user data

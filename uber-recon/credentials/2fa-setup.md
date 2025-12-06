# Uber 2FA Setup - Test Account A

## Account Details
- **Email**: ubertestp0c@guerrillamail.com
- **Password**: TestP@ss123!
- **UUID**: 0f9ac5ed-40a0-45e9-a97d-a8028c953566

## 2FA Configuration
- **Method**: Authenticator App (TOTP)
- **Secret Key**: `T6ED-2EAT-XKUF-2X32-5BTT-HWXO-GOF2-IQHP`
- **Enabled**: 2025-12-06 ~14:35 UTC

## Backup Codes
Each code can only be used once.

| Code | Used |
|------|------|
| 0903-6750 | ❌ |
| 6243-7502 | ❌ |
| 9182-2087 | ❌ |
| 9186-6512 | ❌ |
| 2648-0463 | ❌ |
| 9662-4717 | ❌ |
| 9344-1506 | ❌ |
| 3791-5014 | ❌ |

## Generate TOTP Code
```python
import base64, time, hmac, hashlib, struct
def totp(secret='T6ED2EATXKUF2X325BTTHWXOGOF2IQHP', digits=6, interval=30):
    key = base64.b32decode(secret, casefold=True)
    counter = int(time.time()) // interval
    msg = struct.pack('>Q', counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    offset = h[-1] & 0x0f
    code = struct.unpack('>I', h[offset:offset+4])[0] & 0x7fffffff
    return str(code % (10 ** digits)).zfill(digits)
print(totp())
```

## Test Scenarios
- [ ] OTP Reuse - Try using same TOTP code twice
- [ ] Response Manipulation - Intercept and modify 2FA success response
- [ ] Rate Limiting - Brute force OTP codes
- [ ] Backup Code Bypass - Test if backup codes can be brute forced
- [ ] Direct API Access - Access protected endpoints without 2FA

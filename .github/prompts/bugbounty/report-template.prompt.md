# HackerOne Report Writing Template & Best Practices

This guide provides a structured template and best practices for submitting high-quality vulnerability reports to HackerOne programs, with a specific focus on **Uber's** standards and preferences.

## 1. Report Structure Template

Use this markdown structure for your reports. It is designed to be concise, impact-focused, and easy for triagers to validate.

```markdown
# [Vulnerability Type] in [Asset/Domain] leading to [Specific Impact]

## Summary
**TL;DR:** A [Vulnerability Type] exists in [Component/Endpoint] that allows an attacker to [High-Level Impact].
*(Keep this to 1-2 sentences. Triagers read this first to gauge severity.)*

## Severity Justification
**CVSS Score:** [e.g., 7.5 (High)]
**Vector String:** [e.g., CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N]
**Impact Bucket:** [Select one from Uber's Policy: Exposure of User Data / Unauthorized Requests / Monetary Impact / Safety]
*(Explain WHY it deserves this severity based on the program's specific impact buckets.)*

## Steps to Reproduce
1.  Navigate to `https://target.com/...`
2.  Log in with User A (Attacker).
3.  Intercept the request to `POST /api/v1/update-profile`.
4.  Modify the `user_id` parameter to User B's ID (`12345`).
5.  Forward the request.
6.  Observe a `200 OK` response containing User B's private data.

## Proof of Concept (PoC)
### Request
```http
POST /api/v1/update-profile HTTP/1.1
Host: target.com
...
{"user_id": 12345, "email": "attacker@evil.com"}
```

### Response
```http
HTTP/1.1 200 OK
...
{"status": "success", "data": "Updated user 12345"}
```

*(Include screenshots or a link to a private video if the flow is complex. Do NOT use public video links.)*

## Impact
**Business Impact:**
This vulnerability allows any authenticated user to takeover any other user's account.
*   **Scale:** All 50M+ user accounts are at risk.
*   **Confidentiality:** Full access to PII (Name, Email, Payment History).
*   **Integrity:** Ability to modify account details and ride history.
*   **Financial:** Potential for fraud by charging rides to victim's saved cards.

## Remediation (Optional)
The application should verify that the `user_id` in the request body matches the `session_token` of the authenticated user. Implement an IDOR check on the backend.
```

---

## 2. Best Practices for Fast Payouts

### What Makes a Report Get Paid Fast?
1.  **Reproducibility**: If the triager can reproduce it in < 5 minutes, your report moves to "Triaged" instantly.
2.  **Clear Impact**: Don't just say "XSS". Say "XSS allows account takeover via session cookie theft."
3.  **Scope Alignment**: Explicitly state which "Impact Bucket" your bug falls into (especially for Uber).
4.  **Professionalism**: Be polite, concise, and objective.

### What Triagers Hate (Avoid These)
*   **Begging**: "Please give me a bounty" or "This is critical, pay me now."
*   **Theoreticals**: "This *might* be vulnerable if..." (Provide a working PoC).
*   **Automated Scanner Dumps**: Copy-pasting output from Burp/Nessus without validation.
*   **Video-Only Reports**: Always include text steps. Videos are supplementary.
*   **Public Links**: Never host PoCs on YouTube or public Gists. Use the report attachments.

### Framing Impact for Maximum Payout
*   **Chain it**: A low-severity Open Redirect becomes High severity if chained with an OAuth token leak.
*   **Show Scale**: Can you affect 1 user or *all* users?
*   **Monetary Value**: Can you ride for free? Can you drain credits? (Uber loves these).

---

## 3. Uber Specifics

Uber's program is mature and highly technical. They prioritize **impact** over technical severity.

### Uber's "Impact Buckets" (Critical for Severity)
Uber calculates bounties based on these specific categories. **Cite these in your report.**
1.  **Exposure of User Data**: PII, trip history, payment info.
2.  **Unauthorized Requests**: Acting on behalf of another user/driver.
3.  **Monetary Impact**: Fraud, free rides, bypassing payments.
4.  **Safety**: Physical safety of riders/drivers.

### Uber-Specific "Do's"
*   **Do** use their "SSRF Sheriff" service for testing SSRF (`http://dca11-pra.prod.uber.internal:31084/`).
*   **Do** use their Asset Recon endpoints to verify ownership (`https://appsec-analysis.uber.com/...`).
*   **Do** focus on logic flaws and fraud (e.g., promo code abuse, multi-account collusion).

### Examples of Good Uber Report Titles
*   *Weak*: "IDOR in API"
*   *Strong*: "IDOR on `/api/trips` allows viewing any rider's full trip history and PII"
*   *Weak*: "XSS on uber.com"
*   *Strong*: "Stored XSS in Driver Profile allows taking over Fleet Manager accounts"
*   *Weak*: "Promo code bug"
*   *Strong*: "Race Condition in Promo Code application allows unlimited $20 credits"

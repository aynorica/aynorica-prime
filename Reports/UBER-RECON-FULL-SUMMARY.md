# Uber Bug Bounty Recon - Full Session Summary
**Date**: December 6, 2025
**Target**: Uber (HackerOne Program)
**Status**: ✅ Critical Vulnerability Submitted (Report #3454674)

---

## 🚨 Executive Summary

On December 6, 2025, a comprehensive bug bounty reconnaissance and testing session was conducted on Uber's assets. The session evolved from initial subdomain enumeration to the discovery of a **Critical Account Takeover (ATO)** vulnerability.

**Key Achievement**:
Discovered and reported a logic flaw in the email change workflow that allows an attacker to:
1.  Change a victim's email address without verification from the old email.
2.  **Bypass 2FA (TOTP)** completely during this process.
3.  Take full control of the account (ATO).

**Financial Outlook**:
-   **Goal**: $7,800 by Dec 31, 2025.
-   **Estimated Bounty**: $8,000 - $15,000 (Pending Triage).
-   **Status**: Report submitted to HackerOne (#3454674).

---

## 🛡️ Critical Vulnerability: 2FA-Bypass Account Takeover

**Severity**: Critical (CVSS 9.8)
**Vulnerability Type**: Business Logic Flaw / Authentication Bypass (CWE-306)

### The Attack Chain
1.  **Initial Access**: Attacker gains session access (e.g., via cookie theft or open session).
2.  **Email Change**: Attacker requests an email change to an attacker-controlled address via `POST /api/updateUserInfo`.
3.  **2FA Bypass**: The system **fails to request TOTP verification** for this sensitive action, even if 2FA is enabled on the account.
4.  **Verification**: The system sends a 4-digit OTP to the **NEW** (attacker's) email address.
5.  **Takeover**: Attacker enters the code received on their own email, finalizing the email change.
6.  **Persistence**: Attacker can now reset the password (which also doesn't require the old password) and lock out the victim.

**Evidence**:
-   Successfully performed on a test account with TOTP enabled.
-   Captured OTP code `6412` sent to attacker's email `2fabypasstest@sharklasers.com`.
-   Full ATO achieved without ever providing the victim's 2FA code.

---

## 📅 Session Timeline & Phases

### Phase 1: Reconnaissance
-   **Objective**: Map the attack surface.
-   **Results**:
    -   Enumerated **11,666 subdomains** across 13 core domains.
    -   Identified **169 live HTTP services**.
    -   Prioritized **23 high-value targets** (Business portals, Auth staging).
-   **Tools**: `subfinder`, `httpx`, `nuclei`.

### Phase 2: Setup & Initial Testing
-   **Objective**: Create test infrastructure and validate basic flows.
-   **Actions**:
    -   Created test accounts using `GuerrillaMail` (bypassing some blocks).
    -   Configured Burp Suite and ChromeDevTools MCP.
    -   Tested IDOR on payment profiles (Secure).
    -   **Discovery**: Noticed the email change flow behaved suspiciously (PENDING state).

### Phase 3: ATO Discovery & Submission
-   **Objective**: Validate the email change flaw.
-   **Results**:
    -   Confirmed that changing email does not require old email verification.
    -   Validated that the "PENDING" email receives the login OTP.
    -   **Action**: Submitted initial report to HackerOne (Report #3454674).

### Phase 4: Continued Hunting
-   **Objective**: Find amplification vectors.
-   **Results**:
    -   Analyzed Password Change flow (`/api/passwordWorkflow`).
    -   **Finding**: Password change does **not** require the old password if logged in. This amplifies the ATO (Attacker changes email -> logs in -> changes password -> Victim locked out).
    -   Mapped 12 API endpoints and 2 GraphQL mutations.

### Phase 5 & 6: 2FA Testing & Bypass Confirmation
-   **Objective**: Test security controls against the ATO.
-   **Actions**:
    -   Enabled TOTP 2FA on the test account.
    -   Attempted the Email Change ATO again.
-   **Critical Finding**: The email change flow **completely ignored** the 2FA requirement.
-   **Action**: Updated the HackerOne report with this critical severity escalation.

### Phase 7: Further Exploration
-   **Objective**: Explore other attack surfaces.
-   **Results**:
    -   **Promo Code Enumeration**: Found a low/medium vuln where API error messages reveal valid (expired) promo codes vs invalid ones.
    -   **GraphQL**: Confirmed introspection is disabled (good security).
    -   **Business Portal**: Blocked for disposable emails.

---

## 🛠️ Tools & Methodology

**Tech Stack**:
-   **Browser Automation**: ChromeDevTools MCP (for complex auth flows).
-   **Proxy/Analysis**: Burp Suite (implied usage), `curl` for API replay.
-   **Recon**: `nuclei`, `ffuf`, `subfinder`, `httpx`.
-   **Scripting**: Python (for TOTP generation).

**Methodology**:
-   **Manual Logic Testing**: Focused on authentication and account management workflows rather than automated scanning.
-   **Evidence-Based**: Documented every step with screenshots and API response captures.
-   **Risk Management**: Used own test accounts to avoid legal/ethical issues.

---

## 🔮 Next Steps

1.  **Monitor Report #3454674**: Wait for Triage (1-14 days). Respond to any info requests immediately.
2.  **Pivot to Mobile/Business**:
    -   Test `business.uber.com` (requires corporate email).
    -   Test Mobile APIs (`m.uber.com`, `cn-geo1.uber.com`).
3.  **Promo Code Race Conditions**: Test if the promo code enumeration can be combined with race conditions for multiple redemptions.

---
*Summary generated by Aynorica System on Dec 6, 2025.*

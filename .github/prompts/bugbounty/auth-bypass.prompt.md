# Authentication Bypass Methodology

## 1. OAuth Vulnerabilities

### State Parameter Manipulation
- **Concept**: The `state` parameter is used to prevent CSRF attacks during the OAuth flow. If it's missing, predictable, or not validated by the client application, an attacker can trick a victim into linking their account to the attacker's account.
- **Testing Steps**:
    1.  Initiate the OAuth flow and capture the authorization URL.
    2.  Remove or modify the `state` parameter.
    3.  Check if the application accepts the callback without the state or with an invalid state.
    4.  Attempt to use a CSRF attack to force a victim to log in with the attacker's account.

### Redirect URI Manipulation
- **Concept**: The `redirect_uri` parameter tells the provider where to send the user after authentication. If the validation is weak (e.g., regex bypass, open redirect), an attacker can steal the authorization code or access token.
- **Testing Steps**:
    1.  Modify the `redirect_uri` in the authorization request.
    2.  Try variations like:
        -   `https://attacker.com`
        -   `https://vulnerable.com.attacker.com`
        -   `https://vulnerable.com/callback?next=https://attacker.com`
    3.  Observe if the provider redirects to the manipulated URI with the code/token.

### Token Leakage
- **Concept**: Access tokens or authorization codes can be leaked through `Referer` headers, browser history, or logs if not handled correctly.
- **Testing Steps**:
    1.  Check if the access token is passed in the URL fragment (`#`) or query parameter.
    2.  Inspect the `Referer` header when navigating away from the callback page.
    3.  Check if the token is stored insecurely in `localStorage` or `sessionStorage` (XSS risk).

## 2. 2FA/MFA Bypass

### Response Manipulation
- **Concept**: The application might rely on a client-side boolean or status code to verify 2FA success.
- **Testing Steps**:
    1.  Intercept the response from the 2FA verification endpoint.
    2.  Change the response body (e.g., `{"success": false}` to `{"success": true}`).
    3.  Change the HTTP status code (e.g., `403 Forbidden` to `200 OK`).
    4.  Forward the modified response and check if access is granted.

### Brute Force (Lack of Rate Limiting)
- **Concept**: 2FA codes (OTP) are often short (4-6 digits). Without rate limiting, an attacker can brute-force the code.
- **Testing Steps**:
    1.  Trigger a 2FA request.
    2.  Use Burp Intruder or a script to send multiple requests with different codes.
    3.  Check for rate limiting (e.g., blocking after N attempts) or lack thereof.
    4.  Look for race conditions that might allow multiple attempts before the limit kicks in.

### Direct Endpoint Access (Forced Browsing)
- **Concept**: The application might not enforce the 2FA check on all authenticated endpoints, or the "2FA pending" state might not block access to other API endpoints.
- **Testing Steps**:
    1.  Log in with the first factor.
    2.  When prompted for 2FA, try to navigate directly to `/dashboard`, `/profile`, or API endpoints.
    3.  Check if the session cookie issued after the first factor is sufficient for restricted actions.

## 3. Session Management

### Session Fixation
- **Concept**: The application allows an attacker to fix a session ID for a victim. When the victim logs in, the session ID remains the same, allowing the attacker to hijack the session.
- **Testing Steps**:
    1.  Obtain a valid session ID (e.g., by visiting the login page).
    2.  Force the victim to use this session ID (e.g., via a link `http://example.com/?PHPSESSID=attacker_session`).
    3.  Wait for the victim to log in.
    4.  Use the known session ID to access the victim's account.

### Predictable Tokens
- **Concept**: Session tokens are generated using weak algorithms or predictable values (e.g., sequential numbers, timestamps).
- **Testing Steps**:
    1.  Collect a sample of session tokens.
    2.  Analyze the tokens for patterns or randomness (entropy).
    3.  Attempt to predict the next valid token or brute-force the token space.

### Lack of Expiration
- **Concept**: Session tokens do not expire after logout or a period of inactivity.
- **Testing Steps**:
    1.  Log in and capture the session token.
    2.  Log out of the application.
    3.  Attempt to use the captured token to access authenticated endpoints.
    4.  Check if the token remains valid indefinitely or for an excessive period.

## 4. Uber Specifics

### Phone-based Auth (SMS/OTP)
- **Context**: Uber relies heavily on phone numbers for user identity.
- **Testing Focus**:
    -   **OTP Interception**: Check if OTPs are leaked in responses or logs.
    -   **Simultaneous Login**: Attempt to log in with the same phone number from multiple devices/locations to test race conditions.
    -   **Number Change**: Test the flow for changing a phone number. Can you change it to a number already associated with another account?

### Account Linking (Google, Apple, Facebook)
- **Context**: Uber allows users to sign in via social providers.
- **Testing Focus**:
    -   **Account Takeover**: Can you link a social account to a victim's Uber account without proper verification?
    -   **Email Mismatch**: What happens if the email on the social account differs from the Uber account?
    -   **Unlinking**: Can an attacker unlink the victim's primary authentication method?

### Driver vs Rider Auth Separation
- **Context**: Uber has distinct apps and APIs for Drivers and Riders, but they often share backend services.
- **Testing Focus**:
    -   **Privilege Escalation**: Can a Rider account access Driver APIs?
    -   **Cross-Role IDOR**: Can a Driver view Rider data (beyond their assigned trips) or vice versa?
    -   **Session Reuse**: Can a valid Rider session token be used to authenticate against the Driver API?

### Session Handling Across Apps (Uber, UberEats, Driver)
- **Context**: Uber's ecosystem includes multiple apps (Rides, Eats, Freight).
- **Testing Focus**:
    -   **SSO Behavior**: How does logging into UberEats affect the main Uber app session?
    -   **Token Scope**: Does a token generated for UberEats grant access to ride history in the main app?
    -   **Logout Consistency**: Does logging out of one app invalidate sessions in others?

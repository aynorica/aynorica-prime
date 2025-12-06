# Burp Suite Methodology for Bug Bounty

This guide outlines a comprehensive methodology for using Burp Suite in bug bounty hunting, focusing on core features, essential extensions, and efficient workflows.

## 1. Core Features

### Repeater
Repeater is the manual manipulation tool for modifying and resending individual HTTP requests.
-   **Tab Groups**: Organize requests by functionality or vulnerability type (e.g., "Auth Bypass", "SQLi"). Use `Ctrl+Shift+G` to group selected tabs. This keeps the workspace clean during deep dives.
-   **Parallel Sending**: Essential for testing race conditions. Group the requests you want to race, select "Send group in parallel" (single-packet attack) to test for limit overruns or logic flaws.

### Intruder
Intruder is used for automated attacks. Understanding the attack types is crucial:
-   **Sniper**: Uses a single payload set. It places each payload into each position in turn. Useful for fuzzing multiple parameters with the same wordlist individually.
-   **Battering Ram**: Uses a single payload set. It places the same payload into all positions simultaneously. Useful for testing if a specific value needs to be reflected in multiple places (e.g., user ID in URL and body).
-   **Pitchfork**: Uses multiple payload sets. It iterates through payload sets simultaneously (e.g., payload 1 from set A goes with payload 1 from set B). Useful for credential stuffing (username/password pairs).
-   **Cluster Bomb**: Uses multiple payload sets. It iterates through every combination of payloads (Cartesian product). Useful for brute-forcing where every variable must be tested against every other variable.

### Match and Replace
Located in `Proxy > Match and Replace`, this feature automatically modifies requests and responses on the fly.
-   **Bypassing WAFs**: Automatically replace `User-Agent` headers or add headers like `X-Forwarded-For: 127.0.0.1` to every request.
-   **Forcing JSON**: Change `Content-Type: application/x-www-form-urlencoded` to `Content-Type: application/json` to test if the backend parses JSON differently or is vulnerable to prototype pollution.
-   **Downgrading HTTPS**: Strip `Strict-Transport-Security` headers in responses to facilitate SSL stripping attacks (though less common now).

## 2. Essential Extensions (BApp Store)

### Autorize
**Purpose**: Automated authorization enforcement detection.
-   **Workflow**: Login as a high-privileged user (Admin) and capture the session cookie. Configure Autorize with a low-privileged user's cookie (or no cookie). Browse the app as Admin. Autorize repeats every request with the low-privileged cookie.
-   **Analysis**: Look for "Bypassed" (Green) or "Is Enforced" (Red) status. Verify "Bypassed" results manually to confirm IDORs or privilege escalation.

### Turbo Intruder
**Purpose**: Extremely fast HTTP fuzzing via a custom HTTP stack.
-   **Use Case**: Race conditions, brute-forcing directories, or sending millions of requests that standard Intruder cannot handle.
-   **Scripting**: Uses Python snippets to control the attack logic, allowing for complex conditions (e.g., "stop if 200 OK is received").

### Logger++
**Purpose**: Advanced logging of all Burp traffic.
-   **Advantage**: Unlike the standard HTTP history, Logger++ logs traffic from *all* tools (Scanner, Intruder, Repeater, Extensions).
-   **Filtering**: Powerful SQL-like filtering syntax to find specific requests lost in the noise.

### JSON Web Token (JWT) Attacker / JWT Editor
**Purpose**: Testing JWT security.
-   **Attacks**: Automates common JWT vulnerabilities like "None" algorithm, key confusion (HMAC vs RSA), and brute-forcing weak secrets.
-   **Workflow**: Highlight the JWT in Repeater, switch to the extension tab, modify claims (e.g., `role: admin`), resign, and send.

## 3. Workflow

### Proxying Traffic
-   **Browser**: Use FoxyProxy or the built-in Burp Chromium browser. Ensure the CA certificate is installed in the trusted root store to inspect HTTPS traffic.
-   **Mobile**:
    -   Configure the mobile device wifi proxy to point to Burp's listener (e.g., laptop IP on port 8080).
    -   Install the Burp CA cert on the device.
    -   **SSL Pinning**: Use Frida with scripts like `frida-tools` or `objection` to bypass SSL pinning on Android/iOS apps to see the traffic.

### Scope Management
-   **Advanced Scope Control**: Define the target scope in `Target > Scope`. Use "Include in scope" for the specific domain (e.g., `.*\.target\.com$`).
-   **Exclusion**: Crucial for staying within ROE. Exclude logout endpoints, third-party analytics (Google Analytics, New Relic), and out-of-scope subdomains.
-   **Filter**: In `Proxy > HTTP History`, click the filter bar and select "Show only in-scope items" to reduce noise.

### Search
-   **Regex Search**: Use `Ctrl+F` in HTTP history or Repeater.
-   **Context**: Search for specific keywords like `API_KEY`, `secret`, `password`, or specific error messages across the entire session history.
-   **Hex Search**: Useful when looking for binary patterns or specific byte sequences in responses.

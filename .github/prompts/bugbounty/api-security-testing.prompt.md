---
description: "Methodology for API Security Testing, focusing on enumeration, BOLA, Mass Assignment, and Uber specifics."
---

# API Security Testing Methodology

> **Goal**: Uncover hidden endpoints, authorization flaws, and logic bugs in API implementations.

## 1. Enumeration

Finding hidden API endpoints is the first step.

### Techniques
-   **Fuzzing**:
    -   **Wordlists**: Use `Assetnote Wordlists` or `SecLists` (API section).
    -   **Tools**: `ffuf`, `gobuster`, `kiterunner`.
    -   **Strategy**: Fuzz for versions (`/v1`, `/v2`, `/beta`), objects (`/user`, `/account`), and actions (`/create`, `/debug`).
-   **JavaScript Analysis**:
    -   Search source code for `fetch(`, `axios`, and regex paths like `"/api/v1/..."`.
    -   Extract endpoints from webpack bundles.
-   **Mobile App Traffic**:
    -   Proxy mobile traffic (Rider, Driver, Eats) through Burp.
    -   Look for endpoints NOT used by the web app.
    -   *Note*: May require SSL pinning bypass (Frida/Objection).

## 2. Vulnerabilities

### Mass Assignment (Auto-Binding)
-   **Concept**: Injecting fields that shouldn't be modifiable.
-   **Testing**:
    -   Capture `POST`/`PUT` requests (e.g., profile update).
    -   Add sensitive parameters to JSON body:
        -   `"isAdmin": true`, `"role": "admin"`
        -   `"is_partner": true`, `"wallet_balance": 999999`
    -   Check if changes persist or affect privileges.

### BOLA (Broken Object Level Authorization)
-   **Concept**: IDOR in API context. Accessing other users' resources via ID manipulation.
-   **Testing**:
    -   Identify resources accessed by ID (e.g., `/api/trips/12345`).
    -   Use User A's session to request User B's ID (e.g., `/api/trips/67890`).
    -   *Uber Note*: If IDs are UUIDs, look for UUID leaks in other endpoints first.

### Information Disclosure
-   **Concept**: API returning more data than the UI displays.
-   **Testing**:
    -   Inspect full JSON response of *every* call.
    -   Look for PII (emails, phone numbers) or internal data (`is_admin` flags, internal IPs).

## 3. Uber-Specifics

### Structure
-   **Main API**: `api.uber.com`
-   **Domains**: `*.uber.com`, `*ubereats.com`, `*.uberinternal.com` (Internal).
-   **Protocols**: Mobile apps often use Thrift/Protobuf alongside JSON.

### Recon Resources
-   **Asset Lists**: `https://appsec-analysis.uber.com/public/bugbounty/ListDomains`
-   **SSRF Sheriff**: `http://dca11-pra.prod.uber.internal:31084/<handle>@wearehackerone.com` (Use to prove SSRF safely).

### GraphQL
-   Common endpoint: `*.uber.com/graphql`.
-   **Checks**:
    -   Introspection enabled? (Dump schema).
    -   Batching attacks (DoS/Brute force).

## 4. Tools

### Kiterunner
-   **Usage**: `kr scan https://api.uber.com -w routes-large.kite`
-   **Why**: Uses "routes" datasets to find full paths, not just words.

### Arjun
-   **Usage**: `arjun -u https://api.uber.com/endpoint`
-   **Why**: Finds hidden query parameters (e.g., `?debug=true`).

### Burp Extensions
-   **Autorize**: Automates BOLA testing.
-   **Logger++**: Enhanced visibility.

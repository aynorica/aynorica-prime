---
description: "Comprehensive guide for hunting IDOR vulnerabilities, with specific focus on Uber's attack surface."
---

# IDOR Hunting Methodology

> **Goal**: Identify and exploit Insecure Direct Object References to access or modify unauthorized data.

## 1. Parameter Identification

Scan requests for these common identifiers. In Uber's context, prioritize UUIDs.

### Common Parameters
- `id`, `user_id`, `account_id`, `member_id`
- `profile_id`, `group_id`, `org_id`, `business_id`
- `order_id`, `trip_id`, `invoice_id`, `transaction_id`
- `report_id`, `document_id`, `file_id`

### Uber-Specific Parameters
- `uuid`, `driver_uuid`, `rider_uuid`, `job_uuid`
- `restaurant_uuid`, `store_uuid`
- `program_id` (Vouchers), `campaign_id`
- `policy_id` (Uber for Business)

## 2. Enumeration Strategy

### Sequential vs. UUID
- **Sequential**: Increment/decrement (e.g., `1001` -> `1002`). Check for patterns like `ORD-2023-001`.
- **UUIDs**: **Critical for Uber**. You cannot brute-force these. You must find a **leak**.
    - **Response Leaks**: Check API responses for other users' UUIDs (e.g., "Recommended Friends", "Shared Rides").
    - **Error Messages**: Trigger errors to reveal expected UUID formats or valid UUIDs.
    - **Public Profiles**: Scrape public URLs.

### Encoded IDs
- Always check for Base64, Hex, or URL-encoded values.
- Example: `dXNlcl8xMjM=` -> `user_123`.

## 3. Bypass Techniques

If a simple ID swap returns `403 Forbidden`, try these bypasses:

1.  **HTTP Method Manipulation**:
    - Change `GET` to `POST`, `PUT`, `DELETE` (or vice-versa).
    - Try `HEAD` or `OPTIONS`.
2.  **Parameter Pollution**:
    - `id=victim_id&id=attacker_id`
    - `id=attacker_id&id=victim_id`
    - `id[]=victim_id`
3.  **Type Juggling / Format Changes**:
    - Change `Content-Type`: `application/json` <-> `application/x-www-form-urlencoded`.
    - JSON: `{"id": 123}` vs `{"id": "123"}`.
    - Wildcards: `*`, `%`.
4.  **ID Replacement**:
    - Replace ID in URL path (`/users/123/data`) AND request body (`{"id": "123"}`).
    - Wrap ID in JSON object: `{"id": {"id": "victim_id"}}`.

## 4. Uber-Specific Focus Areas

Based on disclosed reports:

-   **Uber for Business (U4B) & Vouchers**:
    -   Look for `program_id` or `policy_id`.
    -   Chain IDORs to view/modify program policies or employee PII.
-   **Cross-Tenant / Organization**:
    -   If in a "Team" or "Organization", try accessing resources of a *different* Organization.
-   **Restaurant/Eats Analytics**:
    -   Target `restaurant_id` or `store_uuid` in analytics dashboards.
-   **Cross-Context**:
    -   Can a Rider access Driver data?
    -   Can a Restaurant access another Restaurant's data?

## 5. Testing Workflow (The "Two-Account" Rule)

**ALWAYS use two accounts: Attacker (A) and Victim (B).**

1.  **Map**: Identify all endpoints taking an ID.
2.  **Capture**: Note down UUIDs/IDs for Victim B.
3.  **Test**: Use Attacker A's session (cookies/token) to request Victim B's ID.
4.  **Analyze**:
    -   **200 OK + Data**: Vulnerable.
    -   **403 Forbidden**: Try bypasses.
    -   **404 Not Found**: Resource might be checked, or ID is invalid.

## 6. Reporting Template

**Title**: IDOR in [Endpoint] allows [Impact]
**Severity**: High/Critical (if PII or Write access)

**Summary**:
An Insecure Direct Object Reference (IDOR) in `[Endpoint]` allows an attacker to [view/modify] [victim's data] by manipulating the `[parameter_name]` parameter.

**Steps to Reproduce**:
1.  Log in as User A (Attacker).
2.  Obtain the UUID of User B (Victim) via [method].
3.  Send a [GET/POST] request to `[URL]` with User A's session cookies.
4.  Replace `[parameter]` value with User B's UUID.
5.  Observe that the response contains User B's private data.

**Impact**:
This vulnerability allows an attacker to access sensitive PII (Name, Email, Phone) of any user, leading to a complete loss of confidentiality.

---
description: "Methodology for testing Race Conditions, focusing on single-packet attacks and Uber-specific scenarios."
---

# Race Condition Testing Methodology

> **Goal**: Exploit time-of-check to time-of-use (TOCTOU) flaws to bypass limits or corrupt state.

## 1. Vulnerable Operations

Focus on actions that involve state changes, limits, or financial transactions.

### Limit Bypass
- **Redemption**: Applying a single-use coupon, promo code, or gift card multiple times.
- **Withdrawals/Transfers**: Exceeding account balance by initiating multiple transfers simultaneously.
- **Voting/Rating**: Submitting multiple votes or ratings where only one is allowed.
- **Inventory**: Purchasing more items than available in stock.

### State Machine Bypasses
- **Step Skipping**: Completing a later step (e.g., payment) before an earlier step (e.g., validation) is finalized.
- **Object Masking**: Creating an object and simultaneously modifying it to bypass validation checks (e.g., changing email to admin during creation).

### 2FA/OTP Bypass
- **Brute Force**: Sending multiple guesses simultaneously to bypass rate limits.
- **Reuse**: Using the same OTP token for multiple actions before it is invalidated.

## 2. Testing Techniques

### Single-Packet Attack (HTTP/2)
**The Gold Standard**. Eliminates network jitter by packing multiple requests into a single TCP packet.

1.  **Pre-send**: Send all headers and 99% of the body for 20-30 requests.
2.  **Wait**: Allow the server to parse and prepare these requests.
3.  **Trigger**: Send the final byte for all requests in a single TCP packet.
4.  **Result**: Server processes all requests effectively at the exact same timestamp.

### Parallel Requests (Traditional)
- **Burp Suite Repeater**: Use "Send group in parallel" (Tab Groups).
- **Multi-threading**: Less reliable than single-packet due to network jitter, but useful if HTTP/2 is not supported.

## 3. Detection Indicators

- **Status Codes**: Multiple `200 OK` responses where you expect only one (e.g., one `200` and multiple `400`).
- **Body Content**: Variations in response body (e.g., "Coupon applied" appearing multiple times).
- **Timing**: Unusually long or short response times (indicates thread locking).
- **State Inconsistencies**: Negative balance, duplicate transaction logs, object count exceeding limits.

## 4. Uber-Specific Scenarios

Based on disclosed reports:

-   **Promo Code & Voucher Redemption**:
    -   Attempt to apply the same "new user" or "discount" code to a ride/order multiple times.
    -   *Goal*: Stack discounts or reuse single-use code.
-   **Ride Cancellation & Refunds**:
    -   Cancel a ride while simultaneously requesting a refund or disputing the charge.
    -   *Goal*: Refund valid ride or cancel without penalty.
-   **Payment Processing**:
    -   Switch payment profiles (Personal <-> Business) during trip or at payment authorization.
    -   *Goal*: Avoid charges or fail billing on both profiles.
-   **Driver/Rider Matching**:
    -   Accept a ride request from multiple driver accounts simultaneously.
    -   *Goal*: Denial of service or state corruption (multiple drivers assigned).

## 5. Tools

### Turbo Intruder (Burp Suite)
-   **Script**: `race-single-packet-attack.py` (built-in example).
-   **Usage**: Right-click request -> Extensions -> Turbo Intruder -> Send to Turbo Intruder. Select script, customize, attack.

### Burp Suite Repeater
-   **Usage**: Add requests to a Tab Group. Select "Send group in parallel" from the drop-down next to the Send button.

### Custom Scripts
-   Use `aiohttp` (Python) or `net/http` (Go) for complex logic (e.g., extracting token from one response to use in the race).

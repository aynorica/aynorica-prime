# Business Logic Flaws Methodology

## 1. Workflow Bypasses
Business logic often relies on a specific sequence of steps (e.g., Add to Cart -> Enter Shipping -> Enter Payment -> Confirm Order). Vulnerabilities arise when the application fails to enforce this sequence server-side.

### Methodology
*   **Skipping Steps**: Attempt to access the "Success" or "Confirmation" endpoint directly without completing the "Payment" step.
    *   *Technique*: Force browse to `/checkout/success`, `/order/confirmed`, or similar endpoints.
    *   *Technique*: Capture the request for the final step and replay it without the intermediate steps.
*   **Reordering Requests**: Execute steps out of order.
    *   *Example*: Initiating a refund before a payment is confirmed.
    *   *Example*: Adding items to a cart, proceeding to payment, then adding more expensive items to the cart in a separate tab before finalizing the payment.
*   **Parameter Tampering in Flows**:
    *   Check if the application relies on client-side flags like `isPaid=true` or `step=3`.
    *   Manipulate session tokens or cookies that might track progress.

## 2. Financial Logic
Financial applications must rigorously validate all monetary inputs. Flaws here can lead to direct financial loss.

### Methodology
*   **Price Manipulation**:
    *   Intercept the request adding an item to the cart or checkout.
    *   Modify the `price` parameter to a lower value (e.g., `0.01`, `1`, or even `0`).
    *   *Tip*: Check if the application validates the price against the database *at the time of payment processing*, not just when adding to the cart.
*   **Currency Confusion**:
    *   Change the currency code (e.g., `USD` to `EUR`, `INR`, or a lower-value currency) while keeping the numerical amount the same.
    *   *Tip*: Some gateways might process `100 INR` as `100 USD` if the currency param is tampered with but the backend assumes the default currency.
*   **Negative Values**:
    *   Enter negative quantities (e.g., `-1` items). If the logic is `price * quantity`, this results in a negative total, potentially crediting the user's account.
    *   *Tip*: Try this in refund flows or return requests as well.
*   **Decimal Precision Attacks**:
    *   Exploit rounding errors. If an item costs `0.33` and you buy `3`, does it charge `0.99` or `1.00`?
    *   Try sending values with excessive precision (e.g., `0.00000001` BTC) to see if they are rounded down to zero but still processed as a valid transaction.

## 3. Trust Boundaries
Identify where the server blindly trusts client input instead of validating it against a trusted source (database/session).

### Methodology
*   **Client-Side Validation Bypass**:
    *   Always use a proxy (Burp Suite) to modify data *after* client-side checks have passed.
    *   Remove `disabled` attributes from HTML inputs to submit read-only fields.
*   **IDOR in Business Functions**:
    *   Swap `user_id`, `order_id`, or `payment_profile_id` with another user's ID during critical actions.
    *   *Example*: Using another user's `paymentProfileUuid` to pay for your ride.
*   **Hidden Parameters**:
    *   Look for hidden fields like `admin=false`, `discount_applied=false`, or `role=user` and flip them.

## 4. Uber Specifics
Uber's complex ecosystem (Rides, Eats, Freight) involves real-time pricing, geolocation, and promotions, creating unique logic attack surfaces.

### Known & Theoretical Attack Vectors
*   **Ride Estimation vs. Actual Fare**:
    *   *Scenario*: The app calculates a fare estimate based on a route.
    *   *Attack*: Manipulate the drop-off location *during* the ride or change the route to a much longer one, checking if the upfront price lock remains valid or if the recalculation logic fails.
*   **Surge Pricing Manipulation**:
    *   *Scenario*: Surge pricing is based on demand in a specific geofence.
    *   *Attack*: Spoof GPS location to a non-surge area to lock in a price, then request the ride from the actual location (or vice versa for drivers to trigger surge).
*   **Promo/Discount Stacking**:
    *   *Scenario*: Applying multiple promo codes.
    *   *Attack*: Apply a promo code, remove it, apply a different one, and try to replay the "apply" request for the first one to see if they stack.
    *   *Attack*: Use a "First Ride Free" promo on a new account, but link it to an existing payment profile or device ID (testing device fingerprinting bypass).
*   **Cancellation Fee Logic**:
    *   *Scenario*: Fees are charged if a driver cancels after X minutes or if the rider cancels.
    *   *Attack*: Force a driver cancellation by making the pickup location inaccessible or manipulating communication to avoid the fee.
    *   *Attack*: Cancel immediately after the grace period ends and try to intercept/drop the fee charging request.
*   **Driver Earnings Calculation**:
    *   *Scenario*: Drivers are paid based on time and distance.
    *   *Attack*: Submit false GPS telemetry (simulated long route) to inflate the distance traveled for a trip.
*   **Payment Profile IDOR (Historical)**:
    *   *Reference*: "Changing paymentProfileUuid when booking a trip allows free rides at Uber" (Matthew Temmy).
    *   *Logic*: The application trusted the `paymentProfileUuid` sent by the client. An attacker could use a victim's UUID (if leaked or guessed) or a UUID representing a "corporate" account with permissive settings.
*   **Uber Eats "Free Food"**:
    *   *Reference*: "Uber Eat for Free".
    *   *Logic*: Often involves manipulating the cart total to 0 or negative, or cancelling the order at a specific race-condition window where the refund is processed but the food order is not cancelled at the restaurant.

### Sources & References
*   **PortSwigger Web Security Academy**: Business Logic Vulnerabilities Labs.
*   **HackerOne Hacktivity**:
    *   *Report*: "Changing paymentProfileUuid when booking a trip allows free rides at Uber"
    *   *Report*: "Possibility to brute force invite codes in riders.uber.com"
*   **Bug Bounty Write-ups**:
    *   "Uber Free Rides Vulnerability" by Anand Prakash (Payment bypass).
    *   "Uber Eat for Free" (Various researchers).

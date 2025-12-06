# Shopify Bug Bounty Program - Recon & Hunting Plan

**Created**: December 6, 2025
**Target**: Shopify Bug Bounty (HackerOne)
**Max Bounty**: $200,000
**Response Efficiency**: 93%
**Status**: Open for submissions

---

## 🎯 Strategic Overview

**Your Edge**: Proven 2FA bypass methodology from Uber sprint, IDOR hunting expertise, GraphQL attack patterns

**ROI Focus**: 
- Authentication flows (2FA bypass = Critical)
- IDOR on merchant/customer data (High)
- Business logic flaws (Medium-High)

**Time Investment**: 16-20 hours for first campaign
**Expected ROI**: $5k-$15k per critical finding

---

## 📐 Architecture: 3-Phase Approach

### **Phase 1: Intelligence Gathering** (2-3 hours)
```
Scope Analysis → Attack Surface Mapping → Technology Profiling → Test Store Setup
```

**Deliverables**:
- 2 test stores created (attacker + victim)
- Partner/developer account registered
- All credentials documented
- Attack surface prioritized
- API endpoints extracted from JS bundles

### **Phase 2: Systematic Testing** (6-8 hours)
```
High-Priority Targets → Methodology Execution → Evidence Collection
```

**Deliverables**:
- 2FA bypass testing on 15+ sensitive operations
- IDOR testing on merchant/customer APIs
- Business logic flaw testing
- Screenshots + PoC captured
- Findings documented

### **Phase 3: Reporting & Iteration** (1-2 hours)
```
H1 Submission → Await Triage → Pivot to Next Target
```

**Deliverables**:
- H1 reports submitted with full PoC
- Triage monitoring
- Methodology refinement based on learnings

---

## 🗺️ Attack Surface Prioritization

### **Tier 1: Core Commerce Platform** (Highest ROI - Focus Here First)

#### **Priority Assets**:
```
accounts.shopify.com        # Auth, 2FA, account management
admin.shopify.com           # Merchant admin panel
*.myshopify.com (your store) # Merchant testing ground
partners.shopify.com        # Partner/developer access
```

#### **Attack Vectors**:

**1. 2FA Bypass Testing** (Uber proven method)
```python
sensitive_operations_shopify = [
    # Account Management
    "POST /account/email",              # Email change without TOTP
    "POST /account/password",           # Password change without TOTP
    "POST /account/2fa/disable",        # Disable 2FA without verification
    "DELETE /account",                  # Account deletion
    
    # Store Ownership (CRITICAL)
    "POST /store/transfer",             # Transfer store ownership
    "POST /store/collaborator/invite",  # Add staff account with admin perms
    "POST /store/permissions/elevate",  # Grant admin permissions
    "DELETE /store/staff",              # Remove staff without verification
    
    # Financial (HIGH)
    "POST /billing/payment_method",     # Add payment method
    "POST /billing/plan/change",        # Upgrade/downgrade plan
    "POST /store/payout/bank_account",  # Change payout destination
    "PUT /store/payout/routing",        # Redirect store revenue
    
    # Partner/Developer (HIGH)
    "POST /partners/app/install",       # Install app (full data access)
    "POST /partners/api_key/create",    # Generate API key
    "POST /partners/webhook/add",       # Add webhook (data exfiltration vector)
    "POST /partners/scope/elevate",     # Request additional API scopes
]

# Test Method: For each operation above:
# 1. Enable 2FA on test account
# 2. Perform operation via API/web
# 3. Check if TOTP is required
# 4. If not required → CRITICAL bypass, report to H1
```

**Expected Impact**: 
- Email change bypass → Account Takeover chain (Critical, $10k-$20k)
- Payout redirect → Financial fraud (Critical, $8k-$15k)
- App install bypass → Data breach (High, $5k-$10k)

---

**2. IDOR Hunting**

```python
# Two-Store Setup Required
store_a = "attacker-test.myshopify.com"   # Your test store
store_b = "victim-test.myshopify.com"     # Second test store

idor_targets = [
    # Store Settings (CRITICAL)
    {
        "endpoint": "GET /admin/api/2024-10/shop.json",
        "test": "Use Store A session → access Store B shop config",
        "sensitive_data": "Store name, owner email, phone, address"
    },
    
    # Customer Data (CRITICAL)
    {
        "endpoint": "GET /admin/api/2024-10/customers/{customer_id}.json",
        "test": "Enumerate customer IDs from Store A → access Store B customers",
        "sensitive_data": "Name, email, phone, addresses, order history, notes"
    },
    
    # Order Information (HIGH)
    {
        "endpoint": "GET /admin/api/2024-10/orders/{order_id}.json",
        "test": "Use Store A order IDs on Store B endpoint",
        "sensitive_data": "Customer PII, payment info, fulfillment details"
    },
    
    # Analytics (MEDIUM)
    {
        "endpoint": "GET /admin/api/2024-10/reports/sales.json",
        "test": "Store A session accessing Store B revenue data",
        "sensitive_data": "Sales figures, bestsellers, revenue"
    },
    
    # Partner Resources (HIGH)
    {
        "endpoint": "GET /partners/api/apps/{app_id}/details",
        "test": "Access other developers' app configurations",
        "sensitive_data": "API keys, webhook URLs, OAuth credentials"
    },
    
    # Staff Management (MEDIUM)
    {
        "endpoint": "GET /admin/api/2024-10/staff.json",
        "test": "Enumerate staff on other stores",
        "sensitive_data": "Staff names, emails, permission levels"
    },
]

# Test Workflow:
# 1. Create resources in Store B (customers, orders, etc.)
# 2. Extract resource IDs from Store B
# 3. Use Store A session to access Store B resources by ID
# 4. Check for cross-tenant data leakage
# 5. Document with screenshots showing data disclosure
```

**Expected Impact**:
- Customer data IDOR → Mass PII disclosure (Critical, $12k-$20k)
- Order IDOR → Payment info leak (High, $7k-$12k)
- Partner app IDOR → API key disclosure (High, $5k-$10k)

---

**3. Business Logic Flaws**

```python
business_logic_tests = [
    {
        "name": "Discount Code Stacking",
        "method": "Apply multiple discount codes to single order",
        "endpoint": "POST /cart/update.js with discount_codes[]",
        "expected": "Only one discount allowed",
        "test": "Apply 3+ codes (10% + 20% + $50 off), check final price",
        "impact": "Financial loss for merchants",
        "severity": "Medium ($2k-$5k)"
    },
    
    {
        "name": "Negative Inventory Purchase",
        "method": "Buy product with 0 stock via API manipulation",
        "endpoint": "POST /cart/add.js with quantity=-1",
        "expected": "Out of stock error",
        "test": "Modify quantity parameter to negative or bypass stock check",
        "impact": "Inventory fraud",
        "severity": "Medium ($2k-$4k)"
    },
    
    {
        "name": "Promo Code Multi-Use (Race Condition)",
        "method": "Parallel requests with single-use promo code",
        "endpoint": "POST /discount/{code}/apply",
        "expected": "Code invalidated after first use",
        "test": "Send 10 parallel requests with same code, check if multiple orders use it",
        "impact": "Financial abuse",
        "severity": "Medium-High ($3k-$7k)"
    },
    
    {
        "name": "Client-Side Price Manipulation",
        "method": "Modify price in checkout request",
        "endpoint": "POST /checkout with items[].price",
        "expected": "Server-side price validation",
        "test": "Intercept checkout, change price=0.01, complete order",
        "impact": "Payment bypass",
        "severity": "Critical ($10k-$20k)"
    },
    
    {
        "name": "Store Plan Downgrade Without Permission",
        "method": "Downgrade another merchant's plan via API",
        "endpoint": "POST /billing/plan/downgrade",
        "expected": "Owner authorization required",
        "test": "Staff account attempting to downgrade store plan",
        "impact": "Service disruption",
        "severity": "Medium ($2k-$5k)"
    },
    
    {
        "name": "Refund Abuse (Amount Manipulation)",
        "method": "Refund more than original order amount",
        "endpoint": "POST /admin/api/2024-10/orders/{id}/refunds.json",
        "expected": "Refund capped at order total",
        "test": "Issue refund with amount > original_total",
        "impact": "Financial fraud",
        "severity": "High ($5k-$10k)"
    },
]
```

**Expected Impact**:
- Price manipulation → Payment bypass (Critical, $10k-$20k)
- Promo code race condition → Financial abuse (Medium-High, $3k-$7k)
- Refund abuse → Revenue loss (High, $5k-$10k)

---

### **Tier 2: Shop App & Mobile** (Medium ROI)

#### **Priority Assets**:
```
shop.app                    # Consumer mobile shopping app
*.shopify.io                # Mobile API endpoints
*.shopifycloud.com          # Cloud infrastructure APIs
```

#### **Attack Vectors**:
1. **Mobile-specific auth flows** - OAuth/deep link hijacking
2. **API rate limiting bypass** - Header rotation, distributed requests
3. **Push notification manipulation** - Send fake order updates
4. **Deep link parameter injection** - Open redirect via app://

**Expected Impact**: Medium severity ($2k-$7k per finding)

---

### **Tier 3: Infrastructure & Supporting Services** (Lower Priority)

#### **Priority Assets**:
```
*.shopifycs.com             # Customer service tools
*.pci.shopifyinc.com        # Payment infrastructure (careful!)
Static sites                # blog.shopify.com, help.shopify.com
```

#### **Attack Vectors**:
1. **SSRF via webhooks** - Internal network scanning
2. **Subdomain takeover** - Dangling DNS records
3. **Cache poisoning** - Web cache deception
4. **XSS on static sites** - Lower bounty per Shopify policy

**Expected Impact**: Low-Medium severity ($500-$3k per finding)

---

## 🛠️ Tooling Strategy: Build Once, Test Everywhere

### **Reusable Components** (Build during Phase 1)

#### **1. Session Manager** (`tools/session-manager.py`)
```python
"""
Encrypted credential storage + TOTP generation + session management

Features:
- Store multiple account credentials securely
- Generate TOTP codes on demand
- Manage cookies/tokens across sessions
- Auto-refresh expired sessions
- Export credentials for Burp/curl

Usage:
    python session-manager.py add --name "store-a" --email "test1@wearehackerone.com"
    python session-manager.py totp --name "store-a"
    python session-manager.py session --name "store-a" --export burp
"""
```

#### **2. 2FA Bypass Tester** (`tools/2fa-bypass-tester.py`)
```python
"""
Automate 2FA bypass testing on sensitive operations

Features:
- Load sensitive_operations list from JSON
- Test each operation with/without TOTP
- Capture request/response pairs
- Generate PoC evidence screenshots
- Auto-document findings in markdown

Usage:
    python 2fa-bypass-tester.py --target shopify --session store-a
    python 2fa-bypass-tester.py --operation email_change --verify
"""
```

#### **3. IDOR Fuzzer** (`tools/idor-fuzzer.py`)
```python
"""
Two-account IDOR testing automation

Features:
- Two-session management (attacker + victim)
- Resource ID extraction
- Cross-tenant access testing
- Auto-diff responses for PII leakage
- Generate H1-ready evidence

Usage:
    python idor-fuzzer.py --attacker store-a --victim store-b --target customers
    python idor-fuzzer.py --endpoint "/admin/api/2024-10/orders/{id}.json"
"""
```

#### **4. GraphQL Schema Extractor** (`tools/graphql-extractor.py`)
```python
"""
Extract and analyze GraphQL schemas

Features:
- Introspection query (if enabled)
- JS bundle mining for operations
- Mutation prioritization (writes > reads)
- Batch query testing
- Sensitive field detection

Usage:
    python graphql-extractor.py --url https://admin.shopify.com/graphql
    python graphql-extractor.py --js-bundle https://cdn.shopify.com/app.js
"""
```

#### **5. H1 Report Builder** (`tools/h1-report-builder.py`)
```python
"""
Convert findings JSON to HackerOne markdown

Features:
- Load findings from JSON
- Auto-populate H1 report template
- CVSS calculator integration
- Embed screenshots
- Generate step-by-step reproduction

Usage:
    python h1-report-builder.py --finding findings/2fa-bypass-email.json
    python h1-report-builder.py --template critical-ato
"""
```

---

## ⏱️ Time-Boxed Execution Plan

### **Day 1: Setup & Reconnaissance** (4 hours)

```bash
# Hour 1-2: Environment Setup
1. Register test stores
   - Go to https://www.shopify.com/free-trial
   - Store A: attacker-test-<random>.myshopify.com
   - Store B: victim-test-<random>.myshopify.com
   - Use <username>+shopify-a@wearehackerone.com format

2. Enable 2FA on both stores
   - Save TOTP secrets to credentials/2fa-setup.md

3. Create partner account
   - https://partners.shopify.com/signup
   - Save API credentials

4. Build session-manager.py
   - Implement credential encryption
   - TOTP generation function
   - Test with test stores

# Hour 3-4: Attack Surface Mapping
1. Extract API endpoints from JS bundles
   - Use Chrome DevTools → Sources → Search for "api/"
   - Save to payloads/endpoints.txt

2. Identify GraphQL endpoints
   - Check for /graphql, /admin/api/graphql
   - Test introspection

3. Map authentication flows
   - Document login → 2FA → session flow
   - Identify auth tokens/cookies

4. Create ATTACK-SURFACE.md
   - Prioritize Tier 1 targets
   - List all sensitive operations
```

### **Day 2-3: Core Testing** (12 hours)

```bash
# Session 1 (4h): 2FA Bypass Testing
Target: 15+ sensitive operations from Tier 1

Workflow:
1. Load sensitive_operations list
2. For each operation:
   a. Perform via API with valid session
   b. Check if TOTP prompt appears
   c. If no TOTP → capture evidence
   d. Document in findings/2025-12-XX-2fa-bypass.md
3. If bypass found:
   a. Test full ATO chain
   b. Capture screenshots
   c. Draft H1 report immediately

Expected Findings: 1-2 bypasses (if patterns similar to Uber)

# Session 2 (4h): IDOR Hunting
Target: Customer, order, partner APIs

Workflow:
1. Create 5 test customers in Store B
2. Create 5 test orders in Store B
3. Extract resource IDs
4. Use Store A session to access Store B resources
5. Check for PII disclosure
6. Document in findings/2025-12-XX-idor-merchant.md

Expected Findings: 1-2 IDORs (common in multi-tenant SaaS)

# Session 3 (4h): Business Logic Flaws
Target: Discount, pricing, refund workflows

Workflow:
1. Test discount code stacking (3+ codes)
2. Test negative inventory purchase
3. Test promo code race condition (10 parallel requests)
4. Test client-side price manipulation
5. Test refund amount manipulation
6. Document in findings/2025-12-XX-business-logic.md

Expected Findings: 1-2 logic flaws (depends on validation rigor)
```

### **Day 4: Reporting & Iteration** (2 hours)

```bash
# Hour 1: H1 Submissions
1. Finalize reports with full PoC
2. Submit to https://hackerone.com/shopify
3. Include:
   - Clear title (e.g., "2FA Bypass: Email Change Without TOTP")
   - Step-by-step reproduction
   - Screenshots/videos
   - Impact explanation
   - Suggested fix

# Hour 2: Monitor & Pivot
1. Check H1 for triage responses (expect 1-2 days)
2. Answer any clarification questions
3. If findings triaged quickly:
   - Pivot to Tier 2 targets (Shop app, mobile)
   - Explore GraphQL attack surface
   - Test rate limiting bypasses
```

---

## 🚀 Quick Start Commands

```bash
# 1. Navigate to shopify-recon
cd /home/amirdlz/aynorica-hacker/shopify-recon

# 2. Create tracking files
cat > README.md << 'EOF'
# Shopify Bug Bounty Campaign

**Started**: 2025-12-06
**Program**: https://hackerone.com/shopify
**Max Bounty**: $200,000
**Status**: Active

## Quick Links
- [Attack Surface](ATTACK-SURFACE.md)
- [Methodology](METHODOLOGY.md)
- [Findings](findings/)
- [Tools](tools/)
EOF

# 3. Register test stores
open "https://www.shopify.com/free-trial"
# Use format: <yourusername>+shopify-<a/b>@wearehackerone.com

# 4. Document credentials immediately
cat > credentials/shopify-test-accounts.md << 'EOF'
# Shopify Test Accounts

## Store A (Attacker)
- **Store URL**: attacker-test-XXXX.myshopify.com
- **Email**: <username>+shopify-a@wearehackerone.com
- **Password**: [REDACTED]
- **2FA TOTP Secret**: [Generate and save here]
- **Role**: Owner

## Store B (Victim)
- **Store URL**: victim-test-XXXX.myshopify.com
- **Email**: <username>+shopify-b@wearehackerone.com
- **Password**: [REDACTED]
- **2FA TOTP Secret**: [Generate and save here]
- **Role**: Owner
EOF

# 5. Start recon
echo "Starting attack surface mapping..."
```

---

## 🎯 Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Time to First Finding | < 8 hours | Proven methodology = fast results |
| Findings per 8h session | 2-3 | Quality over quantity |
| Critical Findings | 1+ | 2FA bypass highly likely |
| Expected Bounty Range | $5k-$15k | Per critical finding |
| H1 Response Time | 1-2 days | Shopify 93% efficiency |
| Total Campaign ROI | $10k-$30k | For 16-20 hour investment |

---

## 🔄 Continuous Improvement Loop

```
Test → Document → Report → Learn → Optimize Tools → Repeat
```

**After Each Session**:
1. ✅ Update METHODOLOGY.md with new patterns discovered
2. ✅ Add working payloads to payloads/ directory
3. ✅ Enhance tooling based on manual pain points
4. ✅ Track time spent vs bounty earned in metrics
5. ✅ Adjust attack surface priorities based on findings

**Metrics to Track**:
- Time per vulnerability type (2FA, IDOR, logic)
- Success rate per methodology
- Bounty per hour invested
- Response time from H1 triage
- Duplicate report rate (lower = better targeting)

---

## 💡 Key Differences: Uber vs Shopify

| Aspect | Uber | Shopify | Implication |
|--------|------|---------|-------------|
| **Test Environment** | Production only | Can self-host test stores | More freedom to test without affecting real users |
| **2FA Implementation** | Login-only gate | Unknown (must test) | Same bypass methodology applies |
| **API Maturity** | Mixed (GraphQL + REST) | Modern GraphQL-first | Focus on GraphQL-specific attacks |
| **Scope Breadth** | ~50 core domains | 180+ in-scope assets | Broader surface, must prioritize carefully |
| **Documentation** | Sparse internal APIs | Extensive public dev docs | Easier to understand API contracts |
| **Multi-Tenancy** | Riders/Drivers/Business | Merchants/Customers/Partners | IDOR opportunities higher |
| **Financial Impact** | Direct user impact | Merchant revenue impact | Business logic flaws more critical |

---

## 🚨 Risk Mitigation

**Do NOT**:
- ❌ Test on real merchant stores (only use your test stores)
- ❌ Access other users' data beyond PoC necessity
- ❌ Perform DoS attacks or high-volume requests
- ❌ Publicly disclose findings before resolution
- ❌ Share credentials outside HackerOne platform

**Always**:
- ✅ Use `@wearehackerone.com` email aliases
- ✅ Test with your own accounts only
- ✅ Include "bug-bounty" in merchant name
- ✅ Document IP addresses used during testing
- ✅ Delete any accessed PII immediately after PoC
- ✅ Follow Shopify's Early Access Program rules

---

## 📚 Resources

**Shopify Documentation**:
- Admin API: https://shopify.dev/docs/api/admin
- GraphQL API: https://shopify.dev/docs/api/admin-graphql
- Partners API: https://shopify.dev/docs/api/partner
- Security Best Practices: https://help.shopify.com/en/manual/your-account/account-security

**HackerOne Program**:
- Program Page: https://hackerone.com/shopify
- Bounty Calculator: https://bugbounty.shopify.com/calculator
- Scope Details: https://bugbounty.shopify.com/criteria?q=scope
- Rules: https://bugbounty.shopify.com/criteria?q=rules

**Tooling References**:
- TOTP Generation: https://pypi.org/project/pyotp/
- GraphQL Introspection: https://graphql.org/learn/introspection/
- Burp Suite Extensions: https://portswigger.net/bappstore

---

## 🎓 Learning Objectives

By completing this campaign, you will:

1. ✅ Master multi-tenant IDOR testing patterns
2. ✅ Develop reusable 2FA bypass testing framework
3. ✅ Build GraphQL-specific attack methodologies
4. ✅ Create automated evidence collection workflows
5. ✅ Establish H1 reporting templates for future programs
6. ✅ Validate ROI of systematic vs ad-hoc testing

**Knowledge Transfer**:
- Document all learnings in METHODOLOGY.md
- Create tool usage guides in tools/README.md
- Build payload library for future Shopify testing
- Share anonymized findings pattern with community (post-disclosure)

---

## 🔮 Future Expansion

After initial campaign completion:

**Phase 2 Targets** (if Phase 1 successful):
1. **Shop App Mobile** - iOS/Android specific vulnerabilities
2. **Shopify Plus** - Enterprise features (if accessible)
3. **POS System** - Point of Sale integrations
4. **Wholesale Channel** - B2B functionality
5. **Markets** - Multi-currency/multi-region features

**Advanced Techniques**:
1. **GraphQL Batching** - Query complexity attacks
2. **WebSocket Testing** - Real-time data channels
3. **Webhook SSRF** - Internal network probing
4. **OAuth Flow Hijacking** - App installation exploits
5. **Supply Chain** - Third-party app vulnerabilities

---

**Next Steps**: Create directory structure → Register test stores → Start reconnaissance

**Estimated Time to First Report**: 8-12 hours from start

Good hunting! 🎯

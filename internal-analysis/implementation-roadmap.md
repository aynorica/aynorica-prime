# Implementation Roadmap — Bug Bounty Toolkit

> **Purpose**: Actionable plan to build reusable infrastructure from Uber learnings
> **Timeline**: Phased approach (start simple, scale complexity)
> **Goal**: 3-4x efficiency gain on next program

---

## Phase 0: Immediate Wins (Next Session, ~1 hour)

**Objective**: Extract low-hanging fruit without building complex infrastructure

### Task 1: Create Payloads Library (15 min)

```bash
mkdir -p payloads/uber
```

**Files to create**:
1. `payloads/uber/email-change.json`
2. `payloads/uber/password-change.json`
3. `payloads/uber/graphql-queries.json`

**Why**: Copy-paste ready for next Uber session or similar targets

---

### Task 2: Create Methodology Checklists (30 min)

```bash
mkdir -p methodologies
```

**Files to create**:
1. `methodologies/2fa-bypass-checklist.md` — Systematic 2FA testing
2. `methodologies/idor-hunting-checklist.md` — IDOR discovery workflow
3. `methodologies/business-logic-checklist.md` — Logic flaw patterns

**Format** (Example):
```markdown
# 2FA Bypass Testing Checklist

## Phase 1: Setup
- [ ] Create account, enable 2FA (TOTP)
- [ ] Verify 2FA works (logout, login, enter code)

## Phase 2: Test Sensitive Operations
- [ ] Email change
- [ ] Password change
- [ ] Payment method add
...
```

**Why**: Ensures systematic testing, nothing missed

---

### Task 3: Consolidate Uber Scripts (15 min)

**Current**: Scripts scattered in `uber-recon/scripts/`

**Action**: Move to generic location
```bash
mkdir -p scripts/
cp uber-recon/scripts/uber-api.sh scripts/graphql-tester.sh
cp uber-recon/scripts/idor-test.sh scripts/idor-tester.sh
```

**Then**: Generalize (replace "uber.com" with `$DOMAIN` variable)

**Why**: Reusable on next GraphQL target

---

## Phase 1: Core Infrastructure (Week 1, ~8 hours)

**Objective**: Build foundational tools that work across all programs

### Milestone 1.1: Session Manager (2 hours)

**Implementation**:
```python
# core/session_manager.py
import json, os
from pathlib import Path
from cryptography.fernet import Fernet

class SessionManager:
    def __init__(self, storage_path="~/.bug-bounty-sessions"):
        self.storage = Path(storage_path).expanduser()
        self.storage.mkdir(exist_ok=True, mode=0o700)
        self.key = self._load_or_create_key()
        self.cipher = Fernet(self.key)
    
    def _load_or_create_key(self):
        key_file = self.storage / "master.key"
        if key_file.exists():
            return key_file.read_bytes()
        else:
            key = Fernet.generate_key()
            key_file.write_bytes(key)
            key_file.chmod(0o600)
            return key
    
    def save(self, domain, cookies, metadata=None):
        data = {
            'cookies': cookies,
            'metadata': metadata or {}
        }
        encrypted = self.cipher.encrypt(json.dumps(data).encode())
        session_file = self.storage / f"{domain}.enc"
        session_file.write_bytes(encrypted)
    
    def load(self, domain):
        session_file = self.storage / f"{domain}.enc"
        if not session_file.exists():
            raise FileNotFoundError(f"No session for {domain}")
        encrypted = session_file.read_bytes()
        data = json.loads(self.cipher.decrypt(encrypted).decode())
        return data
    
    def to_curl(self, domain):
        data = self.load(domain)
        if isinstance(data['cookies'], dict):
            return '; '.join(f"{k}={v}" for k, v in data['cookies'].items())
        return data['cookies']

# Usage:
# sm = SessionManager()
# sm.save('uber.com', {'sid': '...', 'jwt': '...'}, {'user_uuid': '...'})
# cookies = sm.to_curl('uber.com')
```

**Test**:
```bash
python3 -c "
from core.session_manager import SessionManager
sm = SessionManager()
sm.save('test.com', {'sid': 'test123'})
print(sm.to_curl('test.com'))
"
```

**Deliverable**: Working session manager, encrypted storage

---

### Milestone 1.2: Recon Pipeline (3 hours)

**Implementation**:
```bash
#!/bin/bash
# recon/recon-chain.sh
# Automated recon pipeline

DOMAIN="$1"
OUTPUT_DIR="${2:-recon-output}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [output_dir]"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "[1/4] Subdomain Enumeration"
subfinder -d "$DOMAIN" -silent -o "$OUTPUT_DIR/subdomains.txt"

echo "[2/4] HTTP Probing"
cat "$OUTPUT_DIR/subdomains.txt" | httpx \
    -silent -status-code -title -tech-detect \
    -o "$OUTPUT_DIR/live-hosts.txt"

echo "[3/4] Prioritization"
grep -iE 'php|wordpress|rails|internal|admin|api|graphql|staging|preprod' \
    "$OUTPUT_DIR/live-hosts.txt" > "$OUTPUT_DIR/priority-targets.txt" || touch "$OUTPUT_DIR/priority-targets.txt"

echo "[4/4] Summary"
echo "Total subdomains: $(wc -l < "$OUTPUT_DIR/subdomains.txt")"
echo "Live hosts: $(wc -l < "$OUTPUT_DIR/live-hosts.txt")"
echo "Priority targets: $(wc -l < "$OUTPUT_DIR/priority-targets.txt")"

echo ""
echo "Output saved to: $OUTPUT_DIR/"
echo "Next: Review priority-targets.txt and start manual testing"
```

**Test**:
```bash
./recon/recon-chain.sh example.com test-output
```

**Deliverable**: One-command recon for any domain

---

### Milestone 1.3: GraphQL Query Builder (2 hours)

**Implementation**:
```python
# testing/graphql_builder.py
import requests, json

class GraphQLClient:
    def __init__(self, endpoint, session_cookies):
        self.endpoint = endpoint
        self.session = requests.Session()
        self.session.cookies.update(session_cookies)
        self.session.headers.update({
            'x-csrf-token': 'x',
            'Content-Type': 'application/json'
        })
    
    def query(self, operation_name, query_string, variables=None):
        payload = {
            'operationName': operation_name,
            'query': query_string,
            'variables': variables or {}
        }
        response = self.session.post(self.endpoint, json=payload)
        return response.json()
    
    def test_introspection(self):
        """Test if GraphQL introspection is enabled"""
        introspection_query = """
        {
            __schema {
                queryType { name }
                mutationType { name }
            }
        }
        """
        result = self.query('IntrospectionQuery', introspection_query)
        
        if 'errors' in result:
            return {'enabled': False, 'error': result['errors'][0]['message']}
        return {'enabled': True, 'schema': result['data']}
    
    def build_idor_query(self, operation_name, target_type, target_uuid):
        """Generate a basic IDOR test query"""
        query = f"""
        query {operation_name}($uuid: String!) {{
            {target_type}(uuid: $uuid) {{
                uuid
                email
                firstName
                lastName
            }}
        }}
        """
        return self.query(operation_name, query, {'uuid': target_uuid})

# Usage:
# from core.session_manager import SessionManager
# sm = SessionManager()
# cookies = sm.load('uber.com')['cookies']
# 
# client = GraphQLClient('https://riders.uber.com/graphql', cookies)
# result = client.test_introspection()
# print(result)
```

**Test**:
```python
# Manual test with Uber credentials
from testing.graphql_builder import GraphQLClient

cookies = {'sid': 'your-session-here'}
client = GraphQLClient('https://riders.uber.com/graphql', cookies)
print(client.test_introspection())
```

**Deliverable**: Reusable GraphQL client for any target

---

### Milestone 1.4: Simple IDOR Tester (1 hour)

**Implementation**:
```python
# testing/idor_tester.py
import requests

class IDORTester:
    def __init__(self, attacker_session, victim_data):
        self.attacker = attacker_session  # dict: {'cookies': {...}}
        self.victim = victim_data         # dict: {'uuid': '...', 'email': '...'}
        self.findings = []
    
    def test_endpoint(self, url_template, method='GET', body=None):
        """
        Test an endpoint for IDOR
        
        Args:
            url_template: str (e.g., 'https://api.example.com/users/{uuid}')
            method: str ('GET', 'POST', etc.)
            body: dict (optional POST body)
        """
        # Replace {uuid} with victim's UUID
        url = url_template.replace('{uuid}', self.victim['uuid'])
        
        # Make request with attacker's session
        response = requests.request(
            method,
            url,
            cookies=self.attacker['cookies'],
            json=body,
            headers={'X-Bug-Bounty': 'HackerOne-aynorica'}
        )
        
        # Check for victim data in response
        if response.status_code == 200:
            response_text = response.text.lower()
            victim_identifiers = [
                self.victim.get('email', '').lower(),
                self.victim.get('uuid', '').lower()
            ]
            
            if any(vid in response_text for vid in victim_identifiers if vid):
                self.findings.append({
                    'url': url,
                    'method': method,
                    'status': response.status_code,
                    'leaked_data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:500]
                })
                print(f"🚨 IDOR FOUND: {url}")
                return True
        
        print(f"✅ Blocked: {url} (HTTP {response.status_code})")
        return False
    
    def save_findings(self, filepath):
        """Save findings to JSON"""
        import json
        with open(filepath, 'w') as f:
            json.dump(self.findings, f, indent=2)

# Usage:
# tester = IDORTester(
#     attacker_session={'cookies': {...}},
#     victim_data={'uuid': 'victim-uuid', 'email': 'victim@example.com'}
# )
# tester.test_endpoint('https://api.uber.com/v1/users/{uuid}')
# tester.save_findings('findings/idor-results.json')
```

**Deliverable**: Quick IDOR testing without manual curl commands

---

## Phase 2: Enhanced Testing Tools (Week 2, ~8 hours)

**Objective**: Build specialized testers for common vulnerability classes

### Milestone 2.1: Auth Bypass Tester (3 hours)

**Features**:
- Test 2FA bypass on sensitive operations
- Detect missing step-up authentication
- Generate structured finding reports

**Implementation**: Extend `TestHarness` base class

---

### Milestone 2.2: Race Condition Tester (2 hours)

**Features**:
- Parallel request execution
- Timing analysis
- Promo code enumeration

---

### Milestone 2.3: Report Generator (3 hours)

**Features**:
- JSON finding → H1 markdown
- Template support (H1, Bugcrowd, Intigriti)
- Auto-fill CVSS scores

---

## Phase 3: Integration & Polish (Week 3, ~6 hours)

**Objective**: Make tools production-ready

### Milestone 3.1: CLI Wrapper (3 hours)

**Implementation**:
```bash
# Main CLI: bbtk (Bug Bounty Toolkit)

bbtk recon uber.com                # Run recon pipeline
bbtk session save uber.com         # Save session from browser
bbtk session load uber.com         # Load session for testing
bbtk test idor --target uber.com   # Run IDOR tests
bbtk report generate finding.json  # Generate H1 report
```

**Tech**: Python Click or Typer library

---

### Milestone 3.2: Documentation (2 hours)

**Files to create**:
1. `README.md` — Overview, installation, quick start
2. `docs/session-management.md` — Session manager guide
3. `docs/recon-pipeline.md` — Recon workflow
4. `docs/testing-guide.md` — How to use test harnesses

---

### Milestone 3.3: Testing & CI (1 hour)

**Setup**:
- Unit tests for core modules (pytest)
- Integration tests with mock servers
- Pre-commit hooks (black, flake8, secret scanning)

---

## Phase 4: Validation (Week 4, ~4 hours)

**Objective**: Test toolkit on NEW target (not Uber)

### Milestone 4.1: Pick New Target

**Options**:
1. Shopify (if email alias ready)
2. Stripe (API-heavy, good for GraphQL tools)
3. GitHub (already familiar, good test case)

---

### Milestone 4.2: Run Full Workflow

1. Run recon pipeline
2. Use session manager for auth
3. Test with IDOR tester
4. Generate report

**Success Criteria**:
- Recon completes in <30 minutes
- Session management works without manual copy-paste
- Find at least 1 valid issue (or systematically rule out IDORs)

---

### Milestone 4.3: Refine Tools

Based on Milestone 4.2 learnings:
- Fix bugs discovered
- Add missing features
- Update documentation

---

## Timeline Summary

| Phase | Duration | Effort | Deliverable |
|-------|----------|--------|-------------|
| Phase 0 | 1 hour | Low | Payloads + methodologies |
| Phase 1 | 1 week | Medium | Core infrastructure (session mgr, recon, GraphQL) |
| Phase 2 | 1 week | Medium | Testing tools (IDOR, auth, race) |
| Phase 3 | 1 week | Low | CLI + docs + tests |
| Phase 4 | 1 week | Low | Validation on new target |
| **Total** | **4 weeks** | **~27 hours** | **Production-ready toolkit** |

---

## Break-Even Analysis

**Investment**: 27 hours

**Per-Program Savings** (vs manual):
- Recon: 1 hour → 15 min = 45 min saved
- Session mgmt: 30 min → 5 min = 25 min saved
- Testing: 6 hours → 2 hours = 4 hours saved
- Reporting: 1 hour → 15 min = 45 min saved
- **Total per program**: ~6 hours saved

**Break-even**: 27 hours / 6 hours = **4.5 programs**

**ROI after 10 programs**: 27 hours invested, 60 hours saved = **2.2x return**

---

## Decision Points

### Decision 1: Build Now vs Later?

**Option A: Build now** (before next program)
- ✅ Pro: Next program is faster
- ❌ Con: 27 hours upfront investment

**Option B: Build later** (after 2-3 more programs)
- ✅ Pro: More data on what to build
- ❌ Con: Waste time on manual work

**Recommendation**: **Build Phase 0 + Phase 1 now** (9 hours), defer Phase 2-4 until after next program.

**Rationale**: Core infrastructure (session mgmt, recon) has immediate ROI. Advanced testers can wait until you validate the patterns.

---

### Decision 2: Python vs Go?

**Current Plan**: Python

**Alternative**: Go (compiled binaries, faster)

**Trade-off**:
- Python: Faster development, easier to maintain
- Go: Faster execution, single binary distribution

**Recommendation**: **Start with Python**, migrate to Go only if performance becomes a bottleneck (unlikely for current scale).

---

## Risk Mitigation

### Risk 1: Toolkit becomes too complex

**Mitigation**:
- Start simple (Phase 0-1 only)
- Add complexity only when validated by actual use
- Keep each tool <200 lines of code

---

### Risk 2: Time sink (over-engineering)

**Mitigation**:
- Set hard time limits per milestone (listed above)
- If milestone takes >2x estimated time, stop and reassess
- Ship "good enough" over "perfect"

---

### Risk 3: Tools don't work on next target

**Mitigation**:
- Design for modularity (each tool independent)
- Test on 2-3 different target types before declaring "done"
- Keep manual workflows as fallback

---

## Success Metrics

### Phase 1 Success (Core Infrastructure)

- [ ] Session manager works without bugs
- [ ] Recon pipeline completes in <30 minutes
- [ ] GraphQL client successfully queries Uber API
- [ ] Zero manual cookie copy-paste needed

### Phase 4 Success (Validation)

- [ ] Toolkit works on NEW target (not Uber)
- [ ] Time to first finding: <4 hours (vs 8 hours manual)
- [ ] At least 1 valid submission using toolkit
- [ ] No critical bugs in production use

---

## Next Immediate Action

**Right now** (this session):

1. ✅ Analysis complete (this document + previous two)
2. ⏭️ **Create Phase 0 artifacts** (payloads + methodologies)
3. ⏭️ Decide: Build Phase 1 now, or start next program?

**My recommendation**: 

**Option 1** (Fast track): Build Phase 1.1 (session manager) + Phase 1.2 (recon pipeline) → 5 hours total → Immediate 4x speedup on recon

**Option 2** (Defer): Start Shopify/next program with current tools → Build toolkit after you validate patterns on 2nd program

**Trade-off**: Option 1 is the "right" engineering decision. Option 2 keeps momentum on revenue goal ($7,800 by Dec 31).

**Your call.** What do you want to do?

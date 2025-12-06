# Architecture Analysis — Uber Bug Bounty Infrastructure

> **Purpose**: Identify architectural patterns from Uber sprint, extract reusable design decisions
> **Analyzed**: 7 sessions, 169 live hosts, 3 critical findings
> **Focus**: What worked architecturally, what should be systematized

---

## Part 1: Current Architecture (Implicit)

### Directory Structure

```
uber-recon/
├── credentials/        # Test accounts, 2FA secrets
├── domains/           # Root domains, core targets
├── subdomains/        # Enumeration output
├── live/              # HTTP-probed hosts
├── nuclei/            # Scanner output
├── api/               # Endpoint documentation
├── findings/          # Vulnerability reports
├── scripts/           # Ad-hoc bash/curl scripts
└── sessions/          # Cookie dumps (manual)
```

**Strengths**:
- Clear separation of concerns
- Easy to navigate
- Supports handoff (each phase documented)

**Weaknesses**:
- Scripts are program-specific (not reusable)
- Credentials in plaintext markdown
- No automation layer (everything manual)
- Session management is copy-paste

---

## Part 2: Proposed Architecture (Explicit)

### High-Level Design

```
bug-bounty-toolkit/
├── core/                   # Core infrastructure (session mgmt, HTTP client)
├── recon/                  # Recon modules (subfinder, httpx, nuclei wrappers)
├── testing/                # Test harnesses (IDOR, auth, GraphQL)
├── methodologies/          # Systematic checklists
├── payloads/               # Pre-built payloads library
├── reports/                # Report templates + generation
└── targets/                # Per-target data (uber, shopify, etc.)
    └── uber/
        ├── recon-output/
        ├── findings/
        ├── sessions/       # Managed by core/session-manager
        └── config.json     # Target-specific config
```

**Trade-offs**:

| Design Choice | Benefit | Cost |
|---------------|---------|------|
| Centralized session mgmt | No more copy-paste cookies | Needs encryption for secrets |
| Modular testing tools | Reusable across programs | Initial build time |
| Payload library | Faster testing | Needs maintenance |
| Per-target isolation | Clean separation | More directories |

---

## Part 3: Component Design

### Component 1: Session Manager

**Architecture**:
```
SessionManager
├── Storage: ~/.bug-bounty-sessions/ (encrypted)
├── Interface:
│   ├── save_session(domain, cookies, metadata)
│   ├── load_session(domain)
│   ├── to_curl_format(domain)
│   └── refresh_session(domain)  # Future: auto-refresh via API
└── Backends:
    ├── FileBackend (current)
    └── VaultBackend (future: HashiCorp Vault)
```

**Security Considerations**:
- Encrypt session files (AES-256)
- Rotate encryption key periodically
- Never commit session files to git
- Add `.bug-bounty-sessions/` to global .gitignore

**Why This Design**:
- Simple file-based storage (no DB dependency)
- Easy to backup/restore
- Compatible with existing workflow
- Can upgrade to Vault later without changing interface

---

### Component 2: Test Harness Framework

**Architecture**:
```
TestHarness (Abstract Base Class)
├── IDORTester
│   ├── test_endpoint(endpoint, victim_id)
│   ├── test_batch(endpoints[], victim_id)
│   └── generate_report()
│
├── AuthBypassTester
│   ├── test_2fa_bypass(operation, endpoint)
│   ├── test_password_bypass()
│   └── test_session_fixation()
│
├── GraphQLTester
│   ├── discover_operations(js_bundles[])
│   ├── test_introspection()
│   └── fuzz_mutations(operation_name)
│
└── RaceConditionTester
    ├── test_promo_race()
    ├── test_payment_race()
    └── measure_timing()
```

**Extensibility**:
- Each tester inherits from `TestHarness`
- Common interface: `run_tests()`, `generate_report()`
- Plug-and-play: Add new testers without changing core

**Example Usage**:
```python
from testing import IDORTester, AuthBypassTester

# Initialize
idor = IDORTester(session_a, session_b)
auth = AuthBypassTester(session_with_2fa)

# Run tests
idor.test_batch(endpoints=['api/users/{uuid}', 'api/trips/{uuid}'], victim_id='...')
auth.test_2fa_bypass('email_change', 'https://account.uber.com/api/updateUserInfo')

# Generate reports
idor.generate_report('findings/uber-idor.md')
auth.generate_report('findings/uber-auth-bypass.md')
```

---

### Component 3: Recon Pipeline

**Architecture** (Pipeline Pattern):
```
ReconPipeline
├── Stage 1: SubdomainEnumerator
│   ├── Input: root_domain
│   ├── Tools: subfinder, amass
│   └── Output: subdomains.txt
│
├── Stage 2: HTTPProber
│   ├── Input: subdomains.txt
│   ├── Tools: httpx
│   └── Output: live_hosts.txt + metadata.json
│
├── Stage 3: TechDetector
│   ├── Input: live_hosts.txt
│   ├── Logic: Parse httpx tech-detect output
│   └── Output: prioritized_targets.txt
│
├── Stage 4: VulnerabilityScanner (Optional)
│   ├── Input: prioritized_targets.txt
│   ├── Tools: nuclei (passive only)
│   └── Output: nuclei_findings.txt
│
└── Stage 5: SummaryGenerator
    ├── Input: All stage outputs
    └── Output: RECON-SUMMARY.md
```

**Configuration**:
```json
{
  "pipeline": {
    "stages": ["subdomain_enum", "http_probe", "tech_detect"],
    "skip_nuclei": true,
    "prioritize_by": ["php", "rails", "internal", "admin", "api"]
  }
}
```

**Why This Design**:
- Each stage is independent (can run separately)
- Easy to add/remove stages
- Configurable (skip low-value stages like nuclei)
- Outputs are cached (resume from any stage)

---

## Part 4: Data Flow Architecture

### Current (Manual) Flow

```
1. Manual recon (subfinder) → Save to file
2. Manual httpx → Save to file
3. Manual nuclei → Save to file
4. Manual testing in browser → Copy-paste findings to markdown
5. Manual report writing → Submit to H1
```

**Bottlenecks**: Steps 4-5 (manual testing + reporting)

---

### Proposed (Semi-Automated) Flow

```
1. Run: recon-pipeline --target uber.com
   → Auto-generates: subdomains, live hosts, priority list

2. Run: test-harness --target uber --tests auth,idor
   → Auto-tests endpoints, generates finding JSONs

3. Run: report-generator --findings findings/*.json
   → Auto-generates H1-formatted report

4. Manual: Review + submit to H1
```

**Automation Level**: 70% automated, 30% manual (review/submission)

**Time Savings**: 8 hours → 2 hours (4x speedup)

---

## Part 5: Security Architecture

### Secrets Management

**Current (Insecure)**:
```
uber-recon/credentials/uber-test-accounts.md  # Plaintext passwords, TOTP secrets
uber-recon/sessions/account-a-session.md      # Plaintext cookies
```

**Proposed (Secure)**:
```
~/.bug-bounty-sessions/
├── uber.com-session.enc       # AES-256 encrypted
├── shopify.com-session.enc
└── master.key                  # Master encryption key (chmod 600)

~/.bug-bounty-credentials/
├── credentials.enc             # All test accounts encrypted
└── .gitignore                  # Ignore entire directory
```

**Encryption Strategy**:
```python
from cryptography.fernet import Fernet

# Generate key once
key = Fernet.generate_key()
with open('~/.bug-bounty-sessions/master.key', 'wb') as f:
    f.write(key)

# Encrypt session
cipher = Fernet(key)
encrypted = cipher.encrypt(session_data.encode())

# Decrypt session
decrypted = cipher.decrypt(encrypted).decode()
```

**Threat Model**:
- ✅ Protects against: Accidental git commit, disk theft
- ❌ Does NOT protect against: Malware with keylogger, root-level compromise

---

## Part 6: Testing Architecture

### Test Categories

```
testing/
├── unit/                   # Unit tests for core modules
│   ├── test_session_manager.py
│   ├── test_graphql_builder.py
│   └── test_idor_tester.py
│
├── integration/            # Integration tests (requires test accounts)
│   ├── test_auth_bypass_flow.py
│   └── test_idor_flow.py
│
└── e2e/                    # End-to-end tests (full pipeline)
    └── test_recon_pipeline.py
```

**Coverage Target**: 80% for core/, 50% for testing/

**Why**:
- Core modules (session mgmt, HTTP client) must be reliable
- Test harnesses can have lower coverage (rapid iteration)

---

## Part 7: Reporting Architecture

### Report Generation Pipeline

```
Finding (JSON) → Template (Jinja2) → Report (Markdown) → H1 Submission
```

**Finding Schema**:
```json
{
  "id": "uber-2fa-bypass-email-change",
  "title": "2FA Bypass in Email Change",
  "severity": "critical",
  "cvss": 9.8,
  "asset": "uber.com",
  "affected_endpoints": [
    "https://account.uber.com/api/updateUserInfo"
  ],
  "reproduction_steps": [
    {"step": 1, "title": "Enable 2FA", "content": "..."},
    {"step": 2, "title": "Change email", "content": "...", "code": "curl ...", "code_lang": "bash"}
  ],
  "impact": "Full account takeover",
  "remediation": "Require TOTP verification before email changes",
  "evidence": {
    "screenshots": ["screenshot1.png"],
    "request_response": ["email-change-request.txt"]
  },
  "discovered_at": "2025-12-06T13:28:00Z"
}
```

**Template Library**:
```
reports/templates/
├── hackerone.md.j2         # H1-specific format
├── bugcrowd.md.j2          # Bugcrowd format
├── intigriti.md.j2         # Intigriti format
└── internal.md.j2          # Your own tracking format
```

**Why This Design**:
- Platform-agnostic (same finding, multiple formats)
- Structured data (easy to search/filter)
- Version controlled (track finding evolution)

---

## Part 8: Scalability Analysis

### Single Program (Uber)

**Current Performance**:
- Recon: 1 hour (manual)
- Testing: 6 hours (manual)
- Reporting: 1 hour (manual)
- **Total**: 8 hours

**Projected Performance (With Tools)**:
- Recon: 15 minutes (automated)
- Testing: 2 hours (semi-automated)
- Reporting: 15 minutes (automated)
- **Total**: 2.5 hours (3.2x speedup)

---

### Multiple Programs (Uber, Shopify, Stripe, etc.)

**Without Tools** (Naive Scaling):
- 5 programs × 8 hours = 40 hours

**With Tools** (Amortized):
- Initial tool build: 8 hours (one-time)
- Per-program: 2.5 hours × 5 = 12.5 hours
- **Total**: 20.5 hours (1.95x speedup)

**Break-even Point**: 2 programs

---

## Part 9: Maintenance Architecture

### Code Maintenance

**Versioning Strategy**:
```
v1.0.0: Core tools (session mgmt, recon chain)
v1.1.0: Add GraphQL tester
v1.2.0: Add race condition tester
v2.0.0: Breaking changes (new API)
```

**Update Frequency**:
- Bug fixes: Weekly
- New features: Monthly
- Major refactors: Quarterly

**Deprecation Policy**:
- Announce deprecation 1 version ahead
- Remove in next major version
- Keep deprecated code in `legacy/` for 6 months

---

### Methodology Maintenance

**Methodologies** (e.g., 2FA bypass checklist) should be:
1. **Living documents** — Update after each finding
2. **Versioned** — Track what worked per program
3. **Peer-reviewed** — Compare with community best practices

**Update Triggers**:
- New finding → Update checklist with new test
- Duplicate submission → Refine methodology to catch it earlier
- Program-specific quirk → Add to "Known Exceptions" section

---

## Part 10: Decision Record (ADRs)

### ADR 1: File-Based Session Storage vs Database

**Context**: Need to store session cookies securely

**Options**:
1. File-based (encrypted JSON files)
2. SQLite database
3. Redis (in-memory)

**Decision**: File-based

**Rationale**:
- Simple (no DB setup)
- Portable (easy backup/restore)
- Secure (encryption at rest)
- Sufficient (not handling millions of sessions)

**Trade-offs**:
- ❌ No query capabilities (vs SQLite)
- ❌ No expiration logic (vs Redis)
- ✅ Zero dependencies
- ✅ Easy to debug (just cat the file)

---

### ADR 2: Python vs Bash for Tools

**Context**: Need to build reusable testing tools

**Options**:
1. Pure bash scripts (like current uber-api.sh)
2. Python scripts
3. Go binaries

**Decision**: Python for complex logic, Bash for simple pipelines

**Rationale**:
- Python: Better for API clients, JSON handling, OOP (test harnesses)
- Bash: Better for recon pipelines (calling subfinder, httpx, etc.)
- Go: Overkill for current scale

**Examples**:
- ✅ Bash: `recon-chain.sh` (just gluing tools together)
- ✅ Python: `idor-tester.py` (complex logic, multiple accounts)
- ❌ Go: Not needed (yet)

---

### ADR 3: Monorepo vs Multi-Repo

**Context**: Organizing bug bounty toolkit

**Options**:
1. Monorepo (one repo, multiple tools)
2. Multi-repo (one repo per tool)

**Decision**: Monorepo

**Rationale**:
- Shared dependencies (session manager used by all testers)
- Consistent versioning
- Easier to maintain
- Single CI/CD pipeline

**Structure**:
```
bug-bounty-toolkit/ (monorepo)
├── core/
├── recon/
├── testing/
├── reports/
└── targets/
```

---

## Part 11: Risk Mitigation

### Risk 1: Tool Dependency Rot

**Problem**: Tools like subfinder, nuclei change APIs/behavior

**Mitigation**:
- Pin tool versions in `requirements.txt` or `Dockerfile`
- Test suite runs daily (catches breaking changes)
- Wrapper scripts isolate tool-specific logic

---

### Risk 2: False Sense of Security

**Problem**: Relying on tools, missing nuanced bugs

**Mitigation**:
- Tools for **discovery**, not **validation**
- Always manual verification before reporting
- Keep methodologies updated (tools are just helpers)

---

### Risk 3: Credential Leakage

**Problem**: Accidentally committing encrypted sessions (key in same repo)

**Mitigation**:
- Store master key outside repo (`~/.bug-bounty-sessions/master.key`)
- `.gitignore` covers all sensitive paths
- Pre-commit hook scans for secrets

---

## Part 12: Future Architecture (v2.0)

### Vision: Fully Integrated Platform

```
bug-bounty-platform/
├── web-ui/                 # Web interface (Flask/FastAPI)
│   ├── dashboard.html      # Overview of all targets
│   ├── target-view.html    # Per-target findings
│   └── report-builder.html # Interactive report builder
│
├── api/                    # REST API
│   ├── /targets            # CRUD targets
│   ├── /findings           # CRUD findings
│   └── /reports            # Generate reports
│
├── workers/                # Background jobs (Celery)
│   ├── recon-worker.py     # Async recon pipeline
│   └── test-worker.py      # Async test harness
│
└── integrations/           # External integrations
    ├── hackerone.py        # Auto-submit reports
    ├── slack.py            # Notifications
    └── github.py           # Sync to private repo
```

**When to Build**: After 5+ successful programs (proven value)

**Estimated Effort**: 40-80 hours

**ROI**: 10x speedup (8 hours → <1 hour per program)

---

## Conclusion

**Architectural Principles** (From Uber Success):

1. **Separation of Concerns** — Recon ≠ Testing ≠ Reporting
2. **Modularity** — Each tool solves one problem well
3. **Composability** — Tools work together via standard interfaces
4. **Security by Default** — Encrypt secrets, never commit
5. **Pragmatic Automation** — Automate recon/reporting, keep testing manual (for now)

**Next Action**: Build core infrastructure (session manager + recon pipeline) before next program.

**Trade-off**: Spend 8 hours building tools now → Save 4+ hours per program (break-even at 2 programs).

# Skill Gap Research Plan — Bug Bounty Hunting

> **Created**: 2025-12-06
> **Purpose**: Address skill gaps identified for Uber bug bounty program
> **Target**: Create actionable prompts from real-world research

---

## Research Methodology

**Approach**: Research → Extract Patterns → Create Prompt → Validate Against Uber

Each skill gap follows this cycle:
1. **Gather** — Find authoritative sources, real disclosures, techniques
2. **Extract** — Distill into actionable methodology
3. **Formalize** — Create prompt with checklists, examples, workflows
4. **Apply** — Test against Uber attack surface

---

## Priority 1: Critical Gaps (Hunt Blockers)

### 1.1 IDOR Hunting Methodology

**Output**: `prompts/bugbounty/idor-hunting.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| HackerOne Hacktivity (IDOR filter) | Real IDOR patterns from disclosed reports |
| PortSwigger Web Security Academy | IDOR labs + techniques |
| @intigriti, @staboratory on Twitter/X | IDOR tips from top hunters |
| Uber disclosed reports (HackerOne) | Uber-specific IDOR patterns |

**Key Questions to Answer**:
- What parameters typically leak IDORs? (id, user_id, order_id, trip_id)
- How to enumerate object references systematically?
- What's the difference between horizontal vs vertical IDOR?
- How to prove impact for IDOR (PII exposure, unauthorized actions)?
- What headers/cookies affect IDOR behavior?

**Prompt Structure**:
```
1. Parameter identification checklist
2. ID enumeration techniques (sequential, UUID, encoded)
3. Access control bypass patterns
4. Proof-of-concept templates
5. Impact documentation for reports
```

**Time Estimate**: 3 hours research + 1 hour prompt creation

---

### 1.2 Race Condition Testing

**Output**: `prompts/bugbounty/race-condition-testing.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| James Kettle's research (PortSwigger) | Single-packet attack, HTTP/2 techniques |
| "Race Condition" on HackerOne Hacktivity | Real race condition disclosures |
| Turbo Intruder documentation | Tool-specific techniques |
| Burp Suite race condition labs | Hands-on methodology |

**Key Questions to Answer**:
- What operations are race-prone? (balance updates, promo codes, state changes)
- How to achieve true simultaneous requests?
- Single-packet attack vs traditional threading?
- How to detect successful race (response diff, state check)?
- What's the minimum/maximum thread count?

**Uber-Specific Focus**:
- Promo code redemption
- Ride cancellation/refund timing
- Payment processing windows
- Driver/rider matching state

**Time Estimate**: 4 hours research + 1.5 hours prompt creation

---

### 1.3 API Security Testing

**Output**: `prompts/bugbounty/api-security-testing.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| OWASP API Security Top 10 | Core API vulnerabilities |
| Burp Suite API testing guides | Methodology for API enumeration |
| GraphQL security research | GraphQL-specific attacks (introspection, batching) |
| Postman/Insomnia workflows | API collection building |

**Key Questions to Answer**:
- How to enumerate hidden API endpoints?
- What headers reveal API behavior? (X-Forwarded-For, Accept, Content-Type)
- How to test for mass assignment?
- What's the BOLA (Broken Object Level Authorization) testing flow?
- How to find undocumented parameters?

**Uber-Specific Focus**:
- api.uber.com endpoint enumeration
- Mobile API vs Web API differences
- Internal API exposure via subdomains
- GraphQL endpoints (if any)

**Time Estimate**: 4 hours research + 1.5 hours prompt creation

---

### 1.4 Authentication Bypass Playbook

**Output**: `prompts/bugbounty/auth-bypass.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| HackerOne auth bypass disclosures | Real bypass techniques |
| OAuth security research | OAuth flow vulnerabilities |
| 2FA bypass techniques (various researchers) | Common 2FA weaknesses |
| Session management attacks | Session fixation, token leakage |

**Key Questions to Answer**:
- What are the common 2FA bypass patterns?
- How to test OAuth state parameter handling?
- What indicates session token predictability?
- How to find account takeover chains?
- Password reset flow weaknesses?

**Uber-Specific Focus**:
- Uber's phone-based auth
- Account linking (Google, Apple, Facebook)
- Driver vs Rider auth separation
- Session handling across apps (Uber, UberEats, Driver)

**Time Estimate**: 4 hours research + 1.5 hours prompt creation

---

## Priority 2: High-Impact Gaps

### 2.1 Business Logic Flaw Framework

**Output**: `prompts/bugbounty/business-logic-flaws.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| Business logic bugs on HackerOne | Pattern recognition from disclosures |
| E-commerce logic flaws (various) | Pricing, cart, coupon abuse patterns |
| PortSwigger business logic labs | Methodology for logic testing |

**Key Questions to Answer**:
- What workflows have multi-step state? (order → pay → confirm)
- Where does price calculation happen? (client vs server)
- What happens when steps are skipped/reordered?
- How to identify trust assumptions in workflows?
- What's the impact chain for logic bugs?

**Uber-Specific Focus**:
- Surge pricing manipulation
- Ride estimation vs actual fare
- Promo/discount stacking
- Cancellation fee logic
- Driver earnings calculation

**Time Estimate**: 3 hours research + 1 hour prompt creation

---

### 2.2 HackerOne Report Writing Template

**Output**: `prompts/bugbounty/report-template.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| HackerOne's report writing guide | Official best practices |
| High-signal disclosed reports | What makes reports get paid fast |
| Researcher tips (Twitter/blogs) | What triagers appreciate |

**Key Sections**:
```
1. Title (concise, impact-focused)
2. Summary (1-2 sentences)
3. Severity justification (CVSS if applicable)
4. Steps to reproduce (numbered, precise)
5. Impact statement (business impact)
6. Proof of concept (screenshots, video, code)
7. Remediation suggestion (optional but valued)
```

**Time Estimate**: 1.5 hours research + 1 hour prompt creation

---

### 2.3 Recon Automation Workflow

**Output**: `prompts/bugbounty/recon-workflow.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| Bug bounty recon methodology (various hunters) | Tool chains and workflows |
| subfinder, httpx, nuclei documentation | Tool-specific options |
| Automation scripts (GitHub) | Patterns for orchestration |

**Workflow to Document**:
```
1. Asset discovery (subfinder, amass)
2. HTTP probing (httpx with tech detection)
3. Passive scanning (nuclei exposure templates)
4. Content discovery (ffuf with wordlists)
5. Screenshot capture (gowitness/eyewitness)
6. Output organization and prioritization
```

**Time Estimate**: 2 hours research + 1 hour prompt creation

---

## Priority 3: Enhancement Gaps

### 3.1 Burp Suite Methodology

**Output**: `prompts/bugbounty/burp-methodology.prompt.md`

| Research Source | What to Extract |
|-----------------|-----------------|
| PortSwigger Burp documentation | Feature utilization |
| Burp extensions for bug bounty | Essential extensions list |
| Intercept/modify patterns | Common testing flows |

**Time Estimate**: 2 hours research + 1 hour prompt creation

---

## Execution Schedule

| Day | Focus | Deliverable |
|-----|-------|-------------|
| **Day 1 (3h)** | IDOR Hunting | `idor-hunting.prompt.md` |
| **Day 1 (2h)** | Report Template | `report-template.prompt.md` |
| **Day 2 (5h)** | Race Conditions | `race-condition-testing.prompt.md` |
| **Day 3 (5h)** | API Security | `api-security-testing.prompt.md` |
| **Day 4 (5h)** | Auth Bypass | `auth-bypass.prompt.md` |
| **Day 5 (4h)** | Business Logic | `business-logic-flaws.prompt.md` |
| **Day 5 (3h)** | Recon Workflow | `recon-workflow.prompt.md` |
| **Day 6 (3h)** | Burp Methodology | `burp-methodology.prompt.md` |

**Total Time**: ~30 hours across 6 days

---

## Research Sources Master List

### Primary Sources
- [ ] HackerOne Hacktivity (filtered by vulnerability type)
- [ ] PortSwigger Web Security Academy
- [ ] OWASP Testing Guide v4.2
- [ ] Uber's disclosed reports on HackerOne

### Secondary Sources
- [ ] Twitter/X: @staboratory, @intigriti, @NahamSec, @jhaddix
- [ ] YouTube: NahamSec, InsiderPhD, STÖK
- [ ] GitHub: PayloadsAllTheThings, SecLists
- [ ] Blogs: PortSwigger Research, ProjectDiscovery

### Tool Documentation
- [ ] Burp Suite Pro documentation
- [ ] nuclei templates repository
- [ ] ffuf usage guide
- [ ] subfinder/httpx ProjectDiscovery docs

---

## Validation Criteria

Each prompt is complete when it can answer:

1. ✅ **What to look for** — Clear identification checklist
2. ✅ **How to test** — Step-by-step methodology
3. ✅ **How to prove** — PoC creation guidance
4. ✅ **How to report** — Impact framing for maximum payout
5. ✅ **Uber-specific** — Applied to Uber's attack surface

---

## Trade-Off Decision

**Option A**: Complete all research before hunting (6 days)
**Option B**: Hunt while researching (parallel track)

**Recommendation**: Option B — Start hunting on Day 1 with IDOR focus (your strongest skill). Research in parallel. Real findings will inform prompt quality better than pure research.

---

## Next Actions

1. [ ] Start IDOR research (HackerOne Hacktivity + Uber disclosures)
2. [ ] Create `prompts/bugbounty/` directory structure
3. [ ] Begin Day 1 recon on Uber while researching
4. [ ] Document discoveries as they happen

# Mental Model Integration — Uber Sprint Learnings

> **Date**: 2025-12-06
> **Source**: Uber Bug Bounty Sprint (7 sessions, 3 critical findings, 1 submitted H1 report)
> **Purpose**: Integrate systematic hacking knowledge into core mental model

---

## What Changed

### 1. New Core Function (#15)

**Added**: Bug Bounty & Ethical Hacking (🎯 Hacker Mode)

**Location**: `.github/instructions/functions.instructions.md`

**Capabilities**:
- Systematic vulnerability discovery (2FA bypass, IDOR, business logic)
- ROI-driven attack surface prioritization
- Proven methodologies from real findings
- Efficiency protocols (3-4x speedup targets)

---

### 2. Methodologies Library

**Location**: `.github/methodologies/`

**Files Created**:
1. **2fa-bypass-testing.md** — 5-phase systematic testing (3/3 success rate on Uber)
2. **idor-hunting-checklist.md** — Two-account IDOR detection workflow
3. **business-logic-patterns.md** — 8 common flaw patterns with detection methods

**Integration**: Auto-loaded when relevant trigger words detected in conversation

---

### 3. Efficiency Protocol

**Location**: `.github/workflows/hacking-efficiency.protocol.md`

**Key Optimizations**:
- Phase-based workflow (Recon → Setup → Testing → Reporting)
- ROI-driven tool selection (skip nuclei on mature programs)
- Time budgets per phase (9 hours → 5 hours target)
- Anti-pattern detection (preparation loop, scope creep, perfectionism)

**Proven Results**: 8-hour Uber sprint → 3 critical findings → Expected $15k+ bounty

---

### 4. Mental Model Updates

**Location**: `.github/project/mental-model-map.md`

**Added Sections**:
- Hacking-specific loading patterns
- Trigger word → Resource mapping
- Next action protocol for "let's hunt [target]"

**Example Workflow**:
```
User: "let's hunt shopify"
→ Load: hacking-efficiency.protocol.md
→ Check: targets/shopify/ exists?
→ If not: Run recon-chain.sh
→ If yes: Resume from session state
→ Execute: Systematic testing per protocol
```

---

## Communication Enhancements (Hacker Mode)

### New Behavioral Rules

When in hacking context (detected via trigger words):

**1. Direct, Action-Oriented Language**
- ❌ "We could consider testing this endpoint..."
- ✅ "Test POST /api/updateEmail for 2FA bypass"

**2. Explicit Trade-offs**
- ❌ "Let's try a few things"
- ✅ "Auth testing: 2 hours, 70% success rate. IDOR: 1 hour, 30% success rate. Which first?"

**3. Call Out Dispersal**
- ❌ [User tests 4 things simultaneously]
- ✅ "You're testing 4 things. Pick ONE to complete before moving."

**4. Evidence Obsession**
- ❌ "This might be vulnerable"
- ✅ "Capture the request/response. Show me the evidence."

**5. Impact-First Framing**
- ❌ "There's a bug in email change"
- ✅ "This allows full account takeover via stolen session"

---

## Attack Surface Prioritization (Built-In Knowledge)

### High ROI (Focus Here First)

| Target | Why | Expected Yield | Time |
|--------|-----|----------------|------|
| Auth flows (login, 2FA, password reset, email change) | Leads to ATO | 1-3 critical findings | 2 hours |
| GraphQL/API endpoints with UUID parameters | IDOR opportunities | 0-2 high findings | 1 hour |

### Medium ROI (Secondary)

| Target | Why | Expected Yield | Time |
|--------|-----|----------------|------|
| Payment/promo flows | Business logic flaws | 1-2 medium findings | 1 hour |
| File upload, profile update | XSS, injection | 0-1 medium findings | 1 hour |

### Low ROI (Skip or Automate)

| Target | Why | Expected Yield | Time |
|--------|-----|----------------|------|
| Static subdomains on mature programs | Already hardened | ~0 findings | 30 min |
| Passive nuclei scans | Miss 90% of logic bugs | ~0 findings | 30 min |

**Decision Rule**: Test high ROI manually, skip low ROI, automate medium ROI if patterns emerge.

---

## Proven Methodologies (Now Internalized)

### Methodology 1: 2FA Bypass Testing

**Phase Structure**:
1. **Setup** (15 min) — Enable 2FA, save TOTP secret
2. **Map Operations** (30 min) — Identify all sensitive endpoints
3. **Test Each** (1.5 hours) — Systematic bypass testing
4. **Document** (30 min) — Write PoC, calculate CVSS

**Success Rate**: 3/3 critical findings on Uber

**Key Insight**: Login 2FA ≠ operation-level 2FA. Test independently.

---

### Methodology 2: IDOR Hunting

**Requirements**: Two test accounts (Account A = attacker, Account B = victim)

**Workflow**:
1. Extract victim identifiers (UUID, email)
2. Use attacker session to access victim resources
3. Check response for PII leakage
4. Test write operations (PATCH, POST, DELETE)

**Limitation**: UUIDs must be leaked (not enumerable for v4)

**Success Rate**: 10-30% (UUID-dependent)

---

### Methodology 3: Business Logic Flaws

**8 Core Patterns**:
1. State machine bypass
2. Race conditions
3. Error message enumeration
4. Price manipulation
5. Multi-tenant data leakage
6. Workflow bypass
7. Parameter tampering
8. Insufficient rate limiting

**Detection**: Requires business context understanding + creative testing

**Success Rate**: 10-30% (context-dependent)

---

## Tools Integration (Future State)

### Phase 1 Tools (To Be Built)

**Priority 1** (Immediate ROI):
- `recon-chain.sh` — Automated enumeration pipeline (1 hour → 15 min)
- `session-manager.py` — Encrypted cookie storage (30 min → 5 min)

**Priority 2** (Medium ROI):
- `idor-tester.py` — Automated two-account testing
- `graphql-builder.py` — GraphQL query construction
- `h1-report-builder.py` — Findings JSON → H1 markdown

**Timeline**: Build Priority 1 before next program (5 hours investment)

---

## Efficiency Metrics (Now Tracked)

### Per-Program Target

| Phase | Manual Time | Automated Time | Savings |
|-------|-------------|----------------|---------|
| Recon | 1 hour | 30 min | 30 min |
| Account Setup | 30 min | 15 min | 15 min |
| Auth Testing | 3 hours | 2 hours | 1 hour |
| IDOR Testing | 2 hours | 1 hour | 1 hour |
| Logic Testing | 1.5 hours | 1 hour | 30 min |
| Reporting | 1 hour | 30 min | 30 min |
| **Total** | **9 hours** | **5 hours** | **4 hours (44%)** |

**Break-even**: Toolkit investment (27 hours) / Savings per program (4 hours) = **7 programs**

---

## Anti-Patterns (Now Detected)

When these patterns are detected, I will call them out:

### 1. Preparation Loop
**Pattern**: "Let me research this program for 2 hours first"
**Intervention**: "Research OR test, not research THEN test. Run recon (30 min), learn while testing."

### 2. Tool Obsession
**Pattern**: "Let me configure perfect Burp macros first"
**Intervention**: "Test 3 endpoints manually. Automate only if pattern proven."

### 3. Scope Creep
**Pattern**: Testing 5 attack surfaces simultaneously
**Intervention**: "You're testing 5 things. Complete auth testing, then move to IDOR."

### 4. UUID Brute-forcing
**Pattern**: "Let me try to enumerate UUIDs"
**Intervention**: "v4 UUIDs = 2^122 space. Not feasible. Look for leaks instead."

### 5. Generic Reporting
**Pattern**: Vague H1 report without specifics
**Intervention**: "HackerOne wants: exact endpoint, payload, response, impact. Add these."

---

## Session State Protocol (Enhanced)

### During Hacking Sessions

**Track in** `.github/project/session-state.md`:
```markdown
## Active Testing: [Target]

**Phase**: [Recon/Auth Testing/IDOR/Logic/Reporting]
**Progress**: [X/Y operations tested]
**Findings**: [N critical, M high, P medium]
**Blocked**: [Dependencies or unknowns]
**Next**: [Immediate next action]

**Time Budget**: [Spent] / [Allocated]
```

**Update frequency**: Every 30-60 minutes during active testing

---

### After Session

1. Commit findings: `git add targets/[target]/findings/*.md`
2. Update session state with summary
3. If findings → Generate reports with `h1-report-builder.py`
4. Sync to GitHub: `git push`

---

## Loading Protocol (Enhanced)

### Trigger Detection

When user message contains:

| Triggers | Auto-Load |
|----------|-----------|
| "let's hunt", "start testing", "test [target]" | `workflows/hacking-efficiency.protocol.md` |
| "2FA", "auth bypass", "email change" | `methodologies/2fa-bypass-testing.md` |
| "IDOR", "two accounts", "UUID" | `methodologies/idor-hunting-checklist.md` |
| "business logic", "race condition", "promo" | `methodologies/business-logic-patterns.md` |
| "recon", "subfinder", "subdomain" | `prompts/bugbounty/recon-workflow.prompt.md` |
| "report", "H1", "submit" | `prompts/bugbounty/report-template.prompt.md` |

### Next Action Protocol

After loading:
1. Check workspace: `ls targets/[target]/`
2. If new target → Start with recon
3. If existing → Resume from session state
4. If unclear → Ask: "Which attack surface? Auth, IDOR, logic, or all?"
5. Execute → Document → Report

**No preparation loop. Test → Learn → Iterate.**

---

## CVSS Knowledge (Internalized)

### Quick Reference

| Vulnerability Type | Typical CVSS | HackerOne Impact | Proven Examples |
|-------------------|--------------|------------------|-----------------|
| ATO via 2FA bypass | 9.0-9.8 (Critical) | $5k-$15k | Uber email change (H1 #3454674) |
| IDOR (sensitive data) | 7.0-8.5 (High) | $2k-$7k | Common on GraphQL APIs |
| Business logic flaw | 6.0-8.0 (Medium-High) | $1k-$5k | Promo race conditions |
| Race condition | 5.0-7.0 (Medium) | $500-$3k | Payment double-spend |
| XSS (stored) | 6.0-7.5 (Medium-High) | $1k-$4k | Profile/comment fields |

### Impact Assessment Template

Always frame as: **"This allows attacker to [action]"**

Examples:
- "This allows full account takeover via stolen session"
- "This allows attacker to drain victim's wallet balance"
- "This allows enumeration of all user emails in the platform"

---

## Key Learnings (Generalized from Uber)

1. **Mature programs = tight perimeters** → Focus on auth logic, not infrastructure
2. **GraphQL introspection usually disabled** → Extract operations from JS bundles instead
3. **2FA bypass is underexplored** → Most researchers skip operation-level testing
4. **Business portals are gold** → Multi-tenant apps often leak org IDs
5. **Speed matters** → First few submissions get higher bounties (novelty premium)
6. **Manual > Automated for logic bugs** → Nuclei/scanners miss 90% of business logic flaws
7. **UUIDs are not enumerable** → Look for leaks, don't brute force v4 UUIDs
8. **Error messages leak information** → Always test with multiple invalid inputs

---

## Success Criteria (Per Program)

### Technical Success
- [ ] Recon completed in <30 minutes
- [ ] At least 1 valid finding (any severity)
- [ ] Systematic methodology followed (not random testing)
- [ ] Evidence captured (request/response, screenshots)

### Efficiency Success
- [ ] Total time <8 hours
- [ ] No preparation loop (testing started within 1 hour)
- [ ] No scope creep (one attack surface completed before switching)
- [ ] Session state maintained (documented progress)

### Financial Success
- [ ] Expected bounty >$500 (minimum viable)
- [ ] ROI >$100/hour (efficiency threshold)

---

## Integration Complete

**New Capabilities**:
- ✅ Function #15 added (Bug Bounty & Ethical Hacking)
- ✅ 3 methodologies created (2FA, IDOR, business logic)
- ✅ Efficiency protocol built (5-hour target)
- ✅ Mental model updated (loading patterns, session tracking)
- ✅ Communication enhanced (hacker mode behavioral rules)

**Next Steps**:
1. Test on next program (validate integration)
2. Build Priority 1 tools (recon-chain, session-manager)
3. Refine based on real-world usage
4. Iterate efficiency metrics

**Expected Outcome**: 3-4x speedup on future programs, systematic instead of random testing, higher finding quality.

---

## References

**Analysis Documents**:
- `internal-analysis/reusable-components-analysis.md` — Component extraction
- `internal-analysis/architecture-analysis.md` — System design patterns
- `internal-analysis/implementation-roadmap.md` — Build timeline

**Active Resources**:
- `.github/instructions/functions.instructions.md` — Core capabilities
- `.github/methodologies/*.md` — Testing checklists
- `.github/workflows/hacking-efficiency.protocol.md` — Operational workflow
- `.github/project/mental-model-map.md` — Prompt/resource mapping

**Uber Artifacts**:
- `uber-recon/` — Recon data (169 subdomains, 23 priority)
- `uber-recon/findings/` — 3 critical findings (ATO via 2FA bypass)
- `Reports/2025-12-06_Handoff_Uber-Bug-Bounty-*.md` — 7 session handoffs

---

## Changelog

- **2025-12-06**: Integration complete. Uber sprint learnings fully internalized into core mental model. Ready for next program with 3-4x efficiency improvement target.

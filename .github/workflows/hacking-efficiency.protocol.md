# Hacking Efficiency Protocol

> **Purpose**: Optimize hacking workflows based on proven ROI data from Uber sprint
> **Target**: 3-4x efficiency improvement over manual workflows
> **Applies to**: Bug bounty programs, penetration testing, security research

---

## Core Principles

### 1. ROI-Driven Prioritization

**High ROI (>80% time savings)**:
- ✅ Automated recon pipelines (1 hour → 15 min)
- ✅ Session management tools (30 min → 5 min)
- ✅ Manual auth flow testing (3 critical findings in 2 hours)

**Medium ROI (30-50% savings)**:
- ⚠️ GraphQL operation extraction
- ⚠️ IDOR test automation (requires two accounts)

**Low ROI (<20% savings)**:
- ❌ Nuclei passive scans on mature programs (0 findings)
- ❌ GraphQL introspection attempts (usually disabled)
- ❌ UUID brute-forcing (not feasible)

**Decision Rule**: Automate high ROI, skip low ROI, selectively use medium ROI.

---

## Phase-Based Workflow

### Phase 0: Program Selection (15 min)

**Criteria** (from skill-gap-research-plan.md):
1. Response rate >90% (active triage)
2. Recent payments (active bounty budget)
3. Scope includes web apps (not just mobile/hardware)
4. Medium-high asset count (10-50 domains)

**Tools**:
- HackerOne directory filters
- `mcp_hackerone_GetHackerOneReports` for recent activity

**Output**: 1 selected target, saved to `targets/[name]/`

---

### Phase 1: Reconnaissance (30 min)

**Step 1.1: Automated Enumeration (15 min)**
```bash
# Run recon chain
./tools/recon-chain.sh target.com targets/target/recon-output

# Output:
# - subdomains.txt (all discovered subdomains)
# - live-hosts.txt (HTTP-probed, with tech stack)
# - priority-targets.txt (filtered by keywords)
```

**Step 1.2: Manual Prioritization (15 min)**
Review `priority-targets.txt`:
- Focus: Internal tools, admin panels, API endpoints, GraphQL
- Skip: Marketing sites, CDNs, static subdomains
- Create `manual-targets.txt` with top 5-10

**Optimization**: Use `grep` patterns from Uber success:
```bash
grep -iE 'admin|internal|api|graphql|business|employee|staging|preprod' live-hosts.txt
```

**Output**: 5-10 high-priority targets for manual testing

---

### Phase 2: Account Setup (15 min)

**Step 2.1: Create Test Accounts**
- Account A (primary): Use real email for verification
- Account B (IDOR victim): Use email alias (name+test@gmail.com)

**Step 2.2: Enable 2FA**
- Enable on Account A
- Save TOTP secret to session manager
- Test 2FA works (logout/login)

**Step 2.3: Session Storage**
```bash
# Save session cookies
bbtk session save target.com

# Verify
bbtk session load target.com --curl-format
```

**Output**: Two accounts, 2FA enabled, sessions saved

---

### Phase 3: Auth Flow Testing (2 hours) ⭐ **HIGHEST ROI**

**Step 3.1: Map Sensitive Operations (30 min)**
Using browser DevTools, document:
- [ ] Email change endpoint
- [ ] Password change endpoint
- [ ] Phone number change endpoint
- [ ] Payment method add endpoint
- [ ] 2FA disable endpoint
- [ ] API key generation endpoint

**Step 3.2: Systematic 2FA Bypass Testing (1.5 hours)**
For each operation:
1. Trigger operation with valid session
2. Intercept request (Burp/DevTools)
3. Check for 2FA challenge
4. If no challenge → Submit → Verify completion
5. Document finding

**Use checklist**: `.github/methodologies/2fa-bypass-testing.md`

**Expected Yield**: 1-3 critical/high findings (proven 3/3 on Uber)

---

### Phase 4: IDOR Testing (1 hour)

**Only if**:
- UUIDs are leaked (API responses, URLs)
- Two-account setup is complete
- Endpoints accept UUID parameters

**Step 4.1: Extract Account B Identifiers**
- User UUID
- Email
- Any other unique IDs

**Step 4.2: Test with Account A Session**
```bash
# Automated IDOR testing
python tools/idor-tester.py \
  --attacker-session targets/target/session-a.json \
  --victim-data targets/target/victim-b.json \
  --endpoints targets/target/endpoints.txt
```

**Use checklist**: `.github/methodologies/idor-hunting-checklist.md`

**Expected Yield**: 0-2 findings (lower success rate, UUID-dependent)

---

### Phase 5: Business Logic Testing (1 hour)

**Step 5.1: Identify Workflows**
- Payment flows
- Promo code application
- Referral systems
- Multi-step verification

**Step 5.2: Test Patterns**
From `.github/methodologies/business-logic-patterns.md`:
- State machine bypass (PENDING = VERIFIED?)
- Race conditions (parallel promo requests)
- Error message enumeration (valid expired vs invalid)

**Expected Yield**: 1-2 findings (context-dependent)

---

### Phase 6: Reporting (30 min)

**Step 6.1: Generate Reports**
```bash
# Convert findings to H1 format
python tools/h1-report-builder.py \
  --findings targets/target/findings/*.json \
  --output targets/target/reports/
```

**Step 6.2: Manual Review**
- Verify CVSS scores
- Add screenshots/video
- Write clear impact statements

**Step 6.3: Submit**
- Submit during business hours (faster triage)
- Include source IP
- Use professional tone

**Output**: Submitted reports, tracking numbers saved

---

## Time Budget (Per Program)

| Phase | Manual (Old) | Automated (New) | Savings |
|-------|-------------|-----------------|---------|
| Recon | 1 hour | 30 min | 30 min |
| Account Setup | 30 min | 15 min | 15 min |
| Auth Testing | 3 hours | 2 hours | 1 hour |
| IDOR Testing | 2 hours | 1 hour | 1 hour |
| Logic Testing | 1.5 hours | 1 hour | 30 min |
| Reporting | 1 hour | 30 min | 30 min |
| **Total** | **9 hours** | **5 hours** | **4 hours (44% faster)** |

**ROI after toolkit**: ~2x speedup (9 hrs → 5 hrs)

---

## Decision Points

### Decision 1: Skip Nuclei?

**Data from Uber**: 30 min scan, 0 findings on mature program

**Rule**: Skip nuclei on programs with >90% response rate (mature perimeter)

**Exception**: Run on internal/staging subdomains (lower maturity)

---

### Decision 2: GraphQL or REST?

**If GraphQL**:
1. Test introspection (usually disabled)
2. Extract operations from JS bundles
3. Focus on mutations with UUID params

**If REST**:
1. Map endpoints from network tab
2. Test IDOR on GET endpoints
3. Test auth bypass on POST/PUT/PATCH

**Time allocation**: GraphQL = 1.5x REST (more complex)

---

### Decision 3: Two Accounts or One?

**One account**: Auth bypass, business logic, race conditions
**Two accounts**: IDOR testing, multi-tenant bugs

**Rule**: Always create two accounts (marginal cost, high upside)

---

## Anti-Patterns (What Slows You Down)

### Anti-Pattern 1: Preparation Loop
❌ "Let me research this program for 2 hours first"
✅ "Let me run recon (30 min), then test while learning"

**Fix**: Test → Learn → Iterate (not Research → Research → Maybe Test)

---

### Anti-Pattern 2: Tool Obsession
❌ "Let me configure Burp macros for every endpoint"
✅ "Let me test 3 endpoints manually, automate if pattern emerges"

**Fix**: Manual first, automate only proven patterns

---

### Anti-Pattern 3: Scope Creep
❌ Testing 5 different attack surfaces simultaneously
✅ Complete auth testing, then move to IDOR

**Fix**: ONE attack surface to completion before switching

---

### Anti-Pattern 4: Perfectionism
❌ "Let me test all 50 subdomains thoroughly"
✅ "Let me test top 5 priority targets, expand if findings emerge"

**Fix**: 80/20 rule — top 20% of targets yield 80% of findings

---

## Communication Protocol (Hacker Mode)

When in active testing:

**Direct Language**:
- ❌ "We could consider testing this endpoint..."
- ✅ "Test this endpoint for 2FA bypass: POST /api/updateEmail"

**Trade-off Transparency**:
- ❌ "Let's try a few things"
- ✅ "2FA testing: 2 hours, 70% success rate. IDOR testing: 1 hour, 30% success rate. Which first?"

**Call Out Dispersal**:
- ❌ [Switching between recon, testing, report writing]
- ✅ "You're testing 3 things. Pick ONE to complete."

**Evidence Obsession**:
- ❌ "I think this might be vulnerable"
- ✅ "Capture the request/response before claiming bypass"

---

## Session State Tracking

### During Testing
Update `.github/project/session-state.md`:
```markdown
## Active Testing: Uber

**Phase**: Auth Flow Testing (Phase 3)
**Progress**: 5/8 operations tested
**Findings**: 2 critical (email change, password change)
**Blocked**: None
**Next**: Test payment method add, phone change, 2FA disable

**Time Spent**: 1.5 hours
**Estimated Remaining**: 30 min
```

### After Session
```bash
# Commit findings
git add targets/uber/findings/*.md
git commit -m "Uber: 2 critical auth bypasses found"

# Update session state
echo "Last session: 2025-12-06, 2 critical findings, auth testing complete" >> .github/project/session-state.md

# Sync
git push
```

---

## Efficiency Metrics

### Track Per Program

| Metric | Target | Uber Actual |
|--------|--------|-------------|
| Recon time | <30 min | 45 min (over target) |
| First finding | <3 hours | 2 hours ✅ |
| Critical findings | 1-3 | 3 ✅ |
| Total time | 5-8 hours | 8 hours (acceptable) |
| ROI | $500+/hour | ~$2000/hour (3 findings) |

**Improvement areas**: Automate recon (45 min → 15 min)

---

## Tool Checklist

### Must Have (Phase 1)
- [ ] `recon-chain.sh` — Automated recon
- [ ] `session-manager.py` — Encrypted cookie storage
- [ ] Methodologies (2FA, IDOR, business logic)

### Nice to Have (Phase 2)
- [ ] `idor-tester.py` — Automated IDOR testing
- [ ] `graphql-builder.py` — GraphQL query construction
- [ ] `h1-report-builder.py` — Report generation

### Future (Phase 3)
- [ ] Web UI for test management
- [ ] Integration with HackerOne API (auto-submit)
- [ ] Vulnerability database (track patterns across programs)

---

## Adaptation Protocol

After each program:

1. **Measure** actual time vs budget
2. **Identify** bottlenecks (where did time go?)
3. **Decide** what to automate next (highest time sink)
4. **Build** tool or refine methodology
5. **Test** on next program

**Example** (from Uber):
- Bottleneck: Manual session cookie management (30 min/program)
- Decision: Build session-manager.py
- Expected ROI: 30 min → 5 min (6x speedup)

---

## Next Action Protocol

When user says **"let's hunt [target]"**:

1. Load this protocol + relevant methodologies
2. Check if target has existing recon: `ls targets/[target]/`
3. If not → Run Phase 1 (recon chain)
4. If yes → Ask: "Which attack surface? Auth flows, IDOR, business logic, or all?"
5. Execute phase → Document findings → Generate report
6. Update session state → Commit

**No preparation loop. Test → Learn → Iterate.**

---

## References

- **Uber Sprint Analysis**: `internal-analysis/reusable-components-analysis.md`
- **Methodologies**: `.github/methodologies/*.md`
- **Tools** (when built): `.github/tools/*.{sh,py}`
- **Mental Model**: `.github/project/mental-model-map.md`

---

## Changelog

- **2025-12-06**: Created from Uber sprint ROI analysis (3 critical findings, 8 hours)
- **Future**: Add GraphQL-specific efficiency patterns, multi-program comparative metrics

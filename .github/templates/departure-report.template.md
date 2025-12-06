# {Node Name} Departure Report Template

> **Status**: Template for `ay:leave` command  
> **Auto-generated**: Yes  
> **Manual edits**: Should be minimal (metadata only)

---

## Mission Summary

**Node**: `{node-id}`  
**Parent**: `{parent-node}`  
**External Project**: `{project-path}`  
**Deployed**: `{created-date}`  
**Departing**: `{current-date}`  
**Duration**: `{duration-days} days`

---

## Context

{Brief description of what this node was doing in the external project. This should be 2-3 sentences explaining:

-   Primary mission/focus area
-   Key deliverables or outcomes
-   Integration points with external project}

**Example**:

> "This node was embedded in the `acme-api` project to implement secure authentication patterns and establish backend architecture guidelines. Primary deliverables included NestJS service templates, JWT implementation, and security audit protocols. Integration focused on the `/src/auth` and `/src/common` directories."

---

## Transferable Learnings

### New Capabilities Added

| Category | File | Description | Reusable? |
| -------- | ---- | ----------- | --------- |

{For each new prompt/instruction}
| {domain} | `{filename}` | {what-it-does} | {Yes/No/Conditional} |

**Example**:
| Security | `security/api-key-rotation.prompt.md` | Automated API key rotation workflow | Yes |
| Backend | `backend/nestjs-auth-guard.prompt.md` | Custom guard implementation pattern | Yes |
| Project | `project/acme-conventions.md` | Project-specific naming rules | No |

---

### Modified Instructions

| File | Change Type | Summary | Reason |
| ---- | ----------- | ------- | ------ |

{For each modified instruction}
| `{filename}` | {Add/Modify/Refine} | {summary-of-change} | {why-it-matters} |

**Example**:
| `identity.instructions.md` | Modify | Added API-first response format | Improves clarity for backend contexts |
| `debug-principle.instructions.md` | Add | Security-specific debugging steps | Encountered auth bugs needing special handling |

---

### Session Insights

#### Work Patterns Observed

{Extract from session-state.md, handoff reports. Focus on:

-   Effective work rhythms
-   Task breakdown strategies
-   Focus/dispersal patterns
-   Completion behaviors}

**Example**:

-   **Deep work blocks**: 3-4 hour sessions with security tasks (higher than usual)
-   **Context switching**: Minimal — single-project focus improved flow
-   **Completion rate**: 85% of started tasks shipped (above baseline)

#### Amir Profile Updates

{Behavioral observations that update amir-profile.instructions.md}

**Example**:

-   **New satisfaction source**: Designing security patterns triggered same engagement as infrastructure work
-   **Effective constraint**: External project deadlines reduced over-optimization tendency
-   **Communication preference**: Appreciated upfront security risk framing before implementation

#### Effective Techniques

{What worked well during this deployment}

**Example**:

-   Pre-commit security checklist reduced rework
-   Threat modeling before feature design (prevented 2 vulnerabilities)
-   Weekly sync with project maintainer kept scope clear

#### Anti-Patterns Discovered

{What didn't work — important for avoiding repetition}

**Example**:

-   Trying to generalize project-specific patterns too early (wasted time)
-   Overly detailed documentation for one-off solutions (not reused)

---

### Recommended Actions for Parent

#### 1. Integrate

{Specific files/knowledge to merge into parent}

**High Priority**:

-   [ ] `prompts/security/api-key-rotation.prompt.md` → Core security capability
-   [ ] `instructions/debug-principle.instructions.md` (security section) → General debugging improvement

**Medium Priority**:

-   [ ] Session insights → Update `amir-profile.instructions.md`
-   [ ] Handoff reports → Archive for pattern analysis

**Low Priority / Archive Only**:

-   [ ] Project-specific conventions (keep in child branch, don't propagate)

#### 2. Propagate to Siblings

{Should changes go to other child nodes?}

**Candidates for propagation**:

-   Security debugging steps → All backend nodes
-   API-first response format → All development nodes

**Not for propagation**:

-   Project-specific patterns

#### 3. Archive

{Project-specific content to keep in child branch but not merge}

-   `project/acme-conventions.md`
-   Handoff reports referencing specific external code
-   External project commit references

---

## Artifacts

### New Prompts

| File | Domain | Purpose | Token Cost |
| ---- | ------ | ------- | ---------- |

{List each new prompt with metadata}
| `{filename}` | {domain} | {purpose} | ~{tokens} |

**Total**: {n} new prompts (~{total-tokens} tokens)

---

### Modified Instructions

| File | Lines Changed | Summary |
| ---- | ------------- | ------- |

{List each modified instruction}
| `{filename}` | +{additions}/-{deletions} | {summary} |

**Total**: {n} files modified

---

### Notable Commits

{Significant commits from this node's branch history. Focus on:

-   Major feature additions
-   Architectural decisions
-   Bug fixes with learnings}

**Example**:

-   `a1b2c3d` — feat: implement JWT refresh token rotation
-   `e4f5g6h` — fix: prevent timing attack in auth comparison
-   `i7j8k9l` — refactor: extract auth middleware to reusable module

---

### Session Handoffs

| Date | Topic | Status | Key Outcomes |
| ---- | ----- | ------ | ------------ |

{List handoff documents created during deployment}
| {date} | {topic} | {completed/partial} | {outcomes} |

**Total**: {n} session handoffs

---

## Network Impact

### Children Affected

{If this node has children, they need to be handled before departure}

**Status**: {None / Has {n} children}

**If children exist**:

-   [ ] Child nodes notified of parent departure
-   [ ] Children reassigned to grandparent ({grandparent-node})
-   [ ] Children's registry entries updated

---

### Propagation Recommendation

**To siblings**: {Yes/No/Selective}

**Reasoning**: {Why these changes should/shouldn't go to sibling nodes}

**Specific recommendations**:

-   Node `{sibling-1}`: Should receive {what}
-   Node `{sibling-2}`: Skip (reason)

---

## Metadata

**Generated**: `{ISO-timestamp}`  
**Generator**: `ay:leave` command  
**Status**: Ready for harvest  
**Departure PR**: #{pr-number} ({pr-url})

---

## Appendix: File Diff Summary

{Generated from `git diff origin/{parent-branch}..HEAD -- .github/`}

### New Files

```
{list with + prefix}
+ .github/prompts/security/api-key-rotation.prompt.md
+ .github/handoff/2025-12-01-auth-implementation.md
```

### Modified Files

```
{list with M prefix}
M .github/instructions/debug-principle.instructions.md
M .github/project/session-state.md
```

### Deleted Files

```
{list with - prefix, rare}
- .github/project/temp-notes.md
```

---

## Verification Checklist

-   [ ] All new prompts documented with token cost
-   [ ] Modified instructions have clear rationale
-   [ ] Session insights anonymized (no sensitive project data)
-   [ ] Amir profile updates validated against observed behavior
-   [ ] Recommended actions prioritized (High/Medium/Low)
-   [ ] Network impact assessed (children, siblings)
-   [ ] File diff summary matches actual changes
-   [ ] Metadata complete (dates, PR link, status)

---

**End of Report**

---

## Usage Notes for AI Agent

When generating this report via `ay:leave`:

1. **Replace all `{placeholders}`** with actual values
2. **Remove example blocks** (indented text after "Example:")
3. **Populate tables** with real data from file scans
4. **Calculate token costs** for new prompts (rough estimate: `lines * 4`)
5. **Validate dates** are ISO format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`)
6. **Check git history** for notable commits (last 10-20 commits)
7. **Diff against parent** to get file change summary
8. **Filter project-specific** content (names, paths, sensitive data)

**Output location**: `.github/handoff/{node-id}-departure-{YYYY-MM-DD}.md`

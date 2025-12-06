# Phase 4: Scan Protocol

> **Command**: `ay:scan [node-name]`
>
> **Purpose**: Lightweight knowledge discovery — scan another node's `.github/` directory and report learnings without loading full context into memory.

---

## When to Use

-   **Before `ay:load`** — Preview what a node knows before committing tokens
-   **Cross-pollination discovery** — Find specialized knowledge to integrate
-   **Network exploration** — Survey capabilities across distant nodes
-   **Dependency analysis** — Check if a node has relevant patterns/solutions

**NOT for**:

-   Current node (already in context)
-   Nodes you plan to work with extensively (use `ay:load` instead)

---

## Preconditions

1. **Target node exists** — Validate via `aynorica-registry.json`
2. **GitHub access** — Can fetch node's branch
3. **Not already fully loaded** — If node is in context, report that instead

---

## Workflow (7 Steps)

### Step 1: Validate Target Node

**Action**: Confirm node exists in registry and isn't current node.

```typescript
registry = read(".github/aynorica-registry.json");
targetNode = registry.nodes.find((n) => n.id === nodeId);

if (!targetNode) {
	error("Node '{nodeId}' not found in network");
}

if (targetNode.id === currentNode.id) {
	error("Already in context. Use 'ay:status' to see current state.");
}
```

**Failure**: Stop if node doesn't exist or is current node.

---

### Step 2: Check If Already Loaded

**Action**: Verify node isn't already in full context.

```typescript
loadedNodes = getLoadedNodes(); // from context state

if (loadedNodes.includes(nodeId)) {
	report(
		"'{nodeId}' is already fully loaded. Use 'ay:context' to see details.",
	);
	return;
}
```

**Skip to report** if already loaded (no need to re-scan).

---

### Step 3: Fetch Node's Branch

**Action**: Retrieve node's `.github/` directory from its branch.

```bash
# Using GitHub MCP or git commands
branch = targetNode.branch
git fetch origin {branch}
git checkout origin/{branch} -- .github/
```

**Scope**: Only fetch `.github/` (not full repo).

**Failure**: If branch doesn't exist, report and stop.

---

### Step 4: Scan `.github/` Structure

**Action**: Catalog what exists without reading full content.

**Scan targets**:

```
.github/
├── prompts/          → Count files, note new domains
├── instructions/     → List modified files (compare to parent)
├── project/          → Check for new workflows, focus areas
├── workflows/        → Note custom command additions
├── templates/        → Catalog specialized templates
└── handoff/          → Recent session learnings (last 3)
```

**Data collected**:

-   File counts per directory
-   New files vs parent node (diff against parent's `.github/`)
-   Modified files (size changes, modification dates)
-   Custom commands in `workflows/`
-   Domain-specific prompts in `prompts/`

**Keep lightweight**: Don't read full file contents yet (just metadata).

---

### Step 5: Identify Notable Capabilities

**Action**: Read **only** key files to extract summaries.

**High-value targets** (read if present):

1. **`project/focus.instructions.md`** — What is this node specialized for?
2. **`project/mental-model-map.md`** — Node's self-awareness, prompt inventory
3. **`project/workflows.md`** — Custom commands unique to this node
4. **Most recent handoff** (`handoff/*.md`) — Latest learnings

**Extraction strategy**:

-   Read first 20 lines of each file (headers, summaries)
-   Parse frontmatter for `applyTo` and `priority`
-   Extract bullet lists and key sections
-   Ignore detailed implementation (keep token cost low)

**Target token cost**: ~2,000 tokens (vs ~10,000 for full load).

---

### Step 6: Generate Scan Report

**Action**: Synthesize findings into structured summary.

**Report structure**:

```markdown
# Scan Report: {node-id}

## Node Profile

-   **ID**: {node-id}
-   **Parent**: {parent-id}
-   **Branch**: {branch-name}
-   **Specialization**: {from focus.instructions or description}
-   **Status**: {active/departing/archived}
-   **Last Updated**: {timestamp}

## Capability Highlights

### Domain Expertise

-   **Prompts**: {count} prompts across {domains}
    -   Notable: {list 3-5 unique prompt areas}
-   **Instructions**: {count} custom instructions
    -   Modified from parent: {list differences}

### Custom Workflows

-   {command-1}: {one-line description}
-   {command-2}: {one-line description}

### Specialized Knowledge

{Extract from focus.instructions, workflows, or handoff}

-   **Pattern**: {notable pattern from recent work}
-   **Tooling**: {specialized tools/frameworks}
-   **Integration points**: {systems this node connects}

## Knowledge Transfer Opportunities

### Recommended for Parent Integration

1. **{category}**: {what} — {why valuable}
2. **{category}**: {what} — {why valuable}

### Recommended for Sibling Nodes

-   **{node-id}** could benefit from: {what}

### Unique to This Node (Keep Specialized)

-   {capability that shouldn't propagate}

## Recent Activity

-   **Last 3 sessions**: {extract from handoff/}
    -   {date}: {summary}
    -   {date}: {summary}
    -   {date}: {summary}

## Dependency Analysis

-   **Blocks**: {list issues this node is blocking}
-   **Blocked by**: {list issues blocking this node}
-   **Shared concerns**: {overlap with other nodes}

## Token Budget Estimate

-   **Manifest-only**: ~200 tokens (visibility window)
-   **Full load**: ~{estimate}K tokens (if `ay:load` used)

## Recommendations

### Should I `ay:load` this node?

{Yes/No} — {reasoning based on current task}

### Cross-pollination actions

1. {specific action}: {what to integrate and where}
2. {specific action}: {what to integrate and where}

---

**Scanned**: {timestamp}  
**By**: {current-node-id}
```

---

### Step 7: Report to User

**Action**: Display scan report and suggest next actions.

**Output**:

```
Scanned {node-id}.

[Display report above]

Next actions:
- `ay:load {node-id}` — Load full context (~{X}K tokens)
- `ay:scan {another-node}` — Scan another node
- `ay:merge {node-id}` — Harvest learnings (if departing)
```

**Post-scan state**: Node remains unloaded (no change to context).

---

## Error Handling

| Error                       | Cause                       | Recovery                           |
| --------------------------- | --------------------------- | ---------------------------------- |
| Node not found              | Invalid node ID             | Show `ay:network`, ask for correct |
| Branch fetch failed         | Git error, deleted branch   | Report error, check registry sync  |
| `.github/` missing          | Branch corrupted            | Report corruption, skip scan       |
| Current node requested      | User confusion              | Redirect to `ay:status`            |
| Already loaded              | User forgot                 | Redirect to `ay:context`           |
| File read error             | Permission or corrupt files | Skip file, note in report          |
| Comparison to parent failed | Parent branch unavailable   | Skip diff, scan absolute state     |
| Token budget exceeded       | Scan too deep               | Truncate report, warn user         |
| GitHub rate limit           | Too many scans              | Cache recent scans, throttle       |

**Rollback**: Not needed (read-only operation).

---

## Integration with Other Commands

| Command        | Interaction                                |
| -------------- | ------------------------------------------ |
| `ay:load`      | Scan before load to preview token cost     |
| `ay:merge`     | Scan departing child before harvest        |
| `ay:network`   | Scan provides detail for directory entries |
| `ay:deploy`    | N/A (new nodes have no history yet)        |
| `ay:leave`     | N/A (leaving node scans itself)            |
| `ay:propagate` | Scan children to verify propagation impact |
| `ay:context`   | Check if scan target already loaded        |

---

## Optimization: Scan Cache

**Problem**: Re-scanning same node repeatedly wastes tokens.

**Solution**: Cache scan reports for 1 hour.

**Implementation**:

```typescript
scanCache = {
	[nodeId]: {
		report: {
			/* scan report object */
		},
		scannedAt: timestamp,
		expiresAt: timestamp + 3600, // 1 hour
	},
};

// Before scanning
if (scanCache[nodeId] && scanCache[nodeId].expiresAt > now) {
	return scanCache[nodeId].report; // Use cached
}

// After scanning
scanCache[nodeId] = { report, scannedAt: now, expiresAt: now + 3600 };
```

**Cache invalidation**:

-   After `ay:sync` on target node (changes detected)
-   After `ay:propagate` (parent updates pushed)
-   Manual: `ay:scan {node-id} --refresh`

---

## Comparison: Scan vs Load

| Aspect            | `ay:scan`      | `ay:load`               |
| ----------------- | -------------- | ----------------------- |
| **Token cost**    | ~2,000 tokens  | ~10,000 tokens          |
| **Depth**         | Summaries only | Full content            |
| **Context**       | Not added      | Added to active context |
| **Use case**      | Exploration    | Active work             |
| **Speed**         | Fast (~5 sec)  | Slower (~15 sec)        |
| **Cacheability**  | Yes (1 hour)   | No (always fresh)       |
| **Unload needed** | No             | Yes (to free tokens)    |

---

## Examples

### Example 1: Scan Before Load

**User**: `ay:scan aynorica-backend`

**Aynorica**:

```
Scanned aynorica-backend.

# Scan Report: aynorica-backend

## Node Profile
- **ID**: aynorica-backend
- **Parent**: aynorica-prime
- **Branch**: aynorica-backend
- **Specialization**: NestJS API development, microservices patterns
- **Status**: active
- **Last Updated**: 2025-12-06T14:23:00Z

## Capability Highlights

### Domain Expertise
- **Prompts**: 12 prompts across 4 domains
  - Notable: NestJS modules, Prisma patterns, Jest testing, API design
- **Instructions**: 3 custom instructions
  - Modified from parent: Added testing standards, API conventions

### Custom Workflows
- `ay:test-api`: Run integration tests for all endpoints
- `ay:schema-sync`: Sync Prisma schema changes with database

### Specialized Knowledge
- **Pattern**: Repository pattern with Prisma
- **Tooling**: NestJS, Prisma, Jest, PostgreSQL
- **Integration points**: Redis for caching, JWT auth

## Knowledge Transfer Opportunities

### Recommended for Parent Integration
1. **Testing**: Jest configuration for NestJS — valuable pattern
2. **Prisma**: Schema modeling best practices — reusable

### Unique to This Node (Keep Specialized)
- API versioning strategy (project-specific)

## Token Budget Estimate
- **Full load**: ~8K tokens (if `ay:load` used)

## Recommendations

### Should I `ay:load` this node?
Yes — if working on backend tasks. Otherwise stay with scan.

Next actions:
- `ay:load aynorica-backend` — Load full context (~8K tokens)
- `ay:scan aynorica-frontend` — Compare frontend node
```

---

### Example 2: Scan Departing Child Before Merge

**User**: `ay:scan aynorica-security` (before merging)

**Aynorica**:

```
Scanned aynorica-security.

# Scan Report: aynorica-security

## Node Profile
- **ID**: aynorica-security
- **Parent**: aynorica-prime
- **Branch**: aynorica-security
- **Specialization**: Penetration testing, OWASP Top 10, secure code review
- **Status**: departing
- **Last Updated**: 2025-12-05T09:15:00Z

## Capability Highlights

### Domain Expertise
- **Prompts**: 8 prompts across 3 domains
  - Notable: OWASP scanning, threat modeling, secure auth patterns
- **Instructions**: 2 custom instructions
  - Modified from parent: Added security-first mindset rules

### Specialized Knowledge
- **Pattern**: Secure-by-default configuration
- **Tooling**: Burp Suite, OWASP ZAP, custom scanners
- **Integration points**: Bug bounty platforms (HackerOne, Bugcrowd)

## Knowledge Transfer Opportunities

### Recommended for Parent Integration
1. **Security prompts**: OWASP prompt, threat modeling — HIGH VALUE
2. **Secure defaults**: Configuration templates — REUSABLE

### Recent Activity
- **Last 3 sessions**:
  - 2025-12-05: Completed XSS vulnerability scan on target app
  - 2025-12-04: Created secure auth flow template
  - 2025-12-03: Documented OWASP Top 10 checklist

## Recommendations

### Should I `ay:load` this node?
No — use `ay:merge` instead (departing status).

Next actions:
- `ay:merge aynorica-security` — Harvest learnings
```

---

### Example 3: Scan Distant Node

**User**: `ay:scan aynorica-marketing`

**Aynorica**:

```
Scanned aynorica-marketing.

# Scan Report: aynorica-marketing

## Node Profile
- **ID**: aynorica-marketing
- **Parent**: aynorica-growth (grandchild)
- **Branch**: aynorica-marketing
- **Specialization**: Content strategy, SEO, social media automation
- **Status**: active
- **Last Updated**: 2025-11-28T11:00:00Z

## Capability Highlights

### Domain Expertise
- **Prompts**: 5 prompts across 2 domains
  - Notable: Content calendars, SEO optimization
- **Instructions**: 1 custom instruction
  - Modified from parent: Added brand voice guidelines

### Specialized Knowledge
- **Pattern**: Content repurposing workflows
- **Tooling**: Buffer, Ahrefs, ChatGPT API
- **Integration points**: Social platforms (Twitter, LinkedIn)

## Knowledge Transfer Opportunities

### Recommended for Parent Integration
None — marketing-specific, not relevant to Prime's focus.

### Recommended for Sibling Nodes
- **aynorica-frontend** could benefit from: SEO checklist

## Recommendations

### Should I `ay:load` this node?
No — too distant, no shared concerns with current work.

Cross-pollination: If building public site, consider SEO prompt.
```

---

## Token Budget Analysis

**Per scan operation**:

-   Registry read: ~500 tokens
-   Branch fetch metadata: ~200 tokens
-   File structure scan: ~500 tokens
-   Key file sampling (5 files × 20 lines): ~800 tokens
-   Report generation: ~1,000 tokens
-   **Total**: ~3,000 tokens (worst case)

**Cached scan**: ~100 tokens (report retrieval only)

**Comparison to full load**: 70% savings (~10,000 tokens → ~3,000 tokens)

---

## Success Criteria

-   [x] Node validation
-   [x] Lightweight file scanning (metadata-only where possible)
-   [x] Key file sampling (not full reads)
-   [x] Capability extraction
-   [x] Cross-pollination recommendations
-   [x] Token cost estimate for full load
-   [x] Report generation
-   [x] No context pollution (node stays unloaded)
-   [x] Cache strategy for repeated scans
-   [x] Integration with `ay:load`, `ay:merge`, `ay:network`
-   [x] Error handling for missing/corrupted nodes
-   [x] Examples for common scenarios

---

**Phase 4 Status**: ✅ Complete  
**Dependencies**: Phases 0-3 (foundation, deploy, leave, merge)  
**Next Phase**: Phase 5 (`ay:propagate`)

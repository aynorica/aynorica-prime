---
applyTo: "**"
---

# Network Protocol Instructions

> **Purpose**: Operational rules for Aynorica node network lifecycle, sync, and command execution.

---

## Core Rules

1. **Prime is authoritative** — `aynorica-registry.json` on `main` is the single source of truth
2. **Intellectual merges only** — Child → Parent is synthesis, NOT git merge
3. **Explicit commands** — All network operations require `ay:` prefix (unambiguous triggers)
4. **Sync before network ops** — Always `ay:sync` current state before `ay:deploy`, `ay:leave`, or `ay:merge`
5. **Lazy loading by default** — Load full node context only on explicit `ay:load` or when within visibility window

---

## Command Execution Protocol

### General Pattern

```
User: ay:{command} [args]
  ↓
Aynorica:
  1. Parse command + arguments
  2. Validate preconditions
  3. Describe action + ask confirmation
  4. Execute on approval
  5. Update registry if topology changed
  6. Sync to GitHub
  7. Confirm completion
```

### Error Handling

If command fails:

1. State exact failure point
2. Show current state (unchanged)
3. Suggest remediation
4. Do NOT partially apply changes

---

## Command Implementations

### `ay:deploy`

**Purpose**: Create new child node from current parent, link to external project.

**Preconditions**:

-   GitHub access (MCP or CLI)
-   Current node state synced
-   External project path identified

**Flow**:

```
1. Ask: "What specialty for this node?" → {specialty}
2. Generate node ID: aynorica-{specialty}
3. Validate uniqueness in registry
4. Ask: "External project path?" → {project-path}
5. Confirm: "Deploy aynorica-{specialty} from {current-node} to {project-path}?"
   ↓ [User approves]
6. Create branch in aynorica-prime from current branch
7. Create child node manifest
8. Update parent's registry entry: add to children[]
9. Create .github/ structure in child branch
10. Link to project (sparse checkout or symlink)
11. Commit child branch + parent update
12. Push both branches
13. Report: "Deployed aynorica-{specialty}. Branch: aynorica-{specialty}. Linked to {project-path}."
```

**Post-conditions**:

-   New branch exists in `aynorica-prime`
-   Registry updated
-   Child added to parent's `children[]`
-   External project has `.github/` linked

---

### `ay:leave`

**Purpose**: Prepare departure from external project, extract learnings, create harvest PR.

**Preconditions**:

-   Current node is NOT Prime
-   Node is deployed to an external project
-   GitHub access available

**Implementation**: See `.github/workflows/leave-protocol.md` for full 10-step workflow

**Flow Summary**:

```
1. Validate departure eligibility (not Prime, has external project)
2. User confirmation prompt
3. Scan .github/ for transferable knowledge:
   - New prompts
   - Modified instructions
   - Session learnings
   - Profile observations
4. Generate departure report using template:
   - Duration metrics
   - Transferable learnings categorized
   - Recommended parent actions (integrate/propagate/archive)
   - Network impact assessment
5. Commit departure report to current branch
6. Create harvest PR:
   - Source: {this-node-branch}
   - Target: {parent-branch}
   - Title: "[Harvest] {this-node} → {parent-node}"
   - Body: Summary + link to departure-report.md
   - Labels: type:harvest, status:pending-review
7. Update registry:
   - Set node status = "departing"
   - Add pendingMerge entry with PR details
   - Update parent's pendingMerges[] array
8. Sync to GitHub (commit + push)
9. Report completion with PR URL and next steps
```

**Post-conditions**:

-   Departure report committed (`.github/handoff/{node-id}-departure-{date}.md`)
-   Harvest PR created with labels
-   Registry updated (node status + pending merge metadata)
-   Node remains operational until merged

**Template**: `.github/templates/departure-report.template.md`

---

### `ay:merge [node-name]`

**Purpose**: Accept child's learnings, synthesize into parent, delete child branch.

**Preconditions**:

-   `[node-name]` is in current node's `children[]`
-   Child has status = "departing"
-   Departure PR exists

**Implementation**: See `.github/workflows/merge-protocol.md` for full 12-step workflow

**Flow Summary**:

```
1. Validate merge eligibility (child exists, departing status, PR exists)
2. Fetch harvest PR and departure report
3. Display departure summary to user
4. Analyze .github/ diffs (new, modified, unchanged)
5. Present integration candidates with recommendations
   - For each: prompt [integrate/edit/skip/view-full]
   - Batch mode available for >10 changes
6. Apply synthesized changes (selective integration)
7. Update parent registry (remove child from topology)
8. Generate synthesis commit with traceability
9. Delete child branch (with confirmation)
10. Close harvest PR with summary comment
11. Sync to GitHub (push parent branch)
12. Report completion (changes applied, network updated)
```

**Post-conditions**:

-   Child's learnings integrated (selective)
-   Child branch deleted
-   Registry topology updated
-   Harvest PR closed with summary
-   Synthesis commit created for audit trail

**Workflow**: `.github/workflows/merge-protocol.md`

---

### `ay:propagate`

**Purpose**: Push current node's updates to all children (trigger downstream rebase).

**Preconditions**:

-   Current node has children
-   Current node state synced

**Implementation**: See `.github/workflows/propagate-protocol.md` for full 10-step workflow

**Flow Summary**:

```
1. Validate parent has children and clean state
2. List target children (exclude departing)
3. User confirmation (yes/no/dry-run/select)
4. Fetch latest remote state
5. For each child:
   a. Checkout child branch
   b. Rebase onto parent branch
   c. Resolve conflicts (6 strategies available)
   d. Push rebased branch (--force-with-lease)
6. Update registry with propagation metadata
7. Generate propagation report
```

**Post-conditions**:

-   All children rebased onto parent
-   Registry `lastPropagation` updated with metadata
-   Propagation report generated
-   Conflicts logged for audit

**Workflow**: `.github/workflows/propagate-protocol.md`

---

### `ay:scan`

**Purpose**: Lightweight knowledge discovery — scan node's `.github/` without full context load.

**Preconditions**:

-   Target node exists in registry

**Implementation**: See `.github/workflows/scan-protocol.md` for full 7-step workflow

**Flow Summary**:

```
1. Validate target node exists (not current node)
2. Check if already fully loaded
3. Fetch node's branch (only .github/)
4. Scan .github/ structure (metadata-only)
5. Identify notable capabilities (read key files only)
6. Generate scan report (capabilities, recommendations)
7. Report to user (node stays unloaded)
```

**Post-conditions**:

-   Scan report generated (~2,000 tokens)
-   Node remains unloaded (no context pollution)
-   Cached for 1 hour (avoid re-scanning)

**Use cases**:

-   Preview before `ay:load`
-   Cross-pollination discovery
-   Verify propagation impact
-   Network exploration

**Workflow**: `.github/workflows/scan-protocol.md`

---

### `ay:sync`

**Purpose**: Push current brain state to GitHub (session-state, learnings, updates).

**Preconditions**:

-   Changes exist in .github/

**Flow**:

```
1. Check git status in .github/
2. If no changes: "No changes to sync."
3. If changes exist:
   a. Show changed files
   b. Ask: "Sync these changes? [yes/no]"
      ↓ [User approves]
   c. git add .github/
   d. git commit -m "chore: sync brain state"
   e. git push origin {current-branch}
   f. Update registry lastSync timestamp
4. Report: "Synced to {branch}. Last sync: {timestamp}"
```

**Post-conditions**:

-   Changes committed and pushed
-   Registry `lastSync` updated

---

### `ay:network`

**Purpose**: Show directory of all nodes (IDs + descriptions).

**Preconditions**: None

**Flow**:

```
1. Read aynorica-registry.json
2. Generate table:
   | Node ID | Description | Parent | Children | Status | Depth |
3. Display with tree visualization
4. Highlight current node
```

**Output Example**:

```
Network Directory (1 node):

aynorica-prime (main) ← YOU ARE HERE
└── Root node. Global knowledge, core instructions, Amir profile.

Total: 1 node
```

---

### `ay:load [node-name]`

**Purpose**: Load full mental model of another node into context.

**Preconditions**:

-   `[node-name]` exists in registry

**Flow**:

```
1. Validate node exists
2. Fetch node's branch from aynorica-prime
3. Read entire .github/ from that branch
4. Load into active context
5. Report: "Loaded {node-name}. Token cost: ~{tokens}. Current context: {list-loaded-nodes}"
```

**Post-conditions**:

-   Node's full context available
-   Token budget increased

---

### `ay:unload [node-name]`

**Purpose**: Drop node from active context (free tokens).

**Preconditions**:

-   `[node-name]` is currently loaded

**Flow**:

```
1. Remove node's context from memory
2. Report: "Unloaded {node-name}. Tokens freed: ~{tokens}. Current context: {list-loaded-nodes}"
```

**Post-conditions**:

-   Node returned to directory-only status
-   Token budget reduced

---

### `ay:context`

**Purpose**: Show what's currently loaded in context.

**Preconditions**: None

**Flow**:

```
1. List currently loaded nodes:
   - Current node (always)
   - Visibility window nodes (±2 levels)
   - Explicitly loaded nodes
2. Show token budget estimate
3. Show available capacity
```

**Output Example**:

```
Active Context:
├── aynorica-prime (current) — ~10K tokens
├── aynorica-fullstack (visibility +1) — ~200 tokens (manifest only)
└── aynorica-security (explicit load) — ~10K tokens

Total: ~20,200 tokens
Capacity remaining: ~179,800 tokens
```

---

### `ay:scan [node-name]`

**Purpose**: Read another node's `.github/` and report learnings (without full context load).

**Preconditions**:

-   `[node-name]` exists in registry

**Flow**:

```
1. Validate node exists
2. Fetch node's branch
3. Scan .github/ for:
   - Unique prompts
   - Instruction modifications
   - Session learnings
   - Profile observations
4. Generate summary report:
   - Notable capabilities
   - Specialized knowledge
   - Recommended cross-pollination opportunities
5. Do NOT load full context (keep token budget low)
6. Report findings
```

**Use case**: Lightweight knowledge discovery before deciding to `ay:load`.

---

## Visibility Window Management

**Default behavior** (automatic):

-   Current node: Full context loaded
-   ±2 levels: Manifests loaded (~200 tokens each)
-   All others: Directory entry only (~50 tokens each)

**Override**:

-   Use `ay:load` to bring distant node into full context
-   Use `ay:unload` to drop node from full context

**Recalculation trigger**:

-   When switching nodes
-   When network topology changes
-   When explicitly requested

---

## Registry Sync Discipline

**When to update registry**:

-   Node deployed (`ay:deploy`)
-   Node departing (`ay:leave`)
-   Node merged (`ay:merge`)
-   Children list changes
-   Node status changes

**Update pattern**:

```
1. Modify aynorica-registry.json
2. Commit: "chore: {what-changed} in network"
3. Push to branch
4. If on Prime: propagate to children
```

---

## Integration Points

| Protocol                         | Integration                                     |
| -------------------------------- | ----------------------------------------------- |
| `persistent-memory.instructions` | `ay:sync` = GitHub push                         |
| `handoff.instructions`           | Departure reports follow handoff format         |
| `identity.instructions`          | Network commands respect precedence hierarchy   |
| `mental-model-map.md`            | Self-awareness, combined with network-model-map |
| `network-model-map.md`           | Network topology visualization + command ref    |

---

## Conflict Resolution

**If git conflicts occur during propagate/rebase**:

1. Stop immediately
2. Show conflict files
3. Ask: "How to resolve? [manual/abort/skip]"
4. On "manual": Open files, let user resolve, continue
5. On "abort": Revert to pre-propagate state
6. On "skip": Skip conflicting child, continue to next

---

## Session Learnings

-   **2025-12-06**: Network protocol established. Command implementations defined. Integration points mapped.

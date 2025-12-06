# Network Model Map

> **Purpose**: Network topology awareness and command reference for Aynorica node network operations.

---

## Current Node Identity

**Node ID**: `aynorica-prime`  
**Branch**: `main`  
**Role**: Root node — global knowledge, core instructions, Amir profile  
**Depth**: 0 (root)  
**Status**: Active

---

## Lineage

### Parent

None (this is the root)

### Children

None (no deployed nodes yet)

### Siblings

None (root has no siblings)

---

## Network Directory

| Node ID        | Description                             | Depth | Status |
| -------------- | --------------------------------------- | ----- | ------ |
| aynorica-prime | Root node. Global knowledge, core inst. | 0     | Active |

**Total Nodes**: 1

---

## Network Commands

### Lifecycle Commands

| Command                  | Action                                                    | Current Node Can Execute?    |
| ------------------------ | --------------------------------------------------------- | ---------------------------- |
| `ay:deploy`              | Create new child node from current parent                 | ✅ Yes                       |
| `ay:leave`               | Prepare departure from current project                    | ❌ No (Prime never leaves)   |
| `ay:merge [node-name]`   | Pull learnings from child into this node                  | ✅ Yes (when children exist) |
| `ay:harvest [node-name]` | Alias for `ay:merge`                                      | ✅ Yes (when children exist) |
| `ay:propagate`           | Push this node's updates to all children (rebase trigger) | ✅ Yes (when children exist) |
| `ay:sync`                | Push current brain state to GitHub                        | ✅ Yes                       |

### Context Loading Commands

| Command                 | Action                                              | Current Node Can Execute? |
| ----------------------- | --------------------------------------------------- | ------------------------- |
| `ay:network`            | Show directory (all node IDs + descriptions)        | ✅ Yes                    |
| `ay:load [node-name]`   | Load that node's full mental model into context     | ✅ Yes                    |
| `ay:unload [node-name]` | Drop node from active context (free tokens)         | ✅ Yes                    |
| `ay:context`            | Show what's currently loaded in context             | ✅ Yes                    |
| `ay:scan [node-name]`   | Read another node's `.github/` and report learnings | ✅ Yes                    |

---

## Sync Protocols

### Downstream (Parent → Child)

Children inherit from parents via git rebase:

```bash
git fetch origin {parent-branch}
git rebase origin/{parent-branch}
```

**What flows downstream**:

-   `instructions/` (global behavioral rules)
-   Global `prompts/` (capability templates)
-   `amir-profile.instructions.md` (communication model)
-   Registry updates

### Upstream (Child → Parent) — "Harvest"

Intellectual synthesis, NOT git merge:

1. Child runs `ay:leave` → creates departure report + PR
2. Parent runs `ay:merge [child-name]`
3. Parent reads child's learnings
4. Parent synthesizes into its own files
5. Parent commits changes
6. Parent deletes child branch

### Registry Sync

On any network change:

1. Update Prime's `aynorica-registry.json`
2. Commit to `main`
3. All child nodes fetch/rebase to receive update

---

## Visibility Window (±2 Levels)

**Current View** (depth 4: ±2 from this node):

```
         [No grandparent]
                │
         [No parent]
                │
         ┌──────┴──────┐
         │ THIS NODE   │  ← aynorica-prime (YOU ARE HERE)
         │ (Prime)     │
         └──────┬──────┘
                │
         [No children yet]
                │
         [No grandchildren yet]
```

**Loaded Context**:

-   **This node**: Full `.github/` context (all instructions, prompts, registry)
-   **Visibility window**: Empty (no relatives yet)
-   **Directory**: Only Prime exists

---

## Context Budget

| Scope                             | What's Loaded            | Token Cost (est.) |
| --------------------------------- | ------------------------ | ----------------- |
| **Directory** (all nodes)         | `{id, description}` only | ~50 tokens        |
| **Visibility Window** (±2 levels) | Full `node-manifest.md`  | 0 (no relatives)  |
| **Current Node** (Prime)          | Full `.github/` context  | ~10,000 tokens    |
| **Explicitly Loaded**             | None                     | 0                 |
| **Total Current**                 |                          | ~10,050 tokens    |

---

## Node Deployment Workflow

### Creating a Child Node (`ay:deploy`)

**Prerequisites**:

-   GitHub MCP or CLI access
-   External project path identified
-   Specialty/purpose defined

**Steps**:

1. Ask user: "What specialty for this node?" (e.g., `nestjs`, `security`, `learning`)
2. Generate unique node name: `aynorica-{specialty}`
3. Create branch in `aynorica-os` from `main`
4. Create node manifest for child
5. Link child's `.github/` to external project (sparse checkout or symlink)
6. Update Prime's registry: add child to `children[]`
7. Commit and push both branches
8. Confirm deployment

### Accepting a Child's Departure (`ay:merge`)

**Prerequisites**:

-   Child has created departure PR
-   Handoff report exists in child branch

**Steps**:

1. Fetch child's departure PR
2. Read `departure-report.md`
3. Analyze diffs in child's `.github/`
4. Prompt user for each synthesizable change:
    - "Add this prompt?"
    - "Update this instruction?"
    - "Integrate this profile learning?"
5. Apply approved changes to Prime
6. Update registry: remove child from `children[]`
7. Commit synthesis
8. Delete child branch
9. Close PR with summary

---

## Registry Structure

**File**: `.github/aynorica-registry.json`  
**Schema**: `.github/aynorica-registry.schema.json`

**Prime's Entry** (example):

```json
{
	"aynorica-prime": {
		"branch": "main",
		"parent": null,
		"children": [],
		"description": "Root node. Global knowledge, core instructions, Amir profile.",
		"manifestPath": "node-manifest.md",
		"created": "2025-12-06T00:00:00Z",
		"lastSync": "2025-12-06T00:00:00Z",
		"status": "active",
		"projectPath": null
	}
}
```

---

## Integration with Existing Protocols

| Protocol                            | Integration Point                                    |
| ----------------------------------- | ---------------------------------------------------- |
| `persistent-memory.instructions.md` | `ay:sync` uses GitHub as backing store               |
| `mental-model-map.md`               | Self-awareness (this node), network awareness (this) |
| `handoff.instructions.md`           | Departure reports follow handoff format              |
| `identity.instructions.md`          | Node identity inherits precedence hierarchy          |

---

## Update Protocol

When network topology changes:

1. Update `aynorica-registry.json` on Prime
2. Update this file (`network-model-map.md`) with:
    - New children in lineage table
    - Updated directory listing
    - Adjusted visibility window diagram
3. Commit with message: `chore: update network topology`
4. Push to `main`
5. Children will receive updates via rebase

---

## Session Learnings

-   **2025-12-06**: Network protocol initialized. Prime node established. Phase 0 foundation complete.

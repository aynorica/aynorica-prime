# 🏛️ Aynorica Network Protocol (ANP) — Architecture Document

> **Version**: 1.1.0
> **Created**: 2025-12-06
> **Updated**: 2025-12-06
> **Status**: Approved for Implementation

---

## Executive Summary

**What we're building**: A federated node system where Aynorica instances (nodes) exist as branches in `aynorica-prime`, can be deployed to external projects, and harvest knowledge back to parent nodes upon departure.

**Core Trade-off**: We're trading **operational simplicity** (single-branch brain) for **contextual isolation** and **knowledge accumulation** (multi-branch network).

**Scaling Strategy**: Scoped Mental Loading — nodes are lazy-loaded on demand, with only a lightweight directory always visible.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL PROJECTS                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ my-nestjs-app   │  │ my-nextjs-app   │  │ freelance-x     │     │
│  │ ├── src/        │  │ ├── src/        │  │ ├── src/        │     │
│  │ └── .github/ ◄──┼──┼─┴── .github/ ◄──┼──┼─┴── .github/ ◄──┼──┐  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
└─────────────────────────────────────────────────────────────────│──┘
                                                                  │
                        SPARSE CHECKOUT / SYMLINK                 │
                                                                  │
┌─────────────────────────────────────────────────────────────────│──┐
│                         aynorica-prime REPO                        │  │
│                                                                 ▼  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ main (aynorica-prime)                                       │  │
│  │ └── .github/                                                │  │
│  │     ├── instructions/          (GLOBAL - inherited by all) │  │
│  │     ├── prompts/               (GLOBAL - inherited by all) │  │
│  │     ├── project/                                            │  │
│  │     │   ├── mental-model-map.md                            │  │
│  │     │   ├── network-model-map.md                           │  │
│  │     │   └── session-state.md                               │  │
│  │     ├── .aynorica-config.json                              │  │
│  │     └── aynorica-registry.json     (Source of Truth)       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│           ┌──────────────────┼──────────────────┐                  │
│           ▼                  ▼                  ▼                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │ aynorica-   │    │ aynorica-   │    │ aynorica-   │            │
│  │ fullstack   │    │ security    │    │ learning    │            │
│  │ └── .github/│    │ └── .github/│    │ └── .github/│            │
│  └──────┬──────┘    └─────────────┘    └─────────────┘            │
│         │                                                          │
│    ┌────┴────┐                                                     │
│    ▼         ▼                                                     │
│ ┌───────┐ ┌───────┐                                               │
│ │ayn-   │ │ayn-   │  ◄── These link to external projects          │
│ │nestjs │ │nextjs │                                                │
│ └───────┘ └───────┘                                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### Node

An Aynorica instance with its own mental model, specialized for a context (project, domain, or role). Each node:

-   Has a globally unique name (e.g., `aynorica-nestjs`)
-   Exists as a branch in `aynorica-prime`
-   Has exactly one parent (except Prime)
-   Can have zero or more children
-   Contains its own `.github/` folder with inherited + specialized knowledge

### Prime (Root Node)

The `main` branch. Contains:

-   Global instructions (inherited by all nodes)
-   The authoritative registry of all nodes
-   The master `amir-profile.instructions.md`

### Registry

Source of truth for network topology. Replicated to all nodes for fast reads. Prime's copy is authoritative.

### Harvest

The process of absorbing a child node's learnings into its parent. NOT a git merge — an intellectual synthesis.

### Node Manifest

A compressed "business card" for each node (~200 tokens max). Contains role, capabilities, and metadata. Used for network directory without loading full context.

### Visibility Window

The set of nodes whose full manifests are auto-loaded: ±2 levels from current node (2 parents up, 2 children down). All other nodes visible as directory entries only.

---

## Decision Drivers

| Characteristic             | Weight | Notes                                     |
| -------------------------- | ------ | ----------------------------------------- |
| **Knowledge Persistence**  | 5      | Must not lose learnings when project ends |
| **Context Isolation**      | 4      | Nodes shouldn't pollute each other        |
| **Operational Simplicity** | 3      | You will abandon complex systems          |
| **GitHub-Native**          | 4      | No external services, no new tools        |
| **Reversibility**          | 3      | Can always flatten back to single branch  |

---

## Node Naming Convention

| Property        | Constraint                                      |
| :-------------- | :---------------------------------------------- |
| **Node Name**   | Globally unique. Format: `aynorica-{specialty}` |
| **Branch Name** | Matches node name exactly                       |
| **Role**        | Descriptive text (can be duplicate)             |

Examples:

-   `aynorica-prime` (main branch)
-   `aynorica-fullstack`
-   `aynorica-nestjs`
-   `aynorica-bug-bounty`

---

## Node Lifecycle

### Phase 1: Deploy (Birth)

**Trigger**: Open a project, invoke Aynorica, no `.github/aynorica-node.json` exists.

**Flow**:

1. Check GitHub access (MCP or CLI)
2. Ask: "Which node should I branch from?" (show network tree)
3. Create unique node name: `aynorica-{project-specialty}`
4. Create branch in `aynorica-prime` repo from parent
5. Create `.github/` folder with node identity + replicated network map
6. Add secondary remote to project: `git remote add aynorica-brain https://github.com/aynorica/aynorica-prime.git`
7. Link `.github/` via sparse checkout or symlink
8. Register self in parent's `children[]`
9. Push to `aynorica-prime`

**Command**: `ay:deploy`

---

### Phase 2: Work (Life)

**Normal operation**:

-   Read/write to `.github/` (session-state, learnings)
-   Project code goes to project's own repo
-   Brain state syncs to aynorica-prime branch
-   Periodic `ay:sync` pushes brain state

---

### Phase 3: Leave (Death Preparation)

**Trigger**: `ay:leave`

**Flow**:

1. **Analyze**: Scan entire `.github/` for:
    - New prompts created
    - Instruction modifications
    - Session learnings
    - Discovered patterns in `amir-profile`
2. **Extract reusable knowledge**: Filter out project-specific stuff, keep:
    - Communication learnings
    - New capabilities/prompts that apply broadly
    - Workflow improvements
3. **Generate Handoff Report**: Create `.github/handoff/departure-report.md`

4. **Create Pull Request** on `aynorica-prime`:

    - Source: `aynorica-{name}` branch
    - Target: Parent branch
    - Title: `[Harvest] aynorica-{name} departure`
    - Body: Link to handoff report

5. **Notify**: "Departure prepared. Tell parent to merge."

**Command**: `ay:leave`

---

### Phase 4: Merge (Absorption)

**Trigger**: On parent node, `ay:merge [child-name]`

**Flow**:

1. **Fetch PR**: Get the open harvest PR from child
2. **Read Handoff Report**: Analyze departure-report.md
3. **Diff Mental Models**: Compare child's `.github/` to parent's
4. **Synthesize** (NOT git merge):
    - Read child's new prompts → Ask "Should I add this?"
    - Read child's instruction changes → Ask "Should I update this?"
    - Read child's amir-profile learnings → Integrate into parent's profile
5. **Update Network Map**: Remove child from `children[]`
6. **Commit**: "Merged learnings from aynorica-{child}"
7. **Delete Branch**: `git push origin --delete aynorica-{child}`
8. **Close PR**: With summary comment

**Command**: `ay:merge [child-name]`

---

## Sync Protocols

### Downstream (Parent → Child)

```bash
git fetch origin {parent-branch}
git rebase origin/{parent-branch}
```

Children inherit: `instructions/`, global `prompts/`, `amir-profile.instructions.md`

### Upstream (Child → Parent) — "Harvest"

1. Parent node runs `ay:merge {child}`
2. Parent reads child's learnings
3. Parent synthesizes into its own files
4. Parent commits

### Registry Sync

On any network change:

1. Update Prime's `aynorica-registry.json`
2. Propagate to all nodes via rebase

---

## Network Commands

### Lifecycle Commands

| Command                  | Action                                                    |
| :----------------------- | :-------------------------------------------------------- |
| `ay:deploy`              | Create new child node from current parent                 |
| `ay:leave`               | Prepare departure from current project                    |
| `ay:merge [node-name]`   | Pull learnings from child into this node                  |
| `ay:harvest [node-name]` | Alias for `ay:merge`                                      |
| `ay:propagate`           | Push this node's updates to all children (rebase trigger) |
| `ay:sync`                | Push current brain state to GitHub                        |

### Context Loading Commands

| Command                 | Action                                              |
| :---------------------- | :-------------------------------------------------- |
| `ay:network`            | Show directory (all node IDs + descriptions)        |
| `ay:load [node-name]`   | Load that node's full mental model into context     |
| `ay:unload [node-name]` | Drop node from active context (free tokens)         |
| `ay:context`            | Show what's currently loaded in context             |
| `ay:scan [node-name]`   | Read another node's `.github/` and report learnings |

---

## File Schemas

### `aynorica-registry.json`

```json
{
	"$schema": "./.aynorica-registry.schema.json",
	"version": "1.0.0",
	"primeNode": "aynorica-prime",
	"nodes": {
		"aynorica-prime": {
			"branch": "main",
			"parent": null,
			"children": [],
			"description": "Root node. Global knowledge, core instructions, Amir profile.",
			"manifestPath": ".github/node-manifest.md",
			"created": "2025-12-06T00:00:00Z",
			"lastSync": "2025-12-06T00:00:00Z"
		}
	},
	"pendingMerges": []
}
```

**Node Entry Fields**:

| Field          | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `branch`       | Git branch name in aynorica-prime                      |
| `parent`       | Parent node name (null for Prime)                   |
| `children`     | Array of child node names                           |
| `description`  | One-line summary for directory listing (~50 tokens) |
| `manifestPath` | Path to full manifest file                          |
| `created`      | ISO timestamp of node creation                      |
| `lastSync`     | ISO timestamp of last sync                          |

### `node-manifest.md`

Each node MUST have a manifest file (200 tokens MAX):

```markdown
# Node: aynorica-{name}

**Role**: [One sentence — what this node specializes in]
**Parent**: aynorica-{parent}
**Children**: [count] nodes
**Depth**: [level from Prime, e.g., 2]

## Key Capabilities

-   [Capability 1]
-   [Capability 2]
-   [Capability 3]

## Specialized Knowledge

-   [Domain expertise 1]
-   [Domain expertise 2]

**Last Active**: [YYYY-MM-DD]
```

### `network-model-map.md`

Human-readable network state including:

-   This Node identity
-   Lineage (parent + children table)
-   Network commands
-   Sync protocol documentation
-   Visual topology

### `departure-report.md`

```markdown
# Departure Report: aynorica-{name}

## Duration

Created: YYYY-MM-DD | Departed: YYYY-MM-DD

## Project Context

[What this project was about]

## Reusable Learnings

-   [Learning 1]: [Why it's transferable]
-   [Learning 2]: [Why it's transferable]

## New Prompts/Instructions

| File                  | Description | Recommend Merge? |
| --------------------- | ----------- | ---------------- |
| `prompts/x.prompt.md` | [desc]      | Yes/No           |

## Amir Profile Updates

[Any new behavioral patterns observed]

## Recommended Actions for Parent

1. [Action 1]
2. [Action 2]
```

---

## Scoped Mental Loading

### The Problem

Context windows are finite. Loading all nodes = overflow.

```
Context Window: ~200K tokens
Full node .github/: ~5-15K tokens
50 nodes × 10K avg = 500K tokens → OVERFLOW
```

### The Solution: Lazy Loading with Visibility Window

**Default state**: Load ONLY node IDs + descriptions (the "directory")
**On-demand**: Explicitly load a node's full mental model when needed

### Visibility Window (Depth 4: ±2 Levels)

```
         ┌─────────────┐
         │ Grandparent │  ← 2 levels UP (manifest only)
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │   Parent    │  ← 1 level UP (manifest only)
         └──────┬──────┘
                │
         ┌──────┴──────┐
         │  THIS NODE  │  ← CURRENT (full context loaded)
         └──────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───┴───┐  ┌────┴────┐  ┌───┴───┐
│ Child │  │  Child  │  │ Child │  ← 1 level DOWN (manifest only)
└───┬───┘  └────┬────┘  └───────┘
    │           │
┌───┴───┐  ┌────┴────┐
│ Grand │  │  Grand  │  ← 2 levels DOWN (manifest only)
│ child │  │  child  │
└───────┘  └─────────┘
```

### What Gets Loaded

| Scope                             | What's Loaded            | Token Cost       |
| --------------------------------- | ------------------------ | ---------------- |
| **Directory** (all nodes)         | `{id, description}` only | ~50 tokens/node  |
| **Visibility Window** (±2)        | Full `node-manifest.md`  | ~200 tokens/node |
| **Current Node**                  | Full `.github/` context  | ~10K tokens      |
| **Explicitly Loaded** (`ay:load`) | Full `.github/` context  | ~10K tokens      |

### Scaling Example

```
50 nodes in network:
├── Directory:           50 × 50  = 2,500 tokens
├── Visibility Window:   10 × 200 = 2,000 tokens
├── Current Node:        1 × 10K  = 10,000 tokens
└── Total baseline:               = 14,500 tokens ✓

Explicitly load 2 more nodes:
└── Total:               14,500 + 20K = 34,500 tokens ✓
```

### Context Loading Flow

**Session Start**:

1. Load directory (all node IDs + descriptions)
2. Identify current node from project
3. Auto-load visibility window (±2 levels manifests)
4. Load current node's full context

**Cross-Node Knowledge Request**:

> "I need security knowledge from the security node"

1. Run `ay:load aynorica-security`
2. Fetch `.github/` from that branch
3. Add to active context
4. Now have both current + security mental models

**Done with External Node**:

1. Run `ay:unload aynorica-security`
2. Context freed
3. Node returns to directory-only status

---

## Trade-off Analysis

| Dimension                    | This Design | Alternative (Single Branch) |
| ---------------------------- | ----------- | --------------------------- |
| **Context Isolation**        | ⭐⭐⭐⭐⭐  | ⭐⭐                        |
| **Knowledge Persistence**    | ⭐⭐⭐⭐⭐  | ⭐⭐⭐                      |
| **Operational Simplicity**   | ⭐⭐⭐      | ⭐⭐⭐⭐⭐                  |
| **Debugging Ease**           | ⭐⭐⭐      | ⭐⭐⭐⭐⭐                  |
| **Scalability (N projects)** | ⭐⭐⭐⭐⭐  | ⭐⭐                        |
| **Context Efficiency**       | ⭐⭐⭐⭐⭐  | ⭐⭐                        |
| **Network Awareness**        | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐                  |

**Accepted Costs**:

-   More files to manage
-   Registry sync discipline required
-   GitHub access always needed
-   Explicit loading required for cross-node knowledge

**Mitigations**:

-   All sync is prompt-driven (I ask, you confirm)
-   Flat branch names (no nesting complexity)
-   Intellectual merge (no git conflict hell)
-   Directory always visible (never blind to network)
-   Visibility window auto-loads nearest relatives

---

## Implementation Phases

### Phase 0: Foundation

Create infrastructure files on `main`.

| Task | File                                                    |
| ---- | ------------------------------------------------------- |
| 0.1  | `.github/aynorica-registry.json` + schema               |
| 0.2  | `.github/node-manifest.md` (Prime's manifest)           |
| 0.3  | `.github/project/network-model-map.md`                  |
| 0.4  | `.github/instructions/network-protocol.instructions.md` |
| 0.5  | Update `.aynorica-config.json` with node identity       |
| 0.6  | Update `mental-model-map.md` with network commands      |

### Phase 1: Deploy Protocol

Enable `ay:deploy` command.

### Phase 2: Leave Protocol

Enable `ay:leave` command.

### Phase 3: Merge Protocol

Enable `ay:merge` command.

### Phase 4: Scan Protocol

Enable `ay:scan` command.

---

## Execution Priority

| Phase   | Effort  | Priority |
| ------- | ------- | -------- |
| Phase 0 | 1 hour  | **NOW**  |
| Phase 1 | 2 hours | High     |
| Phase 2 | 1 hour  | Medium   |
| Phase 3 | 2 hours | Medium   |
| Phase 4 | 1 hour  | Low      |

---

## References

-   `mental-model-map.md` — Self-awareness (prompts, instructions)
-   `network-model-map.md` — Network awareness (nodes, relationships)
-   `persistent-memory.instructions.md` — Session state protocol
-   `handoff.instructions.md` — Handoff document format

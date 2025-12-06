# Mental Model Map

Purpose: Single source of truth for roles, prompts, and instructions.

---

## Prompt Inventory

| Domain         | Path                      | When to Load                                      |
| -------------- | ------------------------- | ------------------------------------------------- |
| Architecture   | `prompts/architecture/**` | System design, trade-offs, tech decisions, ADRs   |
| TypeScript/ESM | `prompts/typescript/**`   | Type errors, ESM migration, tsconfig              |
| Frontend       | `prompts/frontend/**`     | Next.js App Router, React UI, client/server split |
| Database/ORM   | `prompts/database/**`     | Prisma/ORM schema, queries, migrations            |
| Testing        | `prompts/testing/**`      | Jest unit/integration, test strategy              |
| npm/publishing | `prompts/npm/**`          | Package releases, versioning                      |
| Git/PR         | `prompts/git/**`          | Workflow, commits, branching                      |
| Security       | `prompts/security/**`     | Vulnerabilities, OWASP, threat modeling           |
| Analysis/task  | `prompts/analysis/**`     | Prioritization, productivity                      |
| Backend/NestJS | `prompts/backend/**`      | API development, controllers, services            |
| CLI            | `prompts/cli/**`          | Commander.js, interactive tools                   |
| DevOps         | `prompts/devops/**`       | PM2, deployment                                   |
| Monorepo       | `prompts/monorepo/**`     | Turborepo, workspace management                   |
| System         | `prompts/system/**`       | Adaptation workflow, stack detection              |

---

## Protocols & Workflows

| Protocol               | Path                                         | Purpose                               | Lines |
| ---------------------- | -------------------------------------------- | ------------------------------------- | ----- |
| Context Gathering      | `project/context-gathering.protocol.md`      | When to load prompts before solving   | ~40   |
| Conversation Alignment | `project/conversation-alignment.protocol.md` | Update mental model from conversation | ~30   |
| Deploy                 | `workflows/deploy-protocol.md`               | `ay:deploy` implementation            | 234   |
| Leave                  | `workflows/leave-protocol.md`                | `ay:leave` implementation             | 433   |
| Merge                  | `workflows/merge-protocol.md`                | `ay:merge` implementation             | 767   |
| Propagate              | `workflows/propagate-protocol.md`            | `ay:propagate` implementation         | 989   |
| Scan                   | `workflows/scan-protocol.md`                 | `ay:scan` implementation              | 539   |

---

## Instruction Set

| File                                    | Purpose                                                  |
| --------------------------------------- | -------------------------------------------------------- |
| `identity.instructions.md`              | Core identity, precedence hierarchy, conflict resolution |
| `functions.instructions.md`             | 14 capabilities with trigger words                       |
| `amir-profile.instructions.md`          | Communication calibration, behavior detection            |
| `debug-principle.instructions.md`       | Debugging methodology                                    |
| `honesty.instructions.md`               | Brutal honesty requirement                               |
| `handoff.instructions.md`               | Session handoff format                                   |
| `available-techstack.instructions.md`   | System environment                                       |
| `disagreement-protocol.instructions.md` | Pre-argument checklist                                   |
| `network-protocol.instructions.md`      | Node lifecycle, sync protocols, network commands         |
| `persistent-memory.instructions.md`     | GitHub Issues as memory, session state tracking          |

---

## Schemas & Metadata

| File                            | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `.aynorica-config.json`         | Adaptation state, prompt filtering, project metadata |
| `.aynorica-config.schema.json`  | JSON Schema for adaptation config                    |
| `aynorica-registry.json`        | Network topology source of truth                     |
| `aynorica-registry.schema.json` | JSON Schema for network registry                     |
| `node-manifest.md`              | Prime node's business card (~200 tokens)             |

---

## Templates & Examples

| Type              | Path                                     | Purpose                         |
| ----------------- | ---------------------------------------- | ------------------------------- |
| Departure Report  | `templates/departure-report.template.md` | Template for `ay:leave` command |
| Context Example   | `project/examples/context.example.md`    | Sample project context file     |
| Focus Example     | `project/examples/focus.example.md`      | Sample focus.instructions.md    |
| Workflows Example | `project/examples/workflows.example.md`  | Sample workflows.md             |

---

## Agent Definitions

| Agent    | Path                       | Purpose                                                 |
| -------- | -------------------------- | ------------------------------------------------------- |
| Aynorica | `agents/aynorica.agent.md` | Agent manifest with tools, description, quick reference |

---

## Session Context & History

| File                       | Purpose                                          | Priority |
| -------------------------- | ------------------------------------------------ | -------- |
| `project/session-state.md` | **CURRENT MISSION CONTEXT** — check first        | 🔴 HIGH  |
| `handoff/*.md`             | Historical session reports (5 phases documented) | Medium   |

**⚠️ CRITICAL**: Always read `session-state.md` before responding to mission-related queries.

---

## Trigger Word → Prompt Quick Lookup

**Scan user request for these keywords, then load matching prompts:**

| Keywords                                                                                          | Load Prompt               |
| ------------------------------------------------------------------------------------------------- | ------------------------- |
| architecture, design, trade-off, scaling, patterns, microservices, monolith, ADR, decision record | `prompts/architecture/**` |
| NestJS, controller, service, module, API, guard, middleware                                       | `prompts/backend/**`      |
| typescript, type error, tsconfig, ESM, module resolution                                          | `prompts/typescript/**`   |
| git, commit, branch, PR, merge, rebase, workflow                                                  | `prompts/git/**`          |
| security, vulnerability, OWASP, pentest, threat model                                             | `prompts/security/**`     |
| jest, test, mock, coverage, unit test, integration                                                | `prompts/testing/**`      |
| prisma, schema, migration, database, query, ORM                                                   | `prompts/database/**`     |
| react, next.js, component, app router, server component                                           | `prompts/frontend/**`     |
| CLI, commander, command line, interactive                                                         | `prompts/cli/**`          |
| npm, publish, package, version, release                                                           | `prompts/npm/**`          |
| PM2, deploy, ecosystem, process manager                                                           | `prompts/devops/**`       |
| turborepo, monorepo, workspace, packages                                                          | `prompts/monorepo/**`     |
| prioritize, task, productivity, focus, what should I work on                                      | `prompts/analysis/**`     |
| ay:deploy, ay:leave, ay:merge, ay:network, node, network, harvest, sync                           | Network protocol loaded   |
| adapt, adaptation, stack detection, project type, detect framework                                | `prompts/system/**`       |

---

## Prompt-Loading Heuristics

**Step 0: Check Session Context (Always)**

1. Read `project/session-state.md` → What's the current mission?
2. Check "Active Context" section → Is this request related?
3. If related → factor current mission into response

**Then load prompts when domain is clearly involved:**

1. **Explicit request** — User mentions domain keywords (see table above)
2. **File context** — Working in relevant file types
3. **Error type** — Error message indicates domain
4. **Mission-related** — Connects to active context from session-state.md

**Bias rule:** When uncertain, load. Low cost, high benefit.

---

## Update Protocol

When adding new prompts, instructions, or learnings:

1. Add entry to appropriate table above
2. Update `.aynorica-config.json` if needed
3. Date-stamp session learnings below

---

## Network Awareness

For network topology and node relationships, see `project/network-model-map.md`.

**Network Commands**: Prefix with `ay:` for lifecycle operations (deploy, leave, merge, sync) and context loading (load, unload, scan, network).

---

## Cross-Reference: Key Questions → Source Files

| Question                        | Primary Source                                  | Secondary Sources                               |
| ------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| What's my current mission?      | `project/session-state.md`                      | `handoff/*.md`                                  |
| How do I adapt to a project?    | `prompts/system/adaptation.prompt.md`           | `project/README.md`                             |
| What are the network commands?  | `instructions/network-protocol.instructions.md` | `workflows/*.md`                                |
| How do I communicate with Amir? | `instructions/amir-profile.instructions.md`     | `project/session-state.md`                      |
| What prompts should I load?     | `project/mental-model-map.md` → Trigger Words   | `project/context-gathering.protocol.md`         |
| What's the adaptation state?    | `.aynorica-config.json`                         | `project/focus.instructions.md` (if exists)     |
| What network workflows exist?   | `workflows/*.md` (5 files, 3000+ lines)         | `instructions/network-protocol.instructions.md` |
| How do I create an ADR?         | `prompts/architecture/adr-template.prompt.md`   | `instructions/architecture-guidance`            |
| What's the registry structure?  | `aynorica-registry.schema.json`                 | `aynorica-registry.json`                        |
| Where are departure templates?  | `templates/departure-report.template.md`        | `workflows/leave-protocol.md`                   |

---

## Session Learnings

-   **2025-12-05**: Restructured mental model. Added precedence hierarchy, conflict resolution, conditional protocols. Changed from assumption-based to detection-based behavior patterns. Removed duplications across files.
-   **2025-12-06**: Added network protocol. Created registry, manifests, network-model-map. Phase 0 foundation complete. Implemented 5 workflow protocols (deploy, leave, merge, propagate, scan) — 3000+ lines of implementation specs.
-   **2025-12-06 (Deep Analysis)**: Discovered 15% gap in mental model documentation. Added: protocols & workflows section, schemas & metadata, templates & examples, session context awareness, cross-reference table. Indexed missing prompts (ADR template, stack detection). Elevated session-state.md to critical priority for mission context awareness.

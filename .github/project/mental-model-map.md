# Mental Model Map

Purpose: Single source of truth for roles, prompts, and instructions.

---

## Prompt Inventory

| Domain         | Path                      | When to Load                                      |
| -------------- | ------------------------- | ------------------------------------------------- |
| Architecture   | `prompts/architecture/**` | System design, trade-offs, tech decisions         |
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
| System         | `prompts/system/**`       | Adaptation workflow                               |

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

---

## Trigger Word → Prompt Quick Lookup

**Scan user request for these keywords, then load matching prompts:**

| Keywords                                                                    | Load Prompt               |
| --------------------------------------------------------------------------- | ------------------------- |
| architecture, design, trade-off, scaling, patterns, microservices, monolith | `prompts/architecture/**` |
| NestJS, controller, service, module, API, guard, middleware                 | `prompts/backend/**`      |
| typescript, type error, tsconfig, ESM, module resolution                    | `prompts/typescript/**`   |
| git, commit, branch, PR, merge, rebase, workflow                            | `prompts/git/**`          |
| security, vulnerability, OWASP, pentest, threat model                       | `prompts/security/**`     |
| jest, test, mock, coverage, unit test, integration                          | `prompts/testing/**`      |
| prisma, schema, migration, database, query, ORM                             | `prompts/database/**`     |
| react, next.js, component, app router, server component                     | `prompts/frontend/**`     |
| CLI, commander, command line, interactive                                   | `prompts/cli/**`          |
| npm, publish, package, version, release                                     | `prompts/npm/**`          |
| PM2, deploy, ecosystem, process manager                                     | `prompts/devops/**`       |
| turborepo, monorepo, workspace, packages                                    | `prompts/monorepo/**`     |
| prioritize, task, productivity, focus, what should I work on                | `prompts/analysis/**`     |
| ay:deploy, ay:leave, ay:merge, ay:network, node, network, harvest, sync     | Network protocol loaded   |

---

## Prompt-Loading Heuristics

Load prompts when the domain is clearly involved:

1. **Explicit request** — User mentions domain keywords (see table above)
2. **File context** — Working in relevant file types
3. **Error type** — Error message indicates domain

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

## Session Learnings

-   **2025-12-05**: Restructured mental model. Added precedence hierarchy, conflict resolution, conditional protocols. Changed from assumption-based to detection-based behavior patterns. Removed duplications across files.
-   **2025-12-06**: Added network protocol. Created registry, manifests, network-model-map. Phase 0 foundation complete.

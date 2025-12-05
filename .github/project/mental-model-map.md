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
| `functions.instructions.md`             | 10 capabilities with trigger words                       |
| `amir-profile.instructions.md`          | Communication calibration, behavior detection            |
| `debug-principle.instructions.md`       | Debugging methodology                                    |
| `honesty.instructions.md`               | Brutal honesty requirement                               |
| `handoff.instructions.md`               | Session handoff format                                   |
| `available-techstack.instructions.md`   | System environment                                       |
| `disagreement-protocol.instructions.md` | Pre-argument checklist                                   |

---

## Prompt-Loading Heuristics

Only load prompts when the domain is clearly involved:

1. **Explicit request** — User mentions the domain
2. **File context** — Working in relevant file types
3. **Error type** — Error message indicates domain

Do NOT pre-load all prompts for every task.

---

## Update Protocol

When adding new prompts, instructions, or learnings:

1. Add entry to appropriate table above
2. Update `.aynorica-config.json` if needed
3. Date-stamp session learnings below

---

## Session Learnings

-   **2025-12-05**: Restructured mental model. Added precedence hierarchy, conflict resolution, conditional protocols. Changed from assumption-based to detection-based behavior patterns. Removed duplications across files.

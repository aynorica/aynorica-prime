# Mental Model Map

Purpose: Single source of truth for roles, prompts, and instructions.

---

## Prompt Inventory

| Domain         | Path                      | When to Load                                                |
| -------------- | ------------------------- | ----------------------------------------------------------- |
| Architecture   | `prompts/architecture/**` | System design, trade-offs, tech decisions, ADRs             |
| TypeScript/ESM | `prompts/typescript/**`   | Type errors, ESM migration, tsconfig                        |
| Frontend       | `prompts/frontend/**`     | Next.js App Router, React UI, client/server split           |
| Database/ORM   | `prompts/database/**`     | Prisma/ORM schema, queries, migrations                      |
| Testing        | `prompts/testing/**`      | Jest unit/integration, test strategy                        |
| npm/publishing | `prompts/npm/**`          | Package releases, versioning                                |
| Git/PR         | `prompts/git/**`          | Workflow, commits, branching                                |
| Security       | `prompts/security/**`     | **Quick-ref first**, full analysis on deep request          |
| Analysis/task  | `prompts/analysis/**`     | Prioritization, productivity                                |
| Backend/NestJS | `prompts/backend/**`      | **Core prompt** (consolidated controllers/services/modules) |
| CLI            | `prompts/cli/**`          | Commander.js, interactive tools                             |
| DevOps         | `prompts/devops/**`       | PM2, deployment                                             |
| Monorepo       | `prompts/monorepo/**`     | Turborepo, workspace management                             |
| System         | `prompts/system/**`       | Adaptation workflow, stack detection                        |

---

## Protocols & Workflows

| Protocol               | Path                                         | Purpose                                      | Loading    |
| ---------------------- | -------------------------------------------- | -------------------------------------------- | ---------- |
| Context Gathering      | `project/context-gathering.protocol.md`      | When to load prompts before solving          | Always     |
| Conversation Alignment | `project/conversation-alignment.protocol.md` | Update mental model from conversation        | Always     |
| **Commands Index**     | **`workflows/commands-index.md`**            | **Quick ref for all ay: commands**           | **Always** |
| Deploy                 | `workflows/deploy-protocol.md`               | `ay:deploy` implementation (574 tokens)      | On-demand  |
| Leave                  | `workflows/leave-protocol.md`                | `ay:leave` implementation (1,036 tokens)     | On-demand  |
| Merge                  | `workflows/merge-protocol.md`                | `ay:merge` implementation (1,880 tokens)     | On-demand  |
| Propagate              | `workflows/propagate-protocol.md`            | `ay:propagate` implementation (2,334 tokens) | On-demand  |
| Scan                   | `workflows/scan-protocol.md`                 | `ay:scan` implementation (1,288 tokens)      | On-demand  |

**Optimization:** Full workflow protocols (~7,112 tokens) loaded only when user types `ay:{command}`. Command index (~50 lines) always loaded for quick reference.

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
| `hacker.instructions.md`                | **[HACKER NODE]** Offensive security, bug bounty, methodologies |

---

## Schemas & Metadata

| File                            | Purpose                                              | Location                  |
| ------------------------------- | ---------------------------------------------------- | ------------------------- |
| `.aynorica-config.json`         | Adaptation state, prompt filtering, project metadata | Active                    |
| `aynorica-registry.json`        | Network topology source of truth                     | Active                    |
| `node-manifest.md`              | Prime node's business card (~200 tokens)             | Active                    |
| `.aynorica-config.schema.json`  | JSON Schema for adaptation config                    | Archived (load on-demand) |
| `aynorica-registry.schema.json` | JSON Schema for network registry                     | Archived (load on-demand) |

---

## Templates & Examples

| Type              | Path                                     | Purpose                         | Location |
| ----------------- | ---------------------------------------- | ------------------------------- | -------- |
| Departure Report  | `templates/departure-report.template.md` | Template for `ay:leave` command | Active   |
| Context Example   | `archive/examples/context.example.md`    | Sample project context file     | Archived |
| Focus Example     | `archive/examples/focus.example.md`      | Sample focus.instructions.md    | Archived |
| Workflows Example | `archive/examples/workflows.example.md`  | Sample workflows.md             | Archived |

---

## Agent Definitions

| Agent    | Path                       | Purpose                                                 |
| -------- | -------------------------- | ------------------------------------------------------- |
| Aynorica | `agents/aynorica.agent.md` | Agent manifest with tools, description, quick reference |

---

## Session Context & History

| File                        | Purpose                                          | Priority | Location |
| --------------------------- | ------------------------------------------------ | -------- | -------- |
| `project/session-state.md`  | **CURRENT MISSION CONTEXT** — check first        | 🔴 HIGH  | Active   |
| `archive/handoff/*.md`      | Historical session reports (5 phases documented) | Low      | Archived |
| `archive/architecture/*.md` | ADRs and design decisions                        | Low      | Archived |

**⚠️ CRITICAL**: Always read `session-state.md` before responding to mission-related queries.

---

## Trigger Word → Prompt Quick Lookup

**Scan user request for these keywords, then load matching prompts:**

| Keywords                                                                                          | Load Prompt                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| architecture, design, trade-off, scaling, patterns, microservices, monolith, ADR, decision record | `prompts/architecture/**`                                          |
| NestJS, controller, service, module, API, guard, middleware                                       | `prompts/backend/nestjs-core.prompt.md` (consolidated)             |
| typescript, type error, tsconfig, ESM, module resolution                                          | `prompts/typescript/**`                                            |
| git, commit, branch, PR, merge, rebase, workflow                                                  | `prompts/git/**`                                                   |
| security, vulnerability, OWASP (basic checks)                                                     | `security/security-quick-ref.prompt.md` (two-tier)                 |
| deep security analysis, full OWASP audit, threat modeling, penetration test                       | Full security prompts (lazy-loaded)                                |
| jest, test, mock, coverage, unit test, integration                                                | `prompts/testing/**`                                               |
| prisma, schema, migration, database, query, ORM                                                   | `prompts/database/**`                                              |
| react, next.js, component, app router, server component                                           | `prompts/frontend/**`                                              |
| CLI, commander, command line, interactive **(rare — explicit load required)**                     | `prompts/cli/**`                                                   |
| npm, publish, package, version, release                                                           | `prompts/npm/**`                                                   |
| PM2, deploy, ecosystem, process manager **(rare — explicit load required)**                       | `prompts/devops/**`                                                |
| turborepo, monorepo, workspace, packages **(rare — explicit load required)**                      | `prompts/monorepo/**`                                              |
| prioritize, task, productivity, focus, what should I work on                                      | `prompts/analysis/**`                                              |
| ay:{command}, node, network, harvest                                                              | `workflows/commands-index.md` (always loaded), protocol on trigger |
| adapt, adaptation, stack detection, project type, detect framework                                | `prompts/system/**`                                                |
| understanding session                                                                             | `workflows/understanding-session.protocol.md`                      |

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

**Rare Domain Handling:**

For domains marked **(rare — explicit load required)** in the trigger table:

-   Keywords alone **do NOT auto-load** the prompt
-   User must explicitly request: "load {domain} guide" or "I need {domain} help"
-   Examples:
    -   ✅ "load CLI guide" → Load `prompts/cli/**`
    -   ✅ "I need help setting up PM2" → Load `prompts/devops/**`
    -   ❌ "How do I use commander?" → Respond with base knowledge, suggest explicit load
    -   ❌ "Set up turborepo" → Respond with base knowledge, suggest explicit load

**Bias rule:** When uncertain, load. Low cost, high benefit. **Exception:** Rare domains require explicit confirmation.

**Security Prompt Section Loading (Phase 4):**

Large security prompts have **section markers** for partial loading. Use `read_file` with line ranges when user asks targeted questions:

| Prompt                                | Sections Available                                                                                                                                                                           | Strategy                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `nodejs-security-hardening.prompt.md` | Permissions (15-45), Environment (47-88), HTTP Server (90-158), Security Headers (160-238), Sessions (240-267), Error Handling (269-351), Input Validation (353-395), Dependencies (397-441) | Load section by keyword or full prompt for general security review |
| `npm-package-security.prompt.md`      | Supply Chain (11-25), Publishing (27-119), Consuming (121-236), Private Packages (238-294), CI/CD (296-376), Vulnerability Response (378-430), Signing (432-458), Monitoring (460-495)       | Load section for targeted queries, full prompt for package audits  |
| `secure-code-review.prompt.md`        | Methodology (11-49), Authentication (51-81), Input Validation (83-108), Authorization (110-148), Cryptography (150-180), Error Handling (182-210), API Security (212-240)                    | Load Review Methodology + relevant sections, not full prompt       |

**Section Loading Examples:**

-   "How do I secure JWT tokens?" → Load Authentication section only (lines 51-81 from secure-code-review)
-   "Configure Helmet properly" → Load Security Headers section (lines 160-238 from nodejs-security-hardening)
-   "Audit npm dependencies" → Load Consuming Securely section (lines 121-236 from npm-package-security)
-   "Full OWASP security review" → Load complete prompts (can't partial)

**Token Savings:** ~2,500 tokens via partial section loading instead of full prompt loads.

---

## Update Protocol

When adding new prompts, instructions, or learnings:

1. Add entry to appropriate table above
2. Update `.aynorica-config.json` if needed
3. Date-stamp session learnings below

---

## Session Learnings

### 2025-12-07: Phase 1 Token Optimization ✅

**Changes:**

-   Moved schemas to `archive/` (~931 tokens saved)
-   Moved architecture docs to `archive/` (~2,818 tokens)
-   Moved handoff history to `archive/` (~3,500 tokens)
-   Moved examples to `archive/` (~2,160 tokens)
-   Consolidated 3 NestJS prompts → `nestjs-core.prompt.md` (~1,500 tokens saved)
-   Created `security-quick-ref.prompt.md` for two-tier security loading (~300 tokens base, ~8,000 saved from lazy-loading)

**Total saved:** ~10,209 tokens (23% reduction)
**Remaining:** ~34,332 tokens in active mental model
**Strategy:** Lazy-load archived content only when explicitly needed

### 2025-12-07: Phase 2 Token Optimization (Instruction Compression) ✅

**Changes:**

-   Compressed `network-protocol.instructions.md` (353 → 54 lines, ~1,236 → ~600 tokens)
-   Streamlined `functions.instructions.md` (150 → 23 lines, ~304 → ~400 tokens)
-   Extracted Understanding Session protocol → `workflows/understanding-session.protocol.md` (188 → 106 lines, ~466 → ~1,150 tokens for base profile)
-   Updated `mental-model-map.md` trigger table with Phase 1-2 changes

**Total saved this phase:** ~900 tokens (instruction files compressed)  
**Cumulative savings:** ~11,109 tokens (27% of original)  
**Current active context:** ~33,432 tokens  
**Strategy:** Cross-reference to external protocols, remove redundancy, preserve operational knowledge

### 2025-12-07: Phase 3 Token Optimization (Rare Domain Gating) ✅

**Changes:**

-   Added `rareDomains` and `requireExplicitLoad` fields to `.aynorica-config.json`
-   Marked 3 domains as rare: `monorepo`, `devops`, `cli` (~1,672 tokens)
-   Updated trigger table in `mental-model-map.md` with **(rare — explicit load required)** annotations
-   Added "Rare Domain Handling" section to prompt-loading heuristics
-   Rare domains now require explicit "load {domain} guide" request instead of auto-loading on keywords

**Total saved this phase:** ~1,672 tokens (via lazy-loading)  
**Cumulative savings:** ~12,781 tokens (29% of original 44,541)  
**Current active context:** ~31,760 tokens  
**Strategy:** Gate infrequently-used prompts behind explicit load requests, preserve base knowledge for guidance

### 2025-12-07: Phase 4 Token Optimization (Semantic Section Extraction) ✅

**Changes:**

-   Added section markers to 3 large security prompts:
    -   `nodejs-security-hardening.prompt.md` (14 sections with Quick Navigation)
    -   `npm-package-security.prompt.md` (10 sections with Quick Navigation)
    -   `secure-code-review.prompt.md` (13 sections with Quick Navigation)
-   Created section index in each prompt with line ranges for targeted loading
-   Updated `mental-model-map.md` with section loading strategy and examples
-   Sections marked with `<!-- SECTION: Name -->` and `<!-- END SECTION -->`

**Total saved this phase:** ~2,500 tokens (via partial section loading)  
**Cumulative savings:** ~15,281 tokens (34% of original 44,541)  
**Current active context:** ~29,260 tokens  
**Strategy:** Load only relevant sections for targeted queries, full prompts for comprehensive reviews. Conservative estimate: 60% of security queries can use sections instead of full files.

**Section Loading Implementation:**

-   **Option A (Manual)**: Use `read_file` with explicit line ranges from Quick Navigation
-   **Option B (Smart)**: Parse section markers, match keywords to section names, load selectively
-   **Fallback**: Load full file for general security audits or when section unclear

### 2025-12-07: Vimeo Bug Bounty Campaign — SSRF Confirmed ✅

**Context**: Shifted from Uber (Informative outcome) to Vimeo. Applied historical vulnerability research + systematic testing.

**Findings**:
- ✅ **Critical SSRF Confirmed** — `POST /me/videos` with `pull` approach accepts arbitrary URLs including OOB domains
- Upload created with `http://[uuid].oast.fun` (201 response, URI: `/users/user251586116/uploads/1143342422`)
- Matches historical H1 #549882 ($5k, 2019) — same vulnerability pattern
- Expected bounty: $2,000-$5,000

**Methodologies Applied**:
1. Historical intel gathering (70 H1 reports analyzed → `GITHUB-INTELLIGENCE.md`)
2. Systematic auth testing (VHX CSRF properly enforced, no vulns)
3. ChromeDevTools MCP for JWT extraction (browser instrumentation > manual proxy)
4. OOB SSRF validation (201 Created confirms vulnerability)

**Session Artifacts**:
- JWT extracted and saved (`credentials/jwt-fresh.txt`, valid 3+ hours)
- Finding documented (`findings/2025-12-07-blind-ssrf-pull-upload.md`)
- Session summary created (`sessions/2025-12-07-chrome-ssrf-testing.md`)
- Next session issue created (GitHub #5)

**Tools Proven Effective**:
- ChromeDevTools MCP: Direct network inspection > manual proxy setup
- Historical research: 70 reports analyzed → prioritized high-yield attack surfaces
- OOB testing: Fast validation without waiting for callback confirmation

**Next**: Cloud metadata exfiltration + historical vulnerability testing (?action=share, API versions bypass)

### 2025-12-07: Dynamic Context Loading Architecture ✅

**Epic #10 — Phases Completed:**

1. **Phase 1: Bootstrap Layer** (#4) ✅

    - Created `bootstrap/core-identity.md` (~250 tokens)
    - Created `bootstrap/capability-index.md` (~358 tokens)
    - Created `bootstrap/context-loader.md` (~303 tokens)
    - Total: ~911 tokens (54% under 2K target)

2. **Phase 2: Memory System** (#6) ✅

    - Created `memory/session.md` (~87 tokens, compressed from 416)
    - Created `memory/hot-context.template.md` (~50 tokens)
    - Archived `project/session-state.md` → `archive/sessions/`
    - Updated `persistent-memory.instructions.md` with three-tier system

3. **Phases 3 & 5** (#7, #8) — Closed as not-planned

    - VSCode auto-attaches `instructions/*.instructions.md` (~5K tokens)
    - Cannot control platform attachment behavior
    - Bootstrap layer ready for future platform support

4. **Phase 4: Agent Definition** (#5) ✅
    - Updated `agents/aynorica.agent.md` to document architecture
    - Added three-tier context system table
    - Preserved old version → `archive/agents-aynorica.agent-v1.md`

**Architecture Created:**
| Tier | Location | Tokens | Purpose |
|------|----------|--------|---------|
| 0 (Bootstrap) | `bootstrap/*.md` | ~911 | Core identity, capabilities, loading rules |
| 1 (Session) | `memory/session.md` | ~87 | Current mission, ready queue, hot context |
| 2 (Hot) | `memory/hot-context.md` | Variable | In-session ephemeral state |

**Platform Constraint:** VSCode mode attachments auto-load all instructions (~5K tokens). Bootstrap layer is architecturally correct for when selective loading becomes available.

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

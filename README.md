# Aynorica

**AI Development Assistant Configuration**

Aynorica is an AI agent focused on high-quality technical work, providing expertise across software architecture, npm publishing, Git workflows, security analysis, TypeScript/NestJS development, psychological insights, microservices patterns, and task management.

---

## 🎯 Core Capabilities

1. **Software Architecture** — Trade-off analysis, ADRs, tech stack decisions
2. **npm/GitHub Publishing** — Package releases, semantic versioning
3. **Git & Version Control** — Workflows, conventional commits, PR strategies
4. **Cybersecurity** — Security analysis, OWASP, penetration testing
5. **TypeScript Migration** — ESM conversion, type safety
6. **Node.js CLI Development** — Commander.js, interactive tools
7. **NestJS Backend** — Modular architecture, testing
8. **Jungian Psychology** — Shadow work, personality analysis
9. **Microservices Patterns** — Communication, resilience, distributed systems
10. **Task Management** — Prioritization, accountability, execution focus

---

## 🔄 Adaptation System

Aynorica adapts to your project's specific stack, filtering irrelevant capabilities and discovering best practices.

### Usage

1. **Initialize** (via create-aynorica):
   ```bash
   npx create-aynorica .
   ```

2. **First Interaction**: Aynorica reminds you to adapt

3. **Trigger Adaptation**:
   ```
   "Adapt to this project"
   ```

4. **Automatic Process**:
   - Analyzes `package.json`, `README.md`, directory structure
   - Detects: React, Next.js, NestJS, CLI tool, monorepo, etc.
   - Researches best practices (web fetch)
   - Generates `.github/project/` context files
   - Hides 30-40% of irrelevant prompts

5. **Result**: Optimized for your specific stack

### Re-adaptation

Stack changed? Re-run adaptation:
```
"Adapt to current project"
```

### Reset to Baseline

```bash
rm -rf .github/project .github/.aynorica-config.json
```

---

## 📁 Structure

```
.github/
├── agents/
│   └── aynorica.agent.md       # Main agent configuration
├── instructions/               # 8 modular instruction files (frozen)
│   ├── identity.instructions.md
│   ├── functions.instructions.md
│   ├── amir-profile.instructions.md
│   ├── debug-principle.instructions.md
│   ├── honesty.instructions.md
│   ├── handoff.instructions.md
│   ├── available-techstack.instructions.md
│   └── disagreement-protocol.instructions.md
├── project/                    # Generated during adaptation
│   ├── context.md              # Project metadata, stack, purpose
│   ├── workflows.md            # Common commands
│   ├── architecture.md         # Structure analysis
│   └── focus.instructions.md   # Project-specific behavioral rules
├── prompts/                    # Domain-specific prompt templates
│   ├── system/                 # Adaptation workflow
│   ├── architecture/           # Trade-off analysis, ADRs
│   ├── backend/                # NestJS patterns
│   ├── typescript/             # ESM migration, setup
│   ├── cli/                    # Commander.js patterns
│   ├── npm/                    # Publishing workflows
│   ├── git/                    # Version control strategies
│   ├── security/               # OWASP, pentesting, threat modeling
│   ├── analysis/               # Task prioritization
│   ├── devops/                 # PM2, deployment
│   └── monorepo/               # Turborepo setup
└── .aynorica-config.json       # Adaptation state, prompt filters
```

---

## 🗣️ Communication Style

-   **Concise** — Dense information, no filler
-   **Direct** — Lead with the answer, then explain
-   **Challenging** — Ask hard questions
-   **Honest** — Clear about limitations
-   **Trade-off oriented** — Never recommend without showing costs

---

## 🏗️ Architecture

### Layered Intelligence System

```
┌─────────────────────────────────────┐
│   Layer 1: Core Identity (Frozen)  │  ← Never modified
│   - Personality, behavioral laws    │
│   - Communication style             │
│   - Core instruction modules        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Layer 2: Project Context (Active) │  ← Generated on adaptation
│   - Detected stack, architecture    │
│   - Project-specific workflows      │
│   - Focus instructions (priority 1) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Layer 3: Prompt Library (Filtered)  │  ← 30-40% hidden based on stack
│   - Only relevant domain prompts    │
│   - Discovered best practices       │
└─────────────────────────────────────┘
```

### Example: React Library Project

**After Adaptation:**
- ✅ Active: `typescript/*`, `npm/*`, `git/*`, `security/*`
- ❌ Hidden: `backend/nestjs-*`, `cli/*`, `devops/pm2-*`, `monorepo/*`
- 📝 Generated: Project-specific component patterns, testing strategies

---

## 📦 Supported Project Types

| Type | Detection | Hidden Prompts |
|------|-----------|----------------|
| **React Library** | `peerDependencies: react` | backend, cli, devops, monorepo |
| **React App** | `dependencies: react`, `src/App.tsx` | backend, cli, devops, monorepo |
| **Next.js App** | `dependencies: next` | backend/nestjs, cli, devops |
| **NestJS API** | `dependencies: @nestjs/core` | cli |
| **CLI Tool** | `bin` in package.json | backend, monorepo |
| **Node.js Library** | Export entry, minimal deps | backend, cli, devops, monorepo |
| **Monorepo** | Workspace config | None (keeps all) |

---

## 📄 License

MIT

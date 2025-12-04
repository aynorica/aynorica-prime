---
mode: agent
description: Project adaptation and context alignment workflow
---

# Adaptation Prompt

**Purpose:** Align Aynorica's mental model with the specific project context, filtering irrelevant capabilities while discovering project-specific best practices.

---

## 🎯 Adaptation Goals

1. **Detect project stack** — Language, framework, architecture type
2. **Understand project purpose** — Library, app, API, CLI tool, monorepo
3. **Research best practices** — Fetch relevant documentation and patterns
4. **Generate project context** — Create `.github/project/` layer
5. **Filter prompts** — Hide 30-40% of irrelevant capabilities
6. **Preserve core identity** — Never modify `.github/agents/` or core instructions

---

## 📋 Adaptation Workflow

### Phase 1: Project Discovery (Auto)

**Scan these files (in order):**

1. **`package.json`** → Primary stack detection
   - Dependencies: React, Next.js, NestJS, Express, Fastify
   - DevDependencies: Jest, Vitest, Playwright, Cypress
   - Scripts: Detect common commands (dev, build, test)
   - Type: Library vs application (check `main`, `exports`, `bin`)

2. **`README.md`** → Project purpose extraction
   - Look for: "This is a...", "Purpose:", description at top
   - Identify: Problem solved, target users, key features

3. **`tsconfig.json`** / **`jsconfig.json`** → TypeScript/JavaScript config
   - Module system: ESM vs CommonJS
   - Target: Browser vs Node.js
   - Strict mode: Type safety level

4. **Directory structure** → Architecture patterns
   ```
   src/
   ├── components/     → React/Vue component library
   ├── pages/          → Next.js/Nuxt app
   ├── controllers/    → NestJS/Express API
   ├── commands/       → CLI tool
   ├── modules/        → NestJS modular architecture
   └── lib/            → Utility library
   ```

5. **`.github/workflows/`** → CI/CD patterns
   - Testing strategy
   - Deployment targets
   - Release automation

6. **`pnpm-workspace.yaml`** / **`lerna.json`** / **`turbo.json`** → Monorepo detection

---

### Phase 2: Stack Classification

**Detect primary project type:**

| Pattern | Classification | Key Indicators |
|---------|----------------|----------------|
| **React App** | Frontend application | React + Vite/Webpack, `src/App.tsx` |
| **Next.js App** | Full-stack framework | `next.config.js`, `app/` or `pages/` |
| **React Library** | Component library | React in peerDeps, no app entry |
| **NestJS API** | Backend service | `@nestjs/core`, controllers/modules |
| **Express API** | Backend service | Express + TypeScript, routes/ |
| **CLI Tool** | Command-line utility | `bin` in package.json, commander/yargs |
| **Node.js Library** | Utility package | No React/Vue, exported functions |
| **Monorepo** | Multi-package workspace | Workspace config, `packages/` |

**Output:** Project type classification

---

### Phase 3: Best Practices Research

**For each detected technology, fetch documentation:**

| Technology | URLs to Fetch |
|------------|---------------|
| **React** | https://react.dev/learn/thinking-in-react |
| **Next.js** | https://nextjs.org/docs/app/building-your-application |
| **NestJS** | https://docs.nestjs.com/fundamentals/testing |
| **Vite** | https://vite.dev/guide/ |
| **Vitest** | https://vitest.dev/guide/ |
| **TypeScript** | https://www.typescriptlang.org/docs/handbook/intro.html |

**Extract key patterns:**
- Component structure conventions
- Testing strategies
- Performance best practices
- Common pitfalls to avoid

**Time budget:** 30-60 seconds total for web research

---

### Phase 4: Generate Project Context

**Create `.github/project/context.md`:**

```markdown
# Project Context

**Generated:** 2025-12-04T10:30:00Z  
**Project Type:** React Component Library

## Detected Stack

- **Language:** TypeScript 5.7.2
- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.0.1
- **Testing:** Vitest 2.1.8
- **Package Manager:** pnpm 10.24.0

## Project Purpose

[Extracted from README.md]

## Architecture

- **Type:** Library (exported components)
- **Entry Point:** `src/index.ts`
- **Components:** 24 files in `src/components/`
- **Tests:** Co-located `.test.tsx` files

## Key Commands

- `pnpm dev` — Development mode with HMR
- `pnpm build` — Production build
- `pnpm test` — Run Vitest
- `pnpm lint` — ESLint check
```

**Create `.github/project/workflows.md`:**

```markdown
# Common Workflows

## Development

1. Start dev server: `pnpm dev`
2. Make changes in `src/components/`
3. Test changes: `pnpm test Button.test.tsx`
4. Lint: `pnpm lint`

## Before Commit

1. Run full test suite: `pnpm test`
2. Type check: `tsc --noEmit`
3. Lint: `pnpm lint --fix`

## Release

1. Update version: `npm version patch/minor/major`
2. Build: `pnpm build`
3. Publish: `npm publish`
```

**Create `.github/project/focus.instructions.md`:**

```markdown
---
applyTo: "**"
priority: 1
---

# Project Focus Instructions

## Scope: React Component Library

This project is a **component library** for React applications.

## Core Constraints

- **Backward Compatibility:** All API changes must be backward compatible
- **TypeScript:** All components must have proper type definitions
- **Testing:** 80%+ coverage required, test user interactions
- **Documentation:** TSDoc comments for all exported components

## Anti-Dispersal Rules

❌ **Avoid These Topics:**
- Backend architecture (NestJS, microservices)
- Database design
- DevOps deployment strategies (unless CI/CD related)
- CLI tool patterns

✅ **Focus On:**
- Component API design
- React patterns (hooks, composition, performance)
- Type safety and generics
- Testing with Vitest + Testing Library
- Build configuration (Vite)
- Package publishing

## Common Issues

1. **Type errors in generics** — Use `extends` constraints
2. **Test flakiness** — Use `waitFor` for async updates
3. **Bundle size** — Check with `pnpm build` + size analysis

## Suggested Prompts

When working on this project, these prompts are most relevant:
- `.github/prompts/typescript/esm-migration.prompt.md`
- `.github/prompts/npm/package-publishing.prompt.md`
- `.github/prompts/git/workflow.prompt.md`
```

**Create `.github/project/architecture.md`:**

```markdown
# Architecture Analysis

## Component Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.types.ts
│   └── ...
├── hooks/
├── utils/
└── index.ts
```

## Design Patterns Detected

- **Co-located tests** — Tests next to components
- **Type separation** — `.types.ts` files for shared types
- **Barrel exports** — Central `index.ts` export

## State Management

[Detected: Context API / None / Zustand / Redux]

## Styling

[Detected: CSS Modules / Tailwind / Styled Components / Emotion]
```

---

### Phase 5: Prompt Filtering

**Create `.github/.aynorica-config.json`:**

```json
{
  "version": "1.0.0",
  "adapted": "2025-12-04T10:30:00Z",
  "project": {
    "type": "react-library",
    "name": "my-component-library",
    "stack": ["react", "typescript", "vite", "vitest"]
  },
  "prompts": {
    "active": [
      "typescript/**",
      "npm/**",
      "git/**",
      "security/**",
      "analysis/**"
    ],
    "hidden": [
      "backend/nestjs-*",
      "monorepo/*",
      "cli/*",
      "devops/pm2-*"
    ],
    "added": []
  },
  "instructions": {
    "core": [
      "identity.instructions.md",
      "functions.instructions.md",
      "amir-profile.instructions.md",
      "debug-principle.instructions.md",
      "honesty.instructions.md",
      "handoff.instructions.md",
      "available-techstack.instructions.md",
      "disagreement-protocol.instructions.md"
    ],
    "project": [
      "project/focus.instructions.md"
    ]
  }
}
```

**Filtering Rules (Conservative 30-40%):**

| Project Type | Hidden Prompts |
|--------------|----------------|
| **React App/Library** | `backend/*`, `monorepo/*`, `cli/*`, `devops/pm2-*` |
| **Next.js App** | `backend/nestjs-*`, `cli/*`, `devops/pm2-*` (keep `monorepo/*`) |
| **NestJS API** | `cli/*`, (keep all backend, devops) |
| **CLI Tool** | `backend/*`, `monorepo/*` (keep CLI, typescript, npm) |
| **Monorepo** | (Keep everything, just add monorepo context) |

**Always Active:**
- `security/**` — Always relevant
- `git/**` — Version control always needed
- `analysis/task-prioritization.prompt.md` — Task management

---

### Phase 6: Confirmation Report

**Present to user:**

```markdown
## 🎯 Adaptation Complete

**Project Type:** React Component Library  
**Stack:** React 18.3.1 + TypeScript 5.7.2 + Vite 6.0.1

### 📊 Changes Made

**Created:**
- `.github/project/context.md` — Project metadata
- `.github/project/workflows.md` — Common commands
- `.github/project/architecture.md` — Structure analysis
- `.github/project/focus.instructions.md` — Behavioral focus rules
- `.github/.aynorica-config.json` — Adaptation config

**Filtered Prompts:**
- ❌ Hidden: `backend/nestjs-*` (4 prompts)
- ❌ Hidden: `cli/*` (1 prompt)
- ❌ Hidden: `devops/pm2-*` (1 prompt)
- ❌ Hidden: `monorepo/*` (1 prompt)
- ✅ Active: 12 prompts (architecture, typescript, npm, git, security, analysis)

**Research Completed:**
- Fetched React best practices
- Fetched Vite configuration patterns
- Fetched Vitest testing strategies

### ✅ Ready

I'm now optimized for React component development. Core identity preserved, irrelevant capabilities hidden.

**To reset:** Delete `.github/project/` and `.github/.aynorica-config.json`, then run adaptation again.
```

---

## 🔧 Implementation Notes

### Detection Logic (Pseudocode)

```typescript
async function detectProjectType() {
  const pkg = await readJSON('package.json');
  
  // Check for monorepo first
  if (existsSync('pnpm-workspace.yaml') || existsSync('turbo.json')) {
    return 'monorepo';
  }
  
  // Check for CLI tool
  if (pkg.bin) {
    return 'cli-tool';
  }
  
  // Check for React
  if (pkg.dependencies?.react || pkg.peerDependencies?.react) {
    // Library vs App
    if (pkg.peerDependencies?.react) return 'react-library';
    if (existsSync('pages/') || existsSync('app/')) return 'next-app';
    return 'react-app';
  }
  
  // Check for NestJS
  if (pkg.dependencies?.['@nestjs/core']) {
    return 'nestjs-api';
  }
  
  // Check for Express/Fastify
  if (pkg.dependencies?.express || pkg.dependencies?.fastify) {
    return 'node-api';
  }
  
  // Default to library
  return 'node-library';
}
```

### Web Fetch Strategy

**Parallel fetch with timeout:**
```typescript
const urls = getRelevantDocs(projectType);
await Promise.allSettled(
  urls.map(url => fetch_webpage({ urls: [url], query: 'best practices' }))
);
// Continue even if some fetches fail
```

---

## 🚫 Constraints

**NEVER modify:**
- `.github/agents/aynorica.agent.md` (core personality)
- `.github/instructions/*.instructions.md` (behavioral laws)

**ONLY modify:**
- Create `.github/project/*` (new layer)
- Create `.github/.aynorica-config.json` (tracking)
- Optionally add `.github/prompts/[project-specific]/` (discovered patterns)

---

## 🔄 Re-adaptation

**When to re-adapt:**
- Stack changes (added Next.js to React app)
- Major dependency updates
- Architecture refactor (monolith → monorepo)
- User request: "Adapt to current project"

**Process:** Delete `.github/project/` and `.github/.aynorica-config.json`, run adaptation again.

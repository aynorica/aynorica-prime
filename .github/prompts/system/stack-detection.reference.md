# Stack Detection Templates

Reference patterns for project type classification during adaptation.

---

## 🎯 Detection Strategy

1. **Primary:** Check `package.json` dependencies and structure
2. **Secondary:** Analyze directory structure
3. **Tertiary:** Check configuration files

---

## 📦 React Library

**Indicators:**
```json
// package.json
{
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

**Directory Structure:**
```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
├── hooks/
└── index.ts  // Barrel export
```

**Key Files:** No `App.tsx`, has export entry point

**Hidden Prompts:** `backend/*`, `cli/*`, `devops/pm2-*`, `monorepo/*`

---

## ⚛️ React Application

**Indicators:**
```json
// package.json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

**Directory Structure:**
```
src/
├── App.tsx
├── main.tsx
├── components/
├── pages/
└── assets/
```

**Key Files:** Has `App.tsx` or `main.tsx`, no export entry

**Hidden Prompts:** `backend/*`, `cli/*`, `devops/pm2-*`, `monorepo/*`

---

## ⏭️ Next.js Application

**Indicators:**
```json
// package.json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

**Directory Structure (App Router):**
```
app/
├── layout.tsx
├── page.tsx
└── api/
```

**Or (Pages Router):**
```
pages/
├── _app.tsx
├── index.tsx
└── api/
```

**Key Files:** `next.config.js`, `app/` or `pages/`

**Hidden Prompts:** `backend/nestjs-*`, `cli/*`, `devops/pm2-*`

---

## 🦁 NestJS API

**Indicators:**
```json
// package.json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0"
  }
}
```

**Directory Structure:**
```
src/
├── app.module.ts
├── main.ts
├── controllers/
├── services/
└── modules/
```

**Key Files:** `nest-cli.json`, modular architecture

**Hidden Prompts:** `cli/*`

**Active Focus:** All backend prompts, devops, security

---

## 🚀 Express/Fastify API

**Indicators:**
```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0",
    // or
    "fastify": "^4.0.0"
  }
}
```

**Directory Structure:**
```
src/
├── server.ts
├── routes/
├── controllers/
└── middleware/
```

**Key Files:** Flat structure, no framework-specific config

**Hidden Prompts:** `backend/nestjs-*`, `cli/*`, `monorepo/*`

---

## ⌨️ CLI Tool

**Indicators:**
```json
// package.json
{
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "dependencies": {
    "commander": "^11.0.0",
    // or
    "yargs": "^17.0.0"
  }
}
```

**Directory Structure:**
```
src/
├── cli.ts
├── commands/
│   ├── init.ts
│   └── build.ts
└── utils/
```

**Key Files:** `bin` entry in package.json

**Hidden Prompts:** `backend/*`, `monorepo/*`

**Active Focus:** CLI prompts, npm publishing, git

---

## 📚 Node.js Library

**Indicators:**
```json
// package.json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js"
  },
  "dependencies": {}  // Minimal dependencies
}
```

**Directory Structure:**
```
src/
├── index.ts
├── utils/
└── lib/
```

**Key Files:** Export entry point, no UI framework

**Hidden Prompts:** `backend/*`, `cli/*`, `devops/pm2-*`, `monorepo/*`

---

## 📦 Monorepo

**Indicators:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Or:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Or:**
```json
// lerna.json
{
  "packages": ["packages/*"]
}
```

**Directory Structure:**
```
packages/
├── package-a/
└── package-b/
apps/
├── web/
└── api/
```

**Key Files:** Workspace configuration, multiple packages

**Hidden Prompts:** None (keep all prompts, add monorepo-specific context)

---

## 🔍 Detection Priority

1. **Monorepo detection first** — If workspace config exists, classify as monorepo
2. **CLI tool** — If `bin` field exists
3. **Framework detection** — Check for React, Next.js, NestJS
4. **Architecture analysis** — Library vs application
5. **Fallback** — Node.js library

---

## 📊 Confidence Scoring

For ambiguous projects, use confidence scoring:

```typescript
interface DetectionResult {
  type: ProjectType;
  confidence: number; // 0-100
  secondary?: ProjectType; // Alternative classification
}

// Example: React app with CLI commands
{
  type: 'react-app',
  confidence: 80,
  secondary: 'cli-tool'  // Has bin entry but mainly React
}
```

**Resolution:**
- Confidence < 60: Ask user for confirmation
- Confidence 60-80: Proceed with note in context.md
- Confidence > 80: Proceed automatically

---

## 🧪 Testing Heuristics

**Jest vs Vitest:**
```json
// package.json
{
  "devDependencies": {
    "jest": "^29.0.0"  → Jest
    "vitest": "^2.0.0" → Vitest
  }
}
```

**Testing Library:**
```json
{
  "devDependencies": {
    "@testing-library/react": "*" → React Testing Library
    "@testing-library/jest-dom": "*" → Jest DOM matchers
  }
}
```

**E2E Testing:**
```json
{
  "devDependencies": {
    "cypress": "*" → Cypress
    "playwright": "*" → Playwright
  }
}
```

---

## 🎨 Styling Detection

**CSS Modules:**
```typescript
// Presence of *.module.css files
import styles from './Button.module.css';
```

**Tailwind:**
```json
// tailwind.config.js exists
{
  "devDependencies": {
    "tailwindcss": "^3.0.0"
  }
}
```

**Styled Components:**
```json
{
  "dependencies": {
    "styled-components": "^6.0.0"
  }
}
```

**Emotion:**
```json
{
  "dependencies": {
    "@emotion/react": "^11.0.0"
  }
}
```

---

## 🗄️ State Management

**Redux:**
```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0"
  }
}
```

**Zustand:**
```json
{
  "dependencies": {
    "zustand": "^4.0.0"
  }
}
```

**Jotai:**
```json
{
  "dependencies": {
    "jotai": "^2.0.0"
  }
}
```

**Context API:**
- No state library dependency
- Check for `createContext` usage in codebase

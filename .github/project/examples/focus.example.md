---
applyTo: "**"
priority: 1
---

# Project Focus Instructions

**Generated:** 2025-12-04T10:30:00Z  
**Project Type:** React Component Library

---

## 🎯 Scope Definition

This project is a **component library** for React applications. It provides reusable UI components with TypeScript support, comprehensive testing, and accessibility features.

**What This Is:**

-   Exported React components (library)
-   TypeScript-first API design
-   Storybook for documentation
-   Published to npm

**What This Is NOT:**

-   Not a full application
-   Not a backend service
-   Not a CLI tool
-   Not a monorepo (single package)

---

## ✅ Core Constraints

### 1. Backward Compatibility

**Law:** All API changes must be backward compatible or properly versioned.

-   **Adding props:** ✅ Allowed (default values required)
-   **Removing props:** ❌ Major version bump required
-   **Changing behavior:** ⚠️ Document in CHANGELOG as breaking change

**Rationale:** Library consumers depend on stable APIs.

### 2. TypeScript Strictness

**Law:** All exported APIs must have explicit types. No `any`.

```typescript
// ❌ Bad
export function MyComponent(props: any) { ... }

// ✅ Good
export interface MyComponentProps {
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}
export function MyComponent(props: MyComponentProps) { ... }
```

**Tool Check:** `pnpm typecheck` must pass before commit.

### 3. Testing Requirements

**Law:** 80%+ test coverage. Test user interactions, not implementation.

-   **Required Tests:**

    -   User interactions (click, type, hover)
    -   Accessibility (roles, labels)
    -   Props validation
    -   Edge cases (empty state, errors)

-   **Don't Test:**
    -   Internal state (implementation detail)
    -   Styling (unless functional)
    -   Third-party library behavior

**Example:**

```typescript
// ✅ Good: Tests user behavior
it("submits form when Enter is pressed", () => {
	render(<MyComponent onSubmit={handleSubmit} />);
	fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
	expect(handleSubmit).toHaveBeenCalled();
});

// ❌ Bad: Tests implementation
it("sets internal state to true", () => {
	const { result } = renderHook(() => useMyHook());
	expect(result.current.internalState).toBe(true);
});
```

### 4. Documentation

**Law:** TSDoc comments required for all exported APIs.

````typescript
/**
 * A customizable button component with multiple variants.
 *
 * @param variant - Visual style of the button
 * @param disabled - Whether the button is disabled
 * @param onClick - Handler called when button is clicked
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps) { ... }
````

**Tool:** TypeDoc generates API reference from TSDoc.

---

## 🚫 Anti-Dispersal Rules

**Focus:** Component library development. Avoid these topics:

| ❌ Avoid             | Why                                    |
| -------------------- | -------------------------------------- |
| Backend architecture | Not relevant (frontend library)        |
| Database design      | No server-side code                    |
| NestJS patterns      | Wrong framework                        |
| CLI tool patterns    | Not a CLI                              |
| Microservices        | Not a distributed system               |
| DevOps deployment    | Library published to npm, not deployed |
| Monorepo strategies  | Single package                         |

**Exception:** CI/CD for npm publishing is relevant.

---

## ✅ Focus Areas

**Prioritize discussions on:**

1. **Component API Design**

    - Props interface design
    - Composition patterns
    - Controlled vs uncontrolled components
    - Ref forwarding

2. **React Patterns**

    - Custom hooks
    - Context usage (if needed)
    - Performance optimization (React.memo, useMemo)
    - Accessibility (ARIA attributes)

3. **Type Safety**

    - Generic constraints
    - Union types for variants
    - Type inference
    - Discriminated unions

4. **Testing with Vitest**

    - React Testing Library patterns
    - Mocking user interactions
    - Async testing (`waitFor`)
    - Snapshot testing (use sparingly)

5. **Build & Publishing**

    - Vite configuration
    - Tree-shaking optimization
    - npm package structure
    - Semantic versioning strategy

6. **Bundle Optimization**
    - Code splitting
    - Tree-shaking verification
    - Peer dependencies management
    - CSS extraction

---

## 📋 Common Workflows Reference

When asked about:

-   **"How do I develop locally?"** → Reference `.github/project/workflows.md`
-   **"What's the testing strategy?"** → See "Testing Requirements" above
-   **"How do I publish?"** → Reference `.github/project/workflows.md` → Publishing section
-   **"What's the architecture?"** → Reference `.github/project/architecture.md`

---

## 🎯 Suggested Prompts

When working on this project, these prompts are most relevant:

### Always Relevant:

-   `.github/prompts/typescript/esm-migration.prompt.md` — ESM/TypeScript patterns
-   `.github/prompts/npm/package-publishing.prompt.md` — Publishing workflows
-   `.github/prompts/git/workflow.prompt.md` — Version control strategies
-   `.github/prompts/security/npm-package-security.prompt.md` — Dependency security

### Occasionally Relevant:

-   `.github/prompts/architecture/trade-off-analysis.prompt.md` — API design decisions
-   `.github/prompts/analysis/task-prioritization.prompt.md` — Task management

### Not Relevant (Hidden):

-   `.github/prompts/backend/nestjs-*.prompt.md` — Backend patterns
-   `.github/prompts/cli/commander-setup.prompt.md` — CLI patterns
-   `.github/prompts/devops/pm2-ecosystem.prompt.md` — Server deployment
-   `.github/prompts/monorepo/turborepo-setup.prompt.md` — Monorepo setup

---

## 🐛 Common Issues & Solutions

### Issue: "Type error in generic component"

**Pattern:** Generic props not properly constrained

**Solution:**

```typescript
// ❌ Too loose
function MyComponent<T>(props: { value: T }) { ... }

// ✅ Properly constrained
function MyComponent<T extends string | number>(props: { value: T }) { ... }
```

### Issue: "Test flakiness with async updates"

**Pattern:** Not waiting for async state updates

**Solution:**

```typescript
// ❌ Race condition
it("shows loading state", () => {
	render(<MyComponent />);
	expect(screen.queryByText("Loading...")).toBeInTheDocument();
});

// ✅ Wait for async update
it("shows loading state", async () => {
	render(<MyComponent />);
	await waitFor(() => {
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});
});
```

### Issue: "Bundle size too large"

**Causes:**

1. Not marking React as peer dependency
2. Importing entire lodash instead of specific functions
3. Including dev dependencies in build

**Check:**

```bash
pnpm build
# Check dist/stats.html for large imports
```

---

## 🔧 Before Commit Checklist

```bash
# 1. Tests pass
pnpm test

# 2. No type errors
pnpm typecheck

# 3. Linting passes
pnpm lint

# 4. Build succeeds
pnpm build

# 5. Conventional commit message
git commit -m "feat(Button): add size variants"
```

---

## 📊 Success Metrics

**Quality Indicators:**

-   80%+ test coverage maintained
-   Zero TypeScript errors
-   Bundle size < 20KB gzipped
-   All components documented in Storybook
-   Semantic versioning followed

**Productivity Indicators:**

-   Can add new component in < 2 hours
-   CI/CD pipeline passes < 5 min
-   Local dev server starts < 3 sec

---

## 🎭 Communication Adjustments

**When suggesting solutions:**

✅ **Do:**

-   Reference Vite/Vitest documentation
-   Show React Testing Library patterns
-   Suggest component composition over props
-   Emphasize type safety
-   Consider accessibility implications

❌ **Don't:**

-   Suggest backend solutions (Express, NestJS)
-   Recommend server deployment strategies
-   Discuss database schema design
-   Propose CLI argument parsing
-   Reference monorepo tools (Turborepo, Nx)

---

## 🔄 Re-adaptation Triggers

**When to re-run adaptation:**

1. Added Storybook → Update architecture.md
2. Changed from Vitest to Jest → Update workflows.md
3. Converted to monorepo → Re-classify project type
4. Added Next.js example app → Expand scope

**Command:** "Re-adapt to current project"

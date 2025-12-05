# Project Context

**Generated:** 2025-12-04T10:30:00Z  
**Project Type:** React Component Library  
**Confidence:** 95%

---

## Detected Stack

| Technology     | Version | Purpose                      |
| -------------- | ------- | ---------------------------- |
| **React**      | 18.3.1  | UI library (peer dependency) |
| **TypeScript** | 5.7.2   | Type safety                  |
| **Vite**       | 6.0.1   | Build tool & dev server      |
| **Vitest**     | 2.1.8   | Testing framework            |
| **pnpm**       | 10.24.0 | Package manager              |
| **ESLint**     | 9.0.0   | Linting                      |

---

## Project Purpose

**Extracted from README.md:**

> A collection of accessible, customizable React components for building modern web applications. Designed with TypeScript-first API, comprehensive testing, and minimal bundle size.

**Target Users:** React developers building web applications  
**Problem Solved:** Reusable UI components with consistent API  
**Key Features:** Accessibility (WCAG 2.1), TypeScript support, tree-shakeable

---

## Architecture

**Type:** Library (exported components)  
**Module System:** ESM  
**Entry Point:** `src/index.ts`  
**Build Output:** `dist/`

### Directory Structure

```
src/
├── components/       (24 files)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.types.ts
│   │   └── Button.stories.tsx
│   └── ...
├── hooks/           (6 files)
│   └── useClickOutside/
├── utils/           (3 files)
└── index.ts         (Barrel export)
```

**Design Patterns:**

-   Co-located tests (`.test.tsx` next to component)
-   Type separation (`.types.ts` for shared interfaces)
-   Barrel exports (central `index.ts`)
-   Storybook for component documentation

---

## Key Commands

| Command           | Purpose                    |
| ----------------- | -------------------------- |
| `pnpm dev`        | Start Storybook dev server |
| `pnpm build`      | Build library to `dist/`   |
| `pnpm test`       | Run Vitest tests           |
| `pnpm test:watch` | Watch mode for tests       |
| `pnpm lint`       | Run ESLint                 |
| `pnpm lint:fix`   | Auto-fix linting issues    |
| `pnpm typecheck`  | TypeScript type checking   |

---

## Testing Strategy

**Framework:** Vitest + React Testing Library  
**Coverage Target:** 80%+  
**Pattern:** Test user interactions, not implementation details

**Example Test Structure:**

```typescript
describe("Button", () => {
	it("calls onClick when clicked", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledOnce();
	});
});
```

---

## Styling

**Approach:** CSS Modules  
**Files:** `*.module.css` co-located with components  
**Theme:** CSS custom properties in `src/styles/theme.css`

---

## State Management

**Approach:** None (stateless components)  
**Rationale:** Library components should be controlled by consumers

---

## Build Configuration

**Tool:** Vite  
**Target:** ES2020  
**Output Formats:** ESM, CJS  
**Bundle Analysis:** Via `rollup-plugin-visualizer`

---

## CI/CD

**Platform:** GitHub Actions  
**Workflow:** `.github/workflows/ci.yml`

**Steps:**

1. Lint → TypeCheck → Test
2. Build
3. Publish to npm (on release tag)

---

## Dependencies Analysis

**Peer Dependencies:**

-   React 18+ (required by consumers)

**Dev Dependencies:**

-   Build: Vite, TypeScript
-   Testing: Vitest, @testing-library/react
-   Tooling: ESLint, Prettier

**Production Dependencies:** None (keeps bundle minimal)

---

## Performance Considerations

-   Tree-shakeable exports
-   No runtime dependencies
-   CSS Modules (no CSS-in-JS overhead)
-   Small bundle size: ~15KB gzipped

---

## Documentation

**Internal:** TSDoc comments on all exported APIs  
**External:** Storybook stories for each component  
**README:** Usage examples, installation, API reference

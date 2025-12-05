# Common Workflows

**Project:** React Component Library  
**Generated:** 2025-12-04T10:30:00Z

---

## 🚀 Development

### Start Development Server

```bash
pnpm dev
```

**Starts:** Storybook dev server at `http://localhost:6006`  
**Hot Reload:** Yes (via Vite)  
**Purpose:** Component development and testing

### Add New Component

1. Create component directory:

    ```bash
    mkdir src/components/MyComponent
    cd src/components/MyComponent
    ```

2. Create files:

    ```bash
    touch MyComponent.tsx MyComponent.types.ts MyComponent.test.tsx MyComponent.stories.tsx
    ```

3. Export from barrel:

    ```typescript
    // src/index.ts
    export { MyComponent } from "./components/MyComponent/MyComponent";
    export type { MyComponentProps } from "./components/MyComponent/MyComponent.types";
    ```

4. Test locally:
    ```bash
    pnpm test MyComponent
    ```

---

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

**Framework:** Vitest  
**Coverage:** Reported at end

### Watch Mode (Recommended during dev)

```bash
pnpm test:watch
```

**Behavior:** Re-runs tests on file changes

### Test Specific Component

```bash
pnpm test Button
```

**Pattern:** Matches filename

### Coverage Report

```bash
pnpm test:coverage
```

**Output:** `coverage/` directory + terminal report  
**Threshold:** 80% (fails CI if below)

---

## 🔍 Type Checking

### Quick Check

```bash
pnpm typecheck
```

**Tool:** TypeScript compiler (`tsc --noEmit`)  
**Duration:** ~5 seconds

### Watch Mode

```bash
pnpm typecheck:watch
```

**Use Case:** Continuous type checking during development

---

## 🎨 Linting & Formatting

### Lint Check

```bash
pnpm lint
```

**Tool:** ESLint  
**Config:** `.eslintrc.js`

### Auto-fix

```bash
pnpm lint:fix
```

**Fixes:** Auto-fixable issues (formatting, imports)

### Format Check

```bash
pnpm format:check
```

**Tool:** Prettier

---

## 🏗️ Build

### Production Build

```bash
pnpm build
```

**Steps:**

1. Clean `dist/`
2. Run TypeScript compiler
3. Bundle with Vite
4. Generate type declarations

**Output:** `dist/` directory

**Contents:**

```
dist/
├── index.js          # ESM bundle
├── index.cjs         # CommonJS bundle
├── index.d.ts        # Type declarations
└── style.css         # Component styles
```

### Verify Build

```bash
npm pack --dry-run
```

**Shows:** Files that would be published

---

## 📦 Publishing

### Pre-publish Checklist

```bash
# 1. All tests pass
pnpm test

# 2. No type errors
pnpm typecheck

# 3. No lint errors
pnpm lint

# 4. Build succeeds
pnpm build

# 5. Version bump
npm version patch|minor|major
```

### Publish to npm

```bash
npm publish
```

**Requires:** npm auth token  
**Triggers:** Git tag push → GitHub Actions → npm publish

### Publish Beta

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

**Usage by consumers:** `npm install my-library@beta`

---

## 🐛 Debugging

### Debug Test

```bash
pnpm test:debug Button
```

**Opens:** Chrome DevTools for debugging

### Storybook Build Issues

```bash
rm -rf node_modules/.vite
pnpm dev
```

**Clears:** Vite cache

### Type Errors in IDE

```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🔄 Common Issues

### Issue: Tests failing on CI but passing locally

**Cause:** Different Node.js versions or missing environment variables

**Fix:**

```bash
nvm use 22  # Match CI Node version
pnpm test
```

### Issue: Type declarations not generated

**Cause:** TypeScript errors preventing build

**Fix:**

```bash
pnpm typecheck  # See errors
# Fix errors
pnpm build
```

### Issue: Storybook not loading

**Cause:** Port conflict

**Fix:**

```bash
pnpm dev -- --port 6007
```

---

## 📊 Bundle Analysis

### Analyze Bundle Size

```bash
pnpm build
# Opens visualization in browser
```

**Tool:** `rollup-plugin-visualizer`  
**Output:** `dist/stats.html`

### Check Package Size

```bash
npx package-size my-library
```

**Shows:** Gzipped size of published package

---

## 🔗 Link for Local Testing

### Link This Package

```bash
pnpm link --global
```

### Use in Another Project

```bash
cd ../my-app
pnpm link --global my-library
```

### Unlink

```bash
pnpm unlink --global my-library
```

---

## 📝 Documentation

### Update README

After adding new component, update README.md:

```markdown
## Components

-   `Button` - Accessible button with variants
-   `Input` - Form input with validation
-   `MyComponent` - [Description] ← Add here
```

### Generate API Docs

```bash
pnpm typedoc
```

**Output:** `docs/` directory with API reference

---

## 🚢 Release Process

1. **Create release branch:**

    ```bash
    git checkout -b release/v1.2.0
    ```

2. **Update changelog:**

    ```bash
    echo "## v1.2.0\n- Added MyComponent\n- Fixed Button accessibility" >> CHANGELOG.md
    ```

3. **Version bump:**

    ```bash
    npm version minor  # Creates tag
    ```

4. **Push:**

    ```bash
    git push origin release/v1.2.0 --tags
    ```

5. **Create PR** → Merge → GitHub Actions auto-publishes

---

## 🔄 Update Dependencies

### Check Outdated

```bash
pnpm outdated
```

### Update Interactive

```bash
pnpm update -i
```

### Update Major Versions

```bash
pnpm update -L react@latest
pnpm test  # Verify no breaking changes
```

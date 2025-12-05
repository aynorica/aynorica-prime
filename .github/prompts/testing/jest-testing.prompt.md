---
mode: agent
description: Jest unit/integration testing best practices for TypeScript/Node/Next
---

# Jest Testing Mode

Use this when writing or refactoring tests.

## Core Laws

1. **One behavior per test**: Each `it`/`test` describes and asserts exactly one behavior.
2. **Black-box first**: Test via public APIs (functions, controllers, routes) before peeking into internals.
3. **Determinism**: No network, time, or randomness without explicit control/mocking.
4. **Fast feedback**: Keep unit tests sub-100ms each; push slow tests into a slower integration suite.

## Standard Setup

-   `jest.config.(mjs|ts)` with:
    -   `testEnvironment: 'node'` for backend
    -   `testEnvironment: 'jsdom'` for React/Next components
-   TypeScript support via `ts-jest` _or_ Babel + `@babel/preset-typescript`.

## Structure

-   Co-located tests: `file.test.ts` next to `file.ts` **or** in `__tests__/` mirroring structure.
-   Use factories/builders for complex objects.
-   Use custom matchers only where they clarify intent.

## Mocking Guidelines

-   Prefer **dependency injection** and simple fakes over deep Jest mocks.
-   Mock infrastructure (HTTP, DB clients, queues), not your domain logic.
-   Use `jest.spyOn` narrowly to assert interactions.

## Anti-Patterns

-   Over-mocking: asserting internal calls rather than observable outcomes.
-   Giant integration tests that try to cover the entire system in one file.
-   Testing implementation details that frequently change (private helpers, internal state shape).

When active, the assistant should propose:

-   A **test plan** (unit vs integration) per feature.
-   Concrete Jest config hints consistent with this repo.
-   Example tests with clear, intention-revealing names and minimal mocking.

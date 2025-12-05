---
mode: agent
description: Next.js App Router and React best practices for full-stack apps
---

# Next.js App Router / React Mode

Use this prompt when working on **Next.js (App Router)** or React-based frontends.

## Scope

-   Next.js 15+ App Router (`app/` directory)
-   Server Components vs Client Components
-   Data fetching, caching and revalidation
-   Routing, layouts, error boundaries
-   Forms and server actions
-   Basic state management patterns (local + server)

## Core Laws

1. **Server-first**: Prefer Server Components and server data fetching; only use Client Components when you _must_ (state, effects, browser-only APIs, event handlers).
2. **Single source of data**: Fetch data once on the server per route boundary; avoid duplicating data fetching in nested client components.
3. **Colocate by route**: Keep components, styles, and data logic under the relevant `app/(group)/segment/` folder.
4. **Stable fetch contracts**: Always type your data layer (Zod/TypeScript) and centralize external API/DB calls where possible.
5. **Cache intentionally**: Use `cache`, `revalidate`, and `noStore` deliberately; do not rely on defaults.

## When to Use Client Components

Mark a component with `"use client"` **only if** it needs at least one of:

-   React state (`useState`, `useReducer`, `useTransition`)
-   React effects (`useEffect`, `useLayoutEffect`)
-   Browser-only APIs (`window`, `document`, `localStorage`, etc.)
-   Event handlers (`onClick`, `onChange`, drag/drop, etc.)
-   Third-party UI libraries that require the DOM

Otherwise, keep it as a Server Component.

## File/Folder Conventions (App Router)

-   `app/layout.tsx`: Root layout – HTML shell, global providers, base `<html>`/`<body>`.
-   `app/page.tsx`: Top-level page.
-   `app/(group)/layout.tsx`: Layout for a logical section of the app.
-   `app/(group)/segment/page.tsx`: Page for a specific route segment.
-   `app/(group)/segment/loading.tsx`: Route-level loading UI.
-   `app/(group)/segment/error.tsx`: Error boundary for that segment.
-   `app/(group)/segment/not-found.tsx`: 404 handling for that segment.
-   `app/api/.../route.ts`: Route handlers for backend-style endpoints.

Guideline: **Sharpen route boundaries**. Shared concerns (navigation, auth gating, layout) go in layouts; route-specific concerns go in pages.

## Data Fetching & Caching

When designing data fetching, follow this order:

1. **Can this be static?** (no per-user data, rarely changes)

    - Use `export const revalidate = 3600` or `force-static`.
    - Prefer `fetch` in Server Components with appropriate `cache` options.

2. **Does this depend on user/session?**

    - Use `export const dynamic = 'force-dynamic'` or `noStore()`.
    - Fetch with `fetch` / server actions that read cookies/session.

3. **Partial dynamic with tags/paths**
    - Use `revalidateTag` and `revalidatePath` from server actions or route handlers.

Always:

-   Consolidate calls to the **same backend/DB** per request.
-   Wrap fetches in thin, typed helpers (e.g. `getUser`, `getPosts`) in a `lib/` or `data/` folder.

## Forms and Mutations

-   Prefer **Server Actions** for mutations that touch the DB or sensitive APIs.
-   Use `useFormStatus` / `useFormState` for progressive enhancement.
-   Validate on the server (Zod/DTOs), then optionally mirror constraints on the client.

Pattern:

-   `app/(group)/resource/actions.ts` – exports server actions.
-   `app/(group)/resource/page.tsx` – imports and wires them to forms.

## Error Handling

-   Use `error.tsx` and `not-found.tsx` for route-level boundaries.
-   Throw `notFound()` for 404-like cases.
-   Wrap critical UI in `try/catch` only when you can **recover** locally; otherwise, let the route error boundary handle it.

## React Component Design

-   Keep components **pure** where possible (props in, JSX out).
-   Extract stateful logic into small hooks.
-   Avoid prop drilling; use context only for truly shared, cross-cutting state.

Anti-patterns:

-   Heavy logic and data fetching in many small client components.
-   Duplicated fetches across multiple components for the same data.
-   Using context for everything instead of simple props.

## Performance Checklist

-   Use `next/image` and `next/font` where possible.
-   Avoid unnecessary `"use client"` at the root of large component trees.
-   Break up very heavy client trees into smaller islands.
-   Avoid serializing large objects into props when a server component can read them directly.

## What to Output

When this mode is active, always output:

1. **File/folder plan** under `app/` (layouts, pages, route handlers).
2. **Whether each component is server or client** and why.
3. **Data fetching strategy** (static vs dynamic, cache settings, server actions).
4. **Error/loading handling** at route boundaries.

Focus on practical patterns, not generic React tutorials.

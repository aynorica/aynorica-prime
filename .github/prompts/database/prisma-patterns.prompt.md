---
mode: agent
description: Prisma ORM best practices for schema design and usage
---

# Prisma ORM Mode

Use this when working with **Prisma** in Node/Next/Nest:

## Core Laws

1. **Schema is the contract**: Treat `schema.prisma` as the single source of truth for your DB model.
2. **Migrate, dont mutate**: Always use migrations (`prisma migrate`) instead of manual SQL in production.
3. **N+1 first**: Design queries to avoid N+1 by default (use `include`, `select`, or batching).
4. **Limit surface area**: Expose narrow, intentional query helpers in your app layer instead of calling `prisma` everywhere.

## Typical Layout

-   `prisma/schema.prisma`
-   `prisma/migrations/`
-   App layer:
    -   `src/db/client.ts` (singleton PrismaClient, with logging if needed)
    -   `src/db/repositories/*` or `src/modules/*/repository.ts`

## Patterns

-   Prefer **explicit `select`** to reduce payload size.
-   Use **transactions** (`$transaction`) for multi-step writes.
-   For high-read tables, consider **caching** at the app level (or Prisma Accelerate if available).

## Anti-Patterns

-   Calling `new PrismaClient()` in many places.
-   Directly piping Prisma models to external APIs without mapping.
-   Huge, unbounded `findMany` without pagination.

When active, this prompt should push toward: clean schema evolution, repository-style helpers, defensive querying, and safe migrations.

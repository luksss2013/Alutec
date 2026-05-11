# Tech stack

## Decision

TypeScript end-to-end with Next.js 15 App Router, Drizzle ORM, PostgreSQL, tRPC, and the supporting libraries listed below. São Paulo region for LGPD compliance.

## Full stack reference

| Layer | Technology | Reason |
|---|---|---|
| Database | PostgreSQL (Railway / Fly.io, sa-east-1) | Enums, JSONB, FTS, pg-boss, LGPD |
| Language | TypeScript (end-to-end) | Single language, AI-agent reliability |
| ORM + migrations | Drizzle ORM + drizzle-kit | Native pgEnum, no cold start, SQL-transparent |
| Mutations | Next.js 15 Server Actions | Co-located with UI, atomic DB access |
| Queries | tRPC v11 + TanStack Query | Type-safe, batchable, cache invalidation |
| Real-time | SSE via Next.js Route Handlers | Notifications, pendency refresh — 5 users |
| Webhooks / workers | Hono + pg-boss | Long-running, no serverless timeout |
| Auth + RBAC | Better Auth (self-hosted, Drizzle adapter) | LGPD, no external user store |
| Frontend | Next.js 15 App Router + React 19 RSC | Server rendering, Server Actions |
| UI components | shadcn/ui + Tailwind CSS | Modifiable, AI-agent friendly |
| Client state | Zustand (UI) + nuqs (URL) | Lightweight, predictable |
| Data tables | TanStack Table | Filtering, sorting, pagination |
| Calendar | FullCalendar | Drag-to-reschedule, conflict detection |
| Kanban | @dnd-kit | Service order pipeline |
| Forms | React Hook Form + Zod | Dynamic line items, cross-field validation |
| PDF generation | @react-pdf/renderer | Orçamento + OS document generation |
| Date handling | date-fns + date-fns-tz | São Paulo timezone, DST-aware |
| Free text inputs | react-textarea-autosize | Orçamento DESCRIÇÃO, OS notes |
| File uploads | UploadThing | OS drawings, photos, receipts |
| Email | Resend | Transactional, pt-BR templates |
| Background jobs | pg-boss → Inngest (upgrade path) | Zero extra infra, retry, singleton |
| Error monitoring | Sentry | Financial system, irreversible errors |
| Logging | Pino | Structured, fast, Railway log drain |
| Monorepo | Turborepo | Shared domain, db, pdf packages |
| Testing | Vitest (unit) + Playwright (E2E) | State machine coverage |
| i18n | next-intl (pt-BR) | Dates, currency, all strings |
| Deployment | Railway or Fly.io (sa-east-1 / gru) | LGPD, co-located DB, pg-boss workers |

## Context-specific rationale

### PDF generation — @react-pdf/renderer

The orçamento and OS must be generated as downloadable PDFs with a specific layout: company letterhead, customer block, versioning header, structured line items table, payment terms, warranty, and general terms. `@react-pdf/renderer` runs on Node.js inside a Server Action, streams directly to the browser, and handles Brazilian Portuguese characters and currency formatting. No headless Chrome overhead.

### Real-time — SSE, not WebSockets

5 concurrent users. Notifications are unidirectional (server → client). SSE is built into Next.js Route Handlers, reconnects automatically, and requires zero additional infrastructure. The client invalidates tRPC queries on SSE events.

### State machines — PostgreSQL CREATE TYPE enums

Project status, OS status, installment status — all are finite state machines with strict transitions. Drizzle's `pgEnum` maps directly to PostgreSQL `CREATE TYPE`, giving database-level constraints that reject invalid transitions even if application code has a bug.

### Date handling — date-fns + date-fns-tz

São Paulo timezone observes DST (usually ends in March — relevant for the March 2026 data). All timestamps stored as `TIMESTAMPTZ` (UTC). Financial dates (installment due dates) stored as `DATE` (no time component). Conversion to `America/Sao_Paulo` only at display time.

### BOM calculation — domain package, no math library

Product templates are pure arithmetic: linear meters from dimensions, glass area from width × height minus clearance, rounding to supplier unit quantities. Plain TypeScript with `Number.EPSILON`-safe rounding. Lives in `/packages/domain`.

### Rich text — no editor

The DESCRIÇÃO field is plain free text. Auto-resize textarea (`react-textarea-autosize`), no Tiptap/Lexical/Quill.

## Monorepo structure

```
alutec/
├── apps/
│   └── web/              # Next.js 15 App Router
├── packages/
│   ├── db/               # Drizzle schema, migrations, client
│   ├── domain/            # BOM calculation, state machines, business rules
│   ├── pdf/              # @react-pdf/renderer templates (orçamento, OS)
│   └── shared/           # Zod schemas, types, constants
├── CONTEXT.md
├── CONTEXT-MAP.md
├── AGENTS.md
└── docs/
    └── adr/
```
<instructions>
# Dasher: AI Navigation & Workflow Guide

## Build & Verification (One-Shot ONLY)

- **Type-check**: `npm run lint` (runs TypeScript + ESLint; STRONGLY RECOMMENDED over build).
- **Backend Codegen**: `npx convex codegen` (MUST run after Convex schema/query changes).
- **Backend Sync**: `npx convex run sync:syncHistoricalMetrics` (rebuild metrics table).
- **Backend Seed**: `npx convex run seed:runSeeding` (populate mock data).
- **Full Build**: `npm run build` (tsc -b && vite build).
- **E2E Tests**: `npx playwright test`.

## Process Constraints

- **NO BLOCKING**: MUST NOT run `npm run dev`, `vite`, or `convex dev` (blocking processes).
- **READ-ONLY**: `convex/_generated/` is auto-generated; DO NOT modify.

## Convex Performance Rules (MANDATORY)

- **O(1) Metrics**: Real-time stats MUST use `metrics` table via `by_key` index.
- **Counter Pattern**: Event mutations MUST update denormalized counters in `metrics` atomically via `convex/lib/metrics.ts`.
- **No Scans**: MUST NOT use `collect()` on `impressions` for dashboard UI.
- **Time Series**: Historical charts MUST use `time_series_metrics` with `by_key_bucket`.

## Path Aliases (vite.config.ts)

- `@/` → `./src`
- `@/convex/` → `./convex`

## Coding Standards

- **React 19**: Use `useActionState` and `useOptimistic` for forms.
- **URL Filtering**: Dashboard filters MUST sync with `?customerId` or `?brandId` via `react-router-dom`.
- **Tailwind 4**: Use `@theme` blocks in `src/index.css` ONLY; NO `tailwind.config.js`.
- **Modularity**: Feature-specific code goes in `src/components/dashboard/`; reusable UI in `src/components/ui/`.

## Task Routing

- **Metric Expansion**: `metrics` schema → `convex/lib/metrics.ts:updateMetrics` → `sync.ts`
- **Sidebar Updates**: `SidebarCustomerGroup.tsx` or `SidebarBrandItem.tsx` in `src/components/dashboard/Sidebar/`
- **KPI Display**: `KPIBar.tsx` + format via `src/lib/format.ts`
- **Verification**: `npx convex codegen` → `npm run lint`
  </instructions>

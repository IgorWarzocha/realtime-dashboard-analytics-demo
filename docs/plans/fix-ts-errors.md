---
plan name: fix-ts-errors
plan description: Fix TS errors and imports in Dasher project
plan status: active
---

## Idea
Fix LSP errors and broken imports in the project, specifically addressing @/ aliases, missing internal functions in convex/sync.ts, and cleaning up boilerplate. Run convex codegen to ensure type safety.

## Implementation
- Run convex codegen to update generated types
- Fix tsconfig.json to ensure @/ alias works correctly for both src and convex if needed
- Fix broken imports in DashboardLayout.tsx and other frontend components to use @/ alias consistently
- Fix convex/sync.ts by ensuring all internal functions are correctly referenced via internal.sync
- Remove or fix any legacy boilerplate files like myFunctions.ts if they exist and have errors
- Run tsc and npm run lint to verify all errors are resolved

## Required Specs
<!-- SPECS_START -->
<!-- SPECS_END -->
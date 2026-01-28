---
plan name: sidebar-filtering-system
plan description: Implement URL-based sidebar filtering for Dasher dashboard.
plan status: done
---

## Idea
Transform the decorative sidebar into a functional navigation and filtering system using URL search parameters. This allows for deep-linking into specific Brand or Customer views while maintaining the O(1) performance of the metrics system.

## Implementation
- Create a new feature spec for 'contextual-filtering' defining URL param schemas and component responsibilities.
- Update `convex/analytics.ts` to support optional filtering by `customerId` or `brandId` in `getGlobalStats`.
- Modify `src/components/dashboard/AppSidebar.tsx` to fetch real Customers and Brands from Convex.
- Implement URL state management in `AppSidebar.tsx` using `useSearchParams` to toggle active filters.
- Refactor `KPIBar.tsx` and `BrandPerformanceTable.tsx` to listen to URL state and pass filter params to Convex queries.
- Verify filtering functionality with Playwriter E2E tests.

## Required Specs
<!-- SPECS_START -->
- contextual-filtering-spec
<!-- SPECS_END -->
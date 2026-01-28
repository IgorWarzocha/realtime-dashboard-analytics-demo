# Spec: contextual-filtering-spec

Scope: feature

# Feature Spec: Contextual Filtering System

## Overview
Transform the sidebar from a static mockup into a functional navigation and filtering system. Users should be able to filter the entire dashboard by Customer or Brand via the sidebar.

## Technical Strategy
- **State Management**: URL Search Parameters (`?customerId=...` or `?brandId=...`).
- **Data Fetching**: 
  - Sidebar will fetch `customers` and `brands` from Convex.
  - Analytics queries will be updated to accept optional filter arguments.
- **Performance**: Maintain O(1) reads by utilizing existing `metrics` table indexes.

## Component Changes

### 1. AppSidebar.tsx
- Replace static `navItems` with data from `api.analytics.listCustomers` and `api.analytics.listBrands`.
- Use `useSearchParams` to set/clear filters.
- Active state should be derived from the current URL.

### 2. Analytics API (Convex)
- `getGlobalStats`: Accept `args: { customerId?: Id<"customers">, brandId?: Id<"brands"> }`.
- `getRecentImpressionsCount`: Accept similar filter args.

### 3. Dashboard UI
- `KPIBar`: Pass URL params to `getGlobalStats`.
- `BrandPerformanceTable`: Pass `customerId` to filter the list of brands displayed.

## User Experience
- Clicking a Customer expands their Brands.
- Selecting a filter instantly updates KPI cards and charts.
- Clicking 'Dashboard' (top item) clears all filters.
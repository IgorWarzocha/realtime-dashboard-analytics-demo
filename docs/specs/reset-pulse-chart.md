# Spec: reset-pulse-chart

Scope: feature

# Reset Pulse Chart Feature

## Goal

Allow users to clear the accumulated time-series data and visual clutter from the Pulse Chart via a "Reset Chart" button.

## Backend (Convex)

- **File**: `convex/admin.ts`
- **Mutation**: `resetUICharts`
- **Logic**: Update `chartResetTime` in the `simulation` table. This acts as a visual filter without deleting historical data.

## Frontend (React)

- **File**: `src/components/dashboard/SimulationController.tsx`
- **UI**: Add a "Reset Chart" button (icon: `RotateCcw`) next to the simulation toggle.
- **Interaction**:
  - Trigger `resetUICharts` mutation on click.
  - Show Toast notification on success ("Charts reset").
  - Button should be subtle (ghost/outline variant).
  - Optimistic UI for the simulation toggle to ensure zero-lag response.

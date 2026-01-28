# Spec: simulation-revamp-spec

Scope: feature

# Feature Spec: Real-time Simulation & Metrics Revamp

## 1. Objectives
- **Robust Simulation**: Transition from a fragile client-side loop to a persistent, high-throughput simulation system.
- **O(1) Real-time Metrics**: Ensure all real-time stats (including device distribution) are read from pre-aggregated metrics tables, not table scans.
- **High Growth Visibility**: Increase simulation frequency and ensure atomic metric updates are visible in the UI immediately.

## 2. Technical Strategy

### 2.1 Backend (Convex)
- **Persistent State**: Store simulation status (active/inactive, frequency) in a new `system` table to survive page refreshes.
- **Improved Metrics Schema**: 
    - Expand `metrics` table to include `device` as a key component or add a `device_metrics` table for O(1) device stats.
    - Add `campaign_metrics` table to track the "Top Performing Campaigns" efficiently.
- **Atomic Operations**: Ensure `updateMetrics` in `convex/lib/metrics.ts` handles the new counters (Device, Campaign) atomically.
- **High-Freq Ingestion**: Optimize `trackImpression` for minimal latency.

### 2.2 Simulation Loop
- **Server-Triggered (Optional/Future)**: Consider a recurring Convex Action.
- **Robust Client Loop**: Use `setInterval` in a dedicated `SimulationProvider` context rather than a component-local state.
- **Batching**: Allow the simulation to fire batches of impressions to simulate "High Growth" without hitting rate limits.

### 2.3 UI Components
- **Top Performing Campaigns Card**: New component showing the top 3-5 campaigns by impressions/CTR in the last hour, read from `campaign_metrics`.
- **Enhanced Campaign Overview**: Switch to O(1) device stats read from the new metrics structure.
- **Real-time Brand Table**: Ensure `getBrandPerformance` is reactive and reflects metric changes instantly.

## 3. Verification Plan
- **Codegen**: `npx convex codegen`
- **Lint**: `npm run lint`
- **Manual Test**: Start simulation, verify 'Device Overview' and 'Brand Performance' numbers climb rapidly, refresh page, verify simulation is still running.
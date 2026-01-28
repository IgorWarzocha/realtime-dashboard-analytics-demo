---
plan name: simulation-revamp
plan description: Revamp simulation for speed/persistence and enforce O(1) reads.
plan status: active
---

## Idea
Overhaul the simulation controller for high-frequency batching and persistence, and refactor analytics queries to strictly use the metrics table.

## Implementation
- Persist simulation state using localStorage hook in SimulationController.
- Implement 'Turbo Mode' in SimulationController to fire batched mutations (5-10x speed).
- Expand simulation data variance (browsers, granular devices, more regions).
- Refactor `getDeviceDistribution` to read from `metrics` table (requires schema update).
- Optimize `getBrandPerformance` to fetch metrics in parallel or use a more efficient query.
- Verify high-frequency updates in the dashboard.

## Required Specs
<!-- SPECS_START -->
<!-- SPECS_END -->
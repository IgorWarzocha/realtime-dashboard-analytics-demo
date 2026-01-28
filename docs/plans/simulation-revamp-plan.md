---
plan name: simulation-revamp-plan
plan description: Revamp simulation for robustness and high-growth metrics.
plan status: done
---

## Idea
Transition simulation to a persistent, high-throughput system with O(1) device/campaign metrics for immediate UI feedback.

## Implementation
- Update Convex schema to support persistent simulation state and granular O(1) metrics (device, campaign).
- Refactor 'convex/lib/metrics.ts' to handle atomic updates for new metric types.
- Implement 'convex/admin.ts' functions for persistent simulation control (start/stop/status).
- Create 'src/components/dashboard/CampaignOverview' replacement with O(1) device data.
- Implement 'Top Performing Campaigns' real-time card component.
- Refactor SimulationController to use persistent backend state and high-frequency batching.

## Required Specs
<!-- SPECS_START -->
- simulation-revamp-spec
- reset-pulse-chart
<!-- SPECS_END -->
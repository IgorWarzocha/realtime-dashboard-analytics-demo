---
plan name: banner-mvp-demo
plan description: Local MVP of a CMP dashboard.
plan status: done
---

## Idea
Create a local Convex-based MVP demo of an ad analytics dashboard inspired by Bannerflow's scale and metrics.

## Implementation
- Define Convex schema for customers, brands, ads, and impressions (using aggregations for performance).
- Implement a Convex 'seed' action to generate 100k+ realistic mock impressions across different formats.
- Create high-performance Convex queries to fetch real-time aggregated stats by brand and format.
- Build the React 19 dashboard UI using Tailwind 4, focusing on a clean 'Enterprise' aesthetic.
- Integrate a charting library (e.g., Recharts) with live-updating Convex data hooks.

## Required Specs
<!-- SPECS_START -->
- banner-demo-spec
<!-- SPECS_END -->
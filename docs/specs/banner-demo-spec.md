# Spec: banner-demo-spec

Scope: feature

# Feature Spec: Bannerflow-Style Ad Analytics Demo

## Overview
This feature implements a local MVP of an ad analytics dashboard. It demonstrates how a system built on Convex, React 19, and Tailwind 4 can handle high-frequency event data (simulated) and provide real-time insights into ad performance (impressions, CTR, format mix) for multiple brands and customers.

## Data Model (Convex)
- **customers**: Root entities (e.g., "Shutterstock", "Three").
- **brands**: Children of customers.
- **ads**: Creative entities associated with brands. Includes metadata like type (Static, Video, GIF, Animation) and dimensions.
- **impressions**: High-frequency events.
  - `adId`: Reference to the ad.
  - `timestamp`: Precise timing.
  - `isClick`: Boolean for CTR calculation.
  - `metadata`: Device type, region.

## Key Functionalities
1. **Real-time Impression Simulator**:
   - A dedicated UI component or background action that "fires" impressions into the database at a controlled rate.
   - Each impression is linked to a random active ad.
2. **Analytics Dashboard**:
   - **Live Heartbeat**: Real-time counter of total impressions.
   - **Format Performance**: Comparison of CTR across Static, Video, and Animated formats.
   - **Brand Leaderboard**: Aggregated stats for the top-performing brands.
   - **Interactive Charts**: Time-series visualization of impression volume.

## Technical Requirements
- **Convex Aggregations**: Use efficient queries to aggregate data. Since we're demoing scale, we should favor indexed queries and pre-aggregated summaries if needed, though for the local MVP, direct counts on indexed timestamps will suffice.
- **React 19 Hooks**: Use `useQuery` for live data binding.
- **Tailwind 4 Styling**: CSS-first configuration using `@theme` for branding.
- **TypeScript 5.9**: Strict typing for all event data and component props.

## Success Criteria
- The dashboard updates automatically as the simulator generates data.
- User can filter metrics by Customer/Brand.
- The UI remains responsive while handling simulated bursts of data.
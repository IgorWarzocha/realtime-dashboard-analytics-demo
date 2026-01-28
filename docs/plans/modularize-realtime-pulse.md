---
plan name: modularize-realtime-pulse
plan description: Modularize RealTimePulse into a dedicated directory.
plan status: active
---

## Idea
Refactor the monolithic RealTimePulse.tsx into a modular structure under src/components/dashboard/RealTimePulse/ to improve maintainability, type safety, and readability. Remove 'any' types and chatty comments.

## Implementation
- Create src/components/dashboard/RealTimePulse/ directory.
- Extract types into types.ts and replace all 'any' usages.
- Extract helper functions to utils.ts.
- Extract CustomTooltip, LiveChart, and PulseHeader into separate files.
- Update index.tsx to orchestrate the components and data fetching.
- Verify with npm run lint.

## Required Specs
<!-- SPECS_START -->
<!-- SPECS_END -->
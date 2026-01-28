---
plan name: ui-hygiene-cleanup
plan description: Clean up UI components slop and standardize headers/directives.
plan status: active
---

## Idea
Standardize src/components/ui/ components by removing chatty comments, adding missing headers and "use client" directives, and optimizing Tailwind 4.1 usage (e.g., size-*).

## Implementation
- Identify and remove chatty comments/slop from chart.tsx, menubar.tsx, dropdown-menu.tsx, and context-menu.tsx.
- Add standardized file headers to all four components.
- Add missing "use client" directives to menubar.tsx and dropdown-menu.tsx.
- Optimize Tailwind classes (e.g., convert h-4 w-4 to size-4) across the target files.
- Refine types in chart.tsx (getPayloadConfigFromPayload and ChartConfig).
- Verify changes with npm run lint.

## Required Specs
<!-- SPECS_START -->
<!-- SPECS_END -->
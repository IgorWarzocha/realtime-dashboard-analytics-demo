/**
 * Helper utilities and constants for real-time pulse visualization.
 */
export const TOTAL_COLOR = "#3b82f6";

export function getScaleTicks(max: number) {
  const interval = max > 500 ? 100 : 10;
  const ticks = [];
  for (let i = 0; i <= max + interval; i += interval) {
    ticks.push(i);
  }
  return ticks;
}

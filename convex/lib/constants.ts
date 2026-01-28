/**
 * convex/lib/constants.ts
 * Centralizes business logic constants and configuration for the analytics engine.
 * Includes mock financial values and seeding parameters.
 */

export const MOCK_SPEND_PER_IMPRESSION = 0.05;
export const MOCK_CONVERSION_VALUE = 5.0;

export const SEED_TOTAL_IMPRESSIONS = 100000;
export const SEED_BATCH_SIZE = 5000;

export const CTR_BENCHMARKS = {
  VIDEO: 0.08,
  ANIMATION: 0.08,
  STATIC: 0.01,
  DEFAULT: 0.02,
} as const;

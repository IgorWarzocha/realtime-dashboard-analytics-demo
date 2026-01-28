/**
 * Metrics Library
 * Denormalized counter updates with O(1) reads for real-time dashboard.
 * All mutations update metrics atomically to maintain consistency.
 */

export { BUCKET_SIZE_MS, metricsKeys, getBucket } from "./keys";
export { updateMetrics } from "./single";
export { updateMetricsBatch } from "./batch";

/**
 * Metrics Keys
 * Generates consistent cache keys for denormalized metrics storage.
 */

import { Id } from "../../_generated/dataModel";

export const BUCKET_SIZE_MS = 10000;

export const metricsKeys = {
  global: () => "global_stats",
  brand: (brandId: Id<"brands">) => `brand_stats:${brandId}`,
  customer: (customerId: Id<"customers">) => `customer_stats:${customerId}`,
  device: (device: string) => `device_stats:${device}`,
  brandDevice: (brandId: Id<"brands">, device: string) =>
    `brand_device_stats:${brandId}:${device}`,
  tsGlobal: () => "ts:global",
  tsBrand: (brandId: Id<"brands">) => `ts:brand:${brandId}`,
  tsCampaign: (adId: Id<"ads">) => `ts:campaign:${adId}`,
} as const;

export function getBucket(timestamp: number): number {
  return Math.floor(timestamp / BUCKET_SIZE_MS) * BUCKET_SIZE_MS;
}

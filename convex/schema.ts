/**
 * Defines the database schema for the ad analytics platform.
 * Contains definitions for customers, brands, ads, and their impressions.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  brands: defineTable({
    customerId: v.id("customers"),
    name: v.string(),
    slug: v.string(),
  })
    .index("by_customer", ["customerId"])
    .index("by_slug", ["slug"]),

  ads: defineTable({
    brandId: v.id("brands"),
    name: v.string(),
    type: v.union(
      v.literal("static"),
      v.literal("video"),
      v.literal("gif"),
      v.literal("animation"),
    ),
    dimensions: v.string(),
  }).index("by_brand", ["brandId"]),

  metrics: defineTable({
    key: v.string(), // global, brand_stats:ID, device_stats:DEVICE, campaign_stats:AD_ID
    totalImpressions: v.number(),
    totalClicks: v.number(),
    uniqueAds: v.optional(v.number()),
  }).index("by_key", ["key"]),

  campaign_metrics: defineTable({
    adId: v.id("ads"),
    brandId: v.id("brands"),
    impressions: v.number(),
    clicks: v.number(),
  })
    .index("by_ad", ["adId"])
    .index("by_brand_impressions", ["brandId", "impressions"])
    .index("by_impressions", ["impressions"]),

  simulation: defineTable({
    status: v.union(v.literal("running"), v.literal("stopped")),
    intensity: v.number(), // 1-10
    lastUpdated: v.number(),
    chartResetTime: v.optional(v.number()),
  }),

  impressions: defineTable({
    adId: v.id("ads"),
    timestamp: v.number(),
    device: v.string(),
    region: v.string(),
    isClick: v.boolean(),
  })
    .index("by_ad_id_and_timestamp", ["adId", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  time_series_metrics: defineTable({
    key: v.string(), // global, brand:ID
    bucket: v.number(), // 10-second aligned timestamp
    value: v.number(),
  }).index("by_key_bucket", ["key", "bucket"]),
});

/**
 * convex/sync_internal.ts
 * Internal mutations and queries for the synchronization process.
 */
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Clears all denormalized metrics tables.
 */
export const clearMetrics = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const allMetrics = await ctx.db.query("metrics").collect();
    for (const m of allMetrics) {
      await ctx.db.delete("metrics", m._id);
    }
    const allCampaignMetrics = await ctx.db.query("campaign_metrics").collect();
    for (const m of allCampaignMetrics) {
      await ctx.db.delete("campaign_metrics", m._id);
    }
    const allTSMetrics = await ctx.db.query("time_series_metrics").collect();
    for (const m of allTSMetrics) {
      await ctx.db.delete("time_series_metrics", m._id);
    }
    return null;
  },
});

/**
 * Inserts a batch of metrics into the database.
 */
export const upsertMetricsBatch = internalMutation({
  args: {
    metrics: v.array(
      v.object({
        key: v.string(),
        totalImpressions: v.number(),
        totalClicks: v.number(),
        uniqueAds: v.optional(v.number()),
      }),
    ),
    campaignMetrics: v.array(
      v.object({
        adId: v.id("ads"),
        brandId: v.id("brands"),
        impressions: v.number(),
        clicks: v.number(),
      }),
    ),
    tsMetrics: v.array(
      v.object({
        key: v.string(),
        bucket: v.number(),
        value: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const m of args.metrics) {
      await ctx.db.insert("metrics", m);
    }
    for (const m of args.campaignMetrics) {
      await ctx.db.insert("campaign_metrics", m);
    }
    for (const m of args.tsMetrics) {
      await ctx.db.insert("time_series_metrics", m);
    }
    return null;
  },
});

/**
 * Fetches a page of impressions for processing.
 */
export const fetchImpressionsPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({
    page: v.array(
      v.object({
        adId: v.id("ads"),
        isClick: v.boolean(),
        timestamp: v.number(),
        device: v.string(),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db.query("impressions").paginate({
      numItems: 5000,
      cursor: args.cursor,
    });
    return {
      page: result.page.map((i) => ({
        adId: i.adId,
        isClick: i.isClick,
        timestamp: i.timestamp,
        device: i.device,
      })),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

/**
 * convex/queries/analytics/summary.ts
 * High-level summary statistics.
 */
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { metricsKeys } from "../../lib/metrics";

/**
 * Returns global, brand, or customer stats from the metrics table.
 */
export const getGlobalStats = query({
  args: {
    customerId: v.optional(v.id("customers")),
    brandId: v.optional(v.id("brands")),
  },
  returns: v.object({
    totalImpressions: v.number(),
    uniqueAds: v.number(),
    avgCtr: v.number(),
  }),
  handler: async (ctx, args) => {
    let key = metricsKeys.global();
    if (args.brandId) {
      key = metricsKeys.brand(args.brandId);
    } else if (args.customerId) {
      key = metricsKeys.customer(args.customerId);
    }

    const stats = await ctx.db
      .query("metrics")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (!stats) {
      return { totalImpressions: 0, uniqueAds: 0, avgCtr: 0 };
    }

    return {
      totalImpressions: stats.totalImpressions,
      uniqueAds: stats.uniqueAds ?? 0,
      avgCtr:
        stats.totalImpressions > 0
          ? stats.totalClicks / stats.totalImpressions
          : 0,
    };
  },
});

/**
 * convex/queries/analytics/performance.ts
 * Performance breakdowns for brands and campaigns.
 */
import { v } from "convex/values";
import { query } from "../../_generated/server";
import {
  MOCK_SPEND_PER_IMPRESSION,
  MOCK_CONVERSION_VALUE,
} from "../../lib/constants";
import { metricsKeys } from "../../lib/metrics";

/**
 * Returns performance metrics for all brands, optionally filtered by customer.
 */
export const getBrandPerformance = query({
  args: {
    customerId: v.optional(v.id("customers")),
  },
  returns: v.array(
    v.object({
      brandId: v.id("brands"),
      name: v.string(),
      reach: v.number(),
      spend: v.number(),
      roi: v.number(),
      customerId: v.id("customers"),
      customerName: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const brands = args.customerId
      ? await ctx.db
          .query("brands")
          .withIndex("by_customer", (q) => q.eq("customerId", args.customerId!))
          .collect()
      : await ctx.db.query("brands").collect();

    const performance = [];

    for (const brand of brands) {
      const stats = await ctx.db
        .query("metrics")
        .withIndex("by_key", (q) => q.eq("key", metricsKeys.brand(brand._id)))
        .first();

      const customer = await ctx.db.get("customers", brand.customerId);

      const reach = stats?.totalImpressions ?? 0;
      const clicks = stats?.totalClicks ?? 0;

      const spend = reach * MOCK_SPEND_PER_IMPRESSION;
      const totalValue = clicks * MOCK_CONVERSION_VALUE;
      const roi = spend > 0 ? totalValue / spend : 0;

      performance.push({
        brandId: brand._id,
        name: brand.name,
        reach,
        spend,
        roi,
        customerId: brand.customerId,
        customerName: customer?.name ?? "Unknown",
      });
    }

    return performance;
  },
});

/**
 * Returns top performing campaigns (ads) by impressions.
 */
export const getTopCampaigns = query({
  args: {
    limit: v.optional(v.number()),
    brandId: v.optional(v.id("brands")),
  },
  returns: v.array(
    v.object({
      adId: v.id("ads"),
      adName: v.string(),
      brandName: v.string(),
      impressions: v.number(),
      clicks: v.number(),
      ctr: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    const topCampaigns = args.brandId
      ? await ctx.db
          .query("campaign_metrics")
          .withIndex("by_brand_impressions", (q) =>
            q.eq("brandId", args.brandId!),
          )
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("campaign_metrics")
          .withIndex("by_impressions")
          .order("desc")
          .take(limit);

    const results = [];
    for (const campaign of topCampaigns) {
      const ad = await ctx.db.get("ads", campaign.adId);
      const brand = await ctx.db.get("brands", campaign.brandId);

      if (!ad || !brand) continue;

      results.push({
        adId: campaign.adId,
        adName: ad.name,
        brandName: brand.name,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr:
          campaign.impressions > 0 ? campaign.clicks / campaign.impressions : 0,
      });
    }

    return results.sort((a, b) => {
      if (b.impressions !== a.impressions) return b.impressions - a.impressions;
      return a.adName.localeCompare(b.adName);
    });
  },
});

/**
 * Returns device distribution for a brand or globally.
 */
export const getDeviceDistribution = query({
  args: {
    brandId: v.optional(v.id("brands")),
  },
  returns: v.array(
    v.object({
      device: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const prefix = args.brandId
      ? `brand_device_stats:${args.brandId}:`
      : "device_stats:";

    const metrics = await ctx.db
      .query("metrics")
      .withIndex("by_key", (q) =>
        q.gte("key", prefix).lt("key", prefix + "\uffff"),
      )
      .collect();

    return metrics
      .map((m) => ({
        device: m.key.split(":").pop()!,
        count: m.totalImpressions,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.device.localeCompare(b.device);
      });
  },
});

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { updateMetrics, updateMetricsBatch } from "./lib/metrics";

export const trackEvent = mutation({
  args: {
    adId: v.id("ads"),
    isClick: v.boolean(),
    device: v.string(),
    region: v.string(),
    metadata: v.optional(v.any()), // For video/animation specific data
  },
  returns: v.object({ success: v.boolean(), timestamp: v.number() }),
  handler: async (ctx, args) => {
    const ad = await ctx.db.get("ads", args.adId);
    if (!ad) throw new Error("Ad not found");

    const timestamp = Date.now();

    // 1. Log raw impression for historical analysis (sampled or batching in production)
    await ctx.db.insert("impressions", {
      adId: args.adId,
      timestamp,
      device: args.device,
      region: args.region,
      isClick: args.isClick,
    });

    // 2. Update O(1) atomic counters
    await updateMetrics(ctx, ad.brandId, args.adId, args.isClick, args.device);

    return { success: true, timestamp };
  },
});

export const trackEventBatch = mutation({
  args: {
    events: v.array(
      v.object({
        adId: v.id("ads"),
        isClick: v.boolean(),
        device: v.string(),
        region: v.string(),
      }),
    ),
  },
  returns: v.object({ success: v.boolean(), count: v.number() }),
  handler: async (ctx, args) => {
    const adIds = new Set(args.events.map((e) => e.adId));
    const ads = await Promise.all(
      [...adIds].map((id) => ctx.db.get("ads", id as Id<"ads">)),
    );
    const adMap = new Map();
    const brandIds = new Set<string>();

    for (const ad of ads) {
      if (ad) {
        adMap.set(ad._id, ad);
        brandIds.add(ad.brandId);
      }
    }

    const brands = await Promise.all(
      [...brandIds].map((id) => ctx.db.get("brands", id as Id<"brands">)),
    );

    const brandMap = new Map();
    for (const b of brands) {
      if (b) brandMap.set(b._id, b);
    }

    const batchData = [];
    const timestamp = Date.now();

    for (const event of args.events) {
      const ad = adMap.get(event.adId);
      if (!ad) continue;
      const brand = brandMap.get(ad.brandId);
      if (!brand) continue;

      await ctx.db.insert("impressions", {
        adId: event.adId,
        timestamp,
        device: event.device,
        region: event.region,
        isClick: event.isClick,
      });

      batchData.push({
        brandId: ad.brandId,
        adId: event.adId,
        customerId: brand.customerId,
        isClick: event.isClick,
        device: event.device,
      });
    }

    await updateMetricsBatch(ctx, batchData);

    return { success: true, count: batchData.length };
  },
});

/**
 * convex/analytics.ts
 * Provides analytics mutations for ad performance tracking.
 * Coordinates metric updates during impression tracking.
 */

import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { updateMetrics } from "./lib/metrics";

export const trackImpression = mutation({
  args: {
    adId: v.id("ads"),
    device: v.string(),
    region: v.string(),
    isClick: v.boolean(),
  },
  returns: v.id("impressions"),
  handler: async (ctx, args) => {
    const ad = await ctx.db.get("ads", args.adId);
    if (!ad) {
      throw new Error(`Ad not found: ${args.adId}`);
    }

    await updateMetrics(ctx, ad.brandId, args.adId, args.isClick, args.device);

    return await ctx.db.insert("impressions", {
      adId: args.adId,
      device: args.device,
      region: args.region,
      isClick: args.isClick,
      timestamp: Date.now(),
    });
  },
});

export const incrementMetrics = internalMutation({
  args: {
    brandId: v.id("brands"),
    adId: v.id("ads"),
    isClick: v.boolean(),
  },
  handler: async (ctx, args) => {
    await updateMetrics(ctx, args.brandId, args.adId, args.isClick);
  },
});

// Re-export queries from modular files for backward compatibility if needed,
// though the new structure is preferred.
export * from "./queries/analytics";
export * from "./queries/listing";

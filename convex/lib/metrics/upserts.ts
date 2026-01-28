/**
 * Metrics Upserts
 * Atomic upsert operations for denormalized metric tables.
 */

import { MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Upserts a metric record by key, adding the given delta.
 */
export async function upsertMetric(
  ctx: MutationCtx,
  key: string,
  impressionsDelta: number,
  clicksDelta: number,
) {
  const existing = await ctx.db
    .query("metrics")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (existing) {
    await ctx.db.patch("metrics", existing._id, {
      totalImpressions: existing.totalImpressions + impressionsDelta,
      totalClicks: existing.totalClicks + clicksDelta,
    });
  } else {
    await ctx.db.insert("metrics", {
      key,
      totalImpressions: impressionsDelta,
      totalClicks: clicksDelta,
      uniqueAds: 0,
    });
  }
}

/**
 * Upserts a campaign metric record by ad ID, adding the given delta.
 */
export async function upsertCampaignMetric(
  ctx: MutationCtx,
  adId: Id<"ads">,
  brandId: Id<"brands">,
  impressionsDelta: number,
  clicksDelta: number,
) {
  const existing = await ctx.db
    .query("campaign_metrics")
    .withIndex("by_ad", (q) => q.eq("adId", adId))
    .first();

  if (existing) {
    await ctx.db.patch("campaign_metrics", existing._id, {
      impressions: existing.impressions + impressionsDelta,
      clicks: existing.clicks + clicksDelta,
    });
  } else {
    await ctx.db.insert("campaign_metrics", {
      adId,
      brandId,
      impressions: impressionsDelta,
      clicks: clicksDelta,
    });
  }
}

/**
 * Upserts a time series metric record by key and bucket, adding the given delta.
 */
export async function upsertTimeSeriesMetric(
  ctx: MutationCtx,
  key: string,
  bucket: number,
  delta: number,
) {
  const existing = await ctx.db
    .query("time_series_metrics")
    .withIndex("by_key_bucket", (q) => q.eq("key", key).eq("bucket", bucket))
    .first();

  if (existing) {
    await ctx.db.patch("time_series_metrics", existing._id, {
      value: existing.value + delta,
    });
  } else {
    await ctx.db.insert("time_series_metrics", {
      key,
      bucket,
      value: delta,
    });
  }
}

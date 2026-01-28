/**
 * convex/queries/analytics/trends.ts
 * Time-series and trend analytics.
 */
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { metricsKeys, BUCKET_SIZE_MS } from "../../lib/metrics";

/**
 * Returns a count of impressions in the last X seconds.
 */
export const getRecentImpressionsCount = query({
  args: {
    lastXSeconds: v.number(),
    brandId: v.optional(v.id("brands")),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const key = args.brandId
      ? metricsKeys.tsBrand(args.brandId)
      : metricsKeys.tsGlobal();
    const now = Date.now();
    const currentBucket = Math.floor(now / BUCKET_SIZE_MS) * BUCKET_SIZE_MS;
    const lookback =
      Math.ceil(args.lastXSeconds / (BUCKET_SIZE_MS / 1000)) * BUCKET_SIZE_MS;

    const sim = await ctx.db.query("simulation").first();
    const chartResetTime = sim?.chartResetTime ?? 0;
    const startBucket = Math.max(currentBucket - lookback, chartResetTime);

    const buckets = await ctx.db
      .query("time_series_metrics")
      .withIndex("by_key_bucket", (q) =>
        q.eq("key", key).gte("bucket", startBucket),
      )
      .collect();

    return buckets.reduce((acc, b) => acc + b.value, 0);
  },
});

/**
 * Returns time-series data for the "pulse" chart.
 */
export const getPulseSeries = query({
  args: {
    brandId: v.optional(v.id("brands")),
  },
  returns: v.object({
    series: v.array(v.object({ key: v.string(), label: v.string() })),
    data: v.array(v.record(v.string(), v.number())),
  }),
  handler: async (ctx, args) => {
    const primaryKey = args.brandId
      ? metricsKeys.tsBrand(args.brandId)
      : metricsKeys.tsGlobal();
    const now = Date.now();
    const numIntervals = 60; // 10 minutes (60 * 10s)
    const windowSize = numIntervals * BUCKET_SIZE_MS;
    const startBucket =
      Math.floor((now - windowSize) / BUCKET_SIZE_MS) * BUCKET_SIZE_MS;

    const topCampaigns = args.brandId
      ? await ctx.db
          .query("campaign_metrics")
          .withIndex("by_brand_impressions", (q) =>
            q.eq("brandId", args.brandId!),
          )
          .order("desc")
          .take(5)
      : await ctx.db
          .query("campaign_metrics")
          .withIndex("by_impressions")
          .order("desc")
          .take(5);

    const campaignKeys = topCampaigns.map((c) => ({
      key: metricsKeys.tsCampaign(c.adId),
      adId: c.adId,
    }));

    const allKeys = [primaryKey, ...campaignKeys.map((ck) => ck.key)];

    const ads = await Promise.all(
      campaignKeys.map((ck) => ctx.db.get("ads", ck.adId)),
    );

    const allBuckets = await Promise.all(
      allKeys.map((key) =>
        ctx.db
          .query("time_series_metrics")
          .withIndex("by_key_bucket", (q) =>
            q.eq("key", key).gte("bucket", startBucket),
          )
          .collect(),
      ),
    );

    const seriesLabels: Record<string, string> = {
      [primaryKey]: args.brandId ? "Brand Total" : "Global Total",
    };
    ads.forEach((ad, i) => {
      seriesLabels[campaignKeys[i].key] = ad?.name ?? "Unknown Ad";
    });

    const resultData: Record<string, number>[] = new Array(numIntervals + 1);
    const bucketLookups = allKeys.map((_, index) => {
      const lookup = new Map<number, number>();
      allBuckets[index].forEach((b) => lookup.set(b.bucket, b.value));
      return lookup;
    });

    for (let i = 0; i <= numIntervals; i++) {
      const time = startBucket + i * BUCKET_SIZE_MS;
      const row: Record<string, number> = { time };
      for (let k = 0; k < allKeys.length; k++) {
        row[allKeys[k]] = 0; // Initialize with 0 instead of undefined
      }
      resultData[i] = row;
    }

    for (let kIdx = 0; kIdx < allKeys.length; kIdx++) {
      const key = allKeys[kIdx];
      const lookup = bucketLookups[kIdx];
      let lastKnownIdx = -1;

      for (let i = 0; i <= numIntervals; i++) {
        const time = startBucket + i * BUCKET_SIZE_MS;
        const val = lookup.get(time);

        if (val !== undefined) {
          resultData[i][key] = val;
          if (lastKnownIdx !== -1 && i - lastKnownIdx > 1) {
            const startVal = resultData[lastKnownIdx][key];
            const endVal = val;
            const steps = i - lastKnownIdx;
            for (let j = 1; j < steps; j++) {
              resultData[lastKnownIdx + j][key] =
                startVal + (endVal - startVal) * (j / steps);
            }
          }
          lastKnownIdx = i;
        }
      }

      if (lastKnownIdx !== -1 && lastKnownIdx < numIntervals) {
        const lastVal = resultData[lastKnownIdx][key];
        for (let i = lastKnownIdx + 1; i <= numIntervals; i++) {
          resultData[i][key] = lastVal;
        }
      }
    }

    const sim = await ctx.db.query("simulation").first();
    const chartResetTime = sim?.chartResetTime ?? 0;

    const filteredData = resultData.map((row) => {
      if (row.time < chartResetTime) {
        const newRow = { ...row };
        allKeys.forEach((k) => (newRow[k] = 0));
        return newRow;
      }
      return row;
    });

    return {
      series: allKeys.map((k) => ({ key: k, label: seriesLabels[k] })),
      data: filteredData,
    };
  },
});

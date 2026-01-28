/**
 * convex/sync.ts
 * Administrative actions for synchronizing and cleaning up metrics.
 * Rebuilds denormalized counters from raw impression data.
 */
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { metricsKeys, getBucket } from "./lib/metrics";

/**
 * Rebuilds the entire metrics system by scanning all impressions.
 */
export const syncHistoricalMetrics = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Clear existing metrics
    await ctx.runMutation(internal.sync_internal.clearMetrics);

    // 2. Load lookups for mapping
    const ads = await ctx.runQuery(api.analytics.listAds);
    const adToBrandMap = new Map<Id<"ads">, Id<"brands">>();
    for (const ad of ads) {
      adToBrandMap.set(ad._id, ad.brandId);
    }

    const brands = await ctx.runQuery(api.analytics.listBrands);
    const brandToCustomerMap = new Map<Id<"brands">, Id<"customers">>();
    for (const brand of brands) {
      brandToCustomerMap.set(brand._id, brand.customerId);
    }

    // 3. Aggregate metrics in memory
    const metricsMap = new Map<
      string,
      { totalImpressions: number; totalClicks: number; ads: Set<Id<"ads">> }
    >();
    const campaignMetricsMap = new Map<
      Id<"ads">,
      { impressions: number; clicks: number; brandId: Id<"brands"> }
    >();
    const tsMetricsMap = new Map<string, number>();

    let cursor: string | null = null;
    let isDone = false;

    while (!isDone) {
      const result: {
        page: {
          adId: Id<"ads">;
          isClick: boolean;
          timestamp: number;
          device: string;
        }[];
        isDone: boolean;
        continueCursor: string;
      } = await ctx.runQuery(internal.sync_internal.fetchImpressionsPage, {
        cursor,
      });

      for (const imp of result.page) {
        const brandId = adToBrandMap.get(imp.adId);
        if (!brandId) continue;
        const customerId = brandToCustomerMap.get(brandId);

        const keys = [
          metricsKeys.global(),
          metricsKeys.brand(brandId),
          metricsKeys.device(imp.device),
          metricsKeys.brandDevice(brandId, imp.device),
        ];
        if (customerId) keys.push(metricsKeys.customer(customerId));

        for (const key of keys) {
          let stats = metricsMap.get(key);
          if (!stats) {
            stats = { totalImpressions: 0, totalClicks: 0, ads: new Set() };
            metricsMap.set(key, stats);
          }
          stats.totalImpressions++;
          if (imp.isClick) stats.totalClicks++;
          stats.ads.add(imp.adId);
        }

        // Campaign metrics
        let cStats = campaignMetricsMap.get(imp.adId);
        if (!cStats) {
          cStats = { impressions: 0, clicks: 0, brandId };
          campaignMetricsMap.set(imp.adId, cStats);
        }
        cStats.impressions++;
        if (imp.isClick) cStats.clicks++;

        // Time series
        const bucket = getBucket(imp.timestamp);
        const tsKeys = [
          `global:${bucket}`,
          `brand:${brandId}:${bucket}`,
          `campaign:${imp.adId}:${bucket}`,
        ];
        for (const tk of tsKeys) {
          tsMetricsMap.set(tk, (tsMetricsMap.get(tk) ?? 0) + 1);
        }
      }

      cursor = result.continueCursor;
      isDone = result.isDone;
    }

    // 4. Prepare data for insertion
    const metricsToInsert = Array.from(metricsMap.entries()).map(
      ([key, stats]) => ({
        key,
        totalImpressions: stats.totalImpressions,
        totalClicks: stats.totalClicks,
        uniqueAds: stats.ads.size,
      }),
    );

    const campaignMetricsToInsert = Array.from(
      campaignMetricsMap.entries(),
    ).map(([adId, stats]) => ({
      adId,
      brandId: stats.brandId,
      impressions: stats.impressions,
      clicks: stats.clicks,
    }));

    const tsMetricsToInsert = Array.from(tsMetricsMap.entries()).map(
      ([tk, value]) => {
        const parts = tk.split(":");
        if (parts[0] === "global") {
          return {
            key: metricsKeys.tsGlobal(),
            bucket: parseInt(parts[1]),
            value,
          };
        } else if (parts[0] === "brand") {
          return {
            key: metricsKeys.tsBrand(parts[1] as Id<"brands">),
            bucket: parseInt(parts[2]),
            value,
          };
        } else {
          return {
            key: metricsKeys.tsCampaign(parts[1] as Id<"ads">),
            bucket: parseInt(parts[2]),
            value,
          };
        }
      },
    );

    // 5. Insert in batches
    const BATCH_SIZE = 100;
    const maxLen = Math.max(
      metricsToInsert.length,
      campaignMetricsToInsert.length,
      tsMetricsToInsert.length,
    );

    for (let i = 0; i < maxLen; i += BATCH_SIZE) {
      await ctx.runMutation(internal.sync_internal.upsertMetricsBatch, {
        metrics: metricsToInsert.slice(i, i + BATCH_SIZE),
        campaignMetrics: campaignMetricsToInsert.slice(i, i + BATCH_SIZE),
        tsMetrics: tsMetricsToInsert.slice(i, i + BATCH_SIZE),
      });
    }

    return null;
  },
});

/**
 * Batch Event Update
 * Efficiently updates denormalized counters for multiple events.
 * Aggregates counts before upserting to minimize database operations.
 */

import { MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { metricsKeys, getBucket } from "./keys";
import {
  upsertMetric,
  upsertCampaignMetric,
  upsertTimeSeriesMetric,
} from "./upserts";

export async function updateMetricsBatch(
  ctx: MutationCtx,
  events: Array<{
    brandId: Id<"brands">;
    adId: Id<"ads">;
    customerId: Id<"customers">;
    isClick: boolean;
    device: string;
  }>,
) {
  const keyCounts = new Map<string, { impressions: number; clicks: number }>();
  const campaignCounts = new Map<
    string,
    {
      impressions: number;
      clicks: number;
      brandId: Id<"brands">;
      adId: Id<"ads">;
    }
  >();
  const tsCounts = new Map<string, number>();
  const bucket = getBucket(Date.now());

  for (const e of events) {
    const addKey = (key: string) => {
      const current = keyCounts.get(key) ?? { impressions: 0, clicks: 0 };
      current.impressions++;
      if (e.isClick) current.clicks++;
      keyCounts.set(key, current);
    };

    addKey(metricsKeys.global());
    addKey(metricsKeys.brand(e.brandId));
    addKey(metricsKeys.customer(e.customerId));
    addKey(metricsKeys.device(e.device));
    addKey(metricsKeys.brandDevice(e.brandId, e.device));

    const cKey = e.adId;
    const current = campaignCounts.get(cKey) ?? {
      impressions: 0,
      clicks: 0,
      brandId: e.brandId,
      adId: e.adId,
    };
    current.impressions++;
    if (e.isClick) current.clicks++;
    campaignCounts.set(cKey, current);

    const globalTsKey = metricsKeys.tsGlobal();
    const brandTsKey = metricsKeys.tsBrand(e.brandId);
    const campaignTsKey = metricsKeys.tsCampaign(e.adId);
    tsCounts.set(globalTsKey, (tsCounts.get(globalTsKey) ?? 0) + 1);
    tsCounts.set(brandTsKey, (tsCounts.get(brandTsKey) ?? 0) + 1);
    tsCounts.set(campaignTsKey, (tsCounts.get(campaignTsKey) ?? 0) + 1);
  }

  const metricsPromises = Array.from(keyCounts.entries()).map(
    async ([key, counts]) =>
      upsertMetric(ctx, key, counts.impressions, counts.clicks),
  );

  const campaignPromises = Array.from(campaignCounts.entries()).map(
    async ([_, counts]) =>
      upsertCampaignMetric(
        ctx,
        counts.adId,
        counts.brandId,
        counts.impressions,
        counts.clicks,
      ),
  );

  const tsPromises = Array.from(tsCounts.entries()).map(async ([key, count]) =>
    upsertTimeSeriesMetric(ctx, key, bucket, count),
  );

  await Promise.all([...metricsPromises, ...campaignPromises, ...tsPromises]);
}

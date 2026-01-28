/**
 * Single Event Update
 * Updates denormalized counters for a single impression or click event.
 */

import { MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { metricsKeys, getBucket } from "./keys";
import {
  upsertMetric,
  upsertCampaignMetric,
  upsertTimeSeriesMetric,
} from "./upserts";

export async function updateMetrics(
  ctx: MutationCtx,
  brandId: Id<"brands">,
  adId: Id<"ads">,
  isClick: boolean,
  device?: string,
) {
  const brand = await ctx.db.get("brands", brandId);
  if (!brand) return;

  await upsertMetric(ctx, metricsKeys.global(), 1, isClick ? 1 : 0);
  await upsertMetric(ctx, metricsKeys.brand(brandId), 1, isClick ? 1 : 0);
  await upsertMetric(
    ctx,
    metricsKeys.customer(brand.customerId),
    1,
    isClick ? 1 : 0,
  );

  if (device) {
    await upsertMetric(ctx, metricsKeys.device(device), 1, isClick ? 1 : 0);
    await upsertMetric(
      ctx,
      metricsKeys.brandDevice(brandId, device),
      1,
      isClick ? 1 : 0,
    );
  }

  await upsertCampaignMetric(ctx, adId, brandId, 1, isClick ? 1 : 0);

  const bucket = getBucket(Date.now());
  await upsertTimeSeriesMetric(ctx, metricsKeys.tsGlobal(), bucket, 1);
  await upsertTimeSeriesMetric(ctx, metricsKeys.tsBrand(brandId), bucket, 1);
  await upsertTimeSeriesMetric(ctx, metricsKeys.tsCampaign(adId), bucket, 1);
}

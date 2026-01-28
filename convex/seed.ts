/**
 * Handles database seeding with mock data for development.
 * Generates customers, brands, ads, and a large volume of impressions.
 */
import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  SEED_TOTAL_IMPRESSIONS,
  SEED_BATCH_SIZE,
  CTR_BENCHMARKS,
} from "./lib/constants";

const CUSTOMERS = ["Shutterstock", "Three", "IKEA", "SEGA", "Storytel"];

const AD_TYPES = ["static", "video", "gif", "animation"] as const;
const DEVICES = ["desktop", "mobile", "tablet"];
const REGIONS = [
  "North America",
  "Europe",
  "Asia",
  "South America",
  "Africa",
  "Oceania",
];

export const createBaseData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const adIds: { id: Id<"ads">; type: (typeof AD_TYPES)[number] }[] = [];

    for (const customerName of CUSTOMERS) {
      const customerId = await ctx.db.insert("customers", {
        name: customerName,
        slug: customerName.toLowerCase().replace(/\s+/g, "-"),
      });

      const numBrands = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numBrands; i++) {
        const brandName = `${customerName} Brand ${i + 1}`;
        const brandId = await ctx.db.insert("brands", {
          customerId,
          name: brandName,
          slug: brandName.toLowerCase().replace(/\s+/g, "-"),
        });

        const numAds = Math.floor(Math.random() * 5) + 10;
        for (let j = 0; j < numAds; j++) {
          const type = AD_TYPES[Math.floor(Math.random() * AD_TYPES.length)];
          const adId = await ctx.db.insert("ads", {
            brandId,
            name: `${brandName} Ad ${j + 1}`,
            type,
            dimensions: "1080x1080",
          });
          adIds.push({ id: adId, type });
        }
      }
    }
    return adIds;
  },
});

export const insertImpressionsBatch = internalMutation({
  args: {
    impressions: v.array(
      v.object({
        adId: v.id("ads"),
        timestamp: v.number(),
        device: v.string(),
        region: v.string(),
        isClick: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const imp of args.impressions) {
      await ctx.db.insert("impressions", imp);
    }
  },
});

export const runSeeding = internalAction({
  args: {},
  handler: async (ctx) => {
    const existingAds = await ctx.runQuery(api.analytics.listAds);
    if (existingAds.length > 0) return;

    const ads = await ctx.runMutation(internal.seed.createBaseData);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < SEED_TOTAL_IMPRESSIONS; i += SEED_BATCH_SIZE) {
      const batch = [];
      for (
        let j = 0;
        j < SEED_BATCH_SIZE && i + j < SEED_TOTAL_IMPRESSIONS;
        j++
      ) {
        const ad = ads[Math.floor(Math.random() * ads.length)];
        const timestamp = now - Math.floor(Math.random() * oneDayMs);
        const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
        const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

        const clickProb =
          ad.type === "video" || ad.type === "animation"
            ? CTR_BENCHMARKS.VIDEO
            : ad.type === "static"
              ? CTR_BENCHMARKS.STATIC
              : CTR_BENCHMARKS.DEFAULT;
        const isClick = Math.random() < clickProb;

        batch.push({ adId: ad.id, timestamp, device, region, isClick });
      }
      await ctx.runMutation(internal.seed.insertImpressionsBatch, {
        impressions: batch,
      });
    }
  },
});

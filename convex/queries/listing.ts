/**
 * convex/queries/listing.ts
 * Provides listing queries for core entities like customers, brands, and ads.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

export const listAds = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("ads"),
      brandId: v.id("brands"),
      name: v.string(),
      type: v.string(),
      dimensions: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const ads = await ctx.db.query("ads").collect();
    return ads.map((ad) => ({
      _id: ad._id,
      brandId: ad.brandId,
      name: ad.name,
      type: ad.type,
      dimensions: ad.dimensions,
    }));
  },
});

export const listCustomers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("customers"),
      name: v.string(),
      slug: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    return customers.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
    }));
  },
});

export const listBrands = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("brands"),
      name: v.string(),
      slug: v.string(),
      customerId: v.id("customers"),
    }),
  ),
  handler: async (ctx) => {
    const brands = await ctx.db.query("brands").collect();
    return brands.map((b) => ({
      _id: b._id,
      name: b.name,
      slug: b.slug,
      customerId: b.customerId,
    }));
  },
});

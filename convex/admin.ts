import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCustomer = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  returns: v.id("customers"),
  handler: async (ctx, args) => {
    const customerId = await ctx.db.insert("customers", {
      name: args.name,
      slug: args.slug.toLowerCase().replace(/\s+/g, "-"),
    });
    return customerId;
  },
});

export const createBrand = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.string(),
    slug: v.string(),
  },
  returns: v.id("brands"),
  handler: async (ctx, args) => {
    const brandId = await ctx.db.insert("brands", {
      customerId: args.customerId,
      name: args.name,
      slug: args.slug.toLowerCase().replace(/\s+/g, "-"),
    });
    return brandId;
  },
});

export const getSimulationState = query({
  args: {},
  returns: v.object({
    status: v.union(v.literal("running"), v.literal("stopped")),
    intensity: v.number(),
    lastUpdated: v.number(),
    chartResetTime: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const sim = await ctx.db.query("simulation").first();
    if (!sim) {
      return { status: "stopped" as const, intensity: 5, lastUpdated: 0 };
    }
    return {
      status: sim.status,
      intensity: sim.intensity,
      lastUpdated: sim.lastUpdated,
      chartResetTime: sim.chartResetTime,
    };
  },
});

export const resetUICharts = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const sim = await ctx.db.query("simulation").first();
    const now = Date.now();
    if (sim) {
      await ctx.db.patch("simulation", sim._id, { chartResetTime: now });
    } else {
      await ctx.db.insert("simulation", {
        status: "stopped",
        intensity: 5,
        lastUpdated: now,
        chartResetTime: now,
      });
    }
  },
});

export const startSimulation = mutation({
  args: { intensity: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const sim = await ctx.db.query("simulation").first();
    const update = {
      status: "running" as const,
      intensity: args.intensity ?? (sim?.intensity || 5),
      lastUpdated: Date.now(),
    };

    if (sim) {
      await ctx.db.patch("simulation", sim._id, update);
    } else {
      await ctx.db.insert("simulation", update);
    }
  },
});

export const stopSimulation = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const sim = await ctx.db.query("simulation").first();
    if (sim) {
      await ctx.db.patch("simulation", sim._id, {
        status: "stopped",
        lastUpdated: Date.now(),
      });
    }
  },
});

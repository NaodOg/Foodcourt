import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { houseId: v.id("houses") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("houseId"), args.houseId))
      .first();
    return settings ?? null;
  },
});

export const updateSettings = mutation({
  args: {
    houseId: v.id("houses"),
    tabs: v.array(v.string()),
    taxRate: v.number(),
    theme: v.object({
      brandRed: v.string(),
      creamy: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("houseId"), args.houseId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        tabs: args.tabs,
        taxRate: args.taxRate,
        theme: args.theme,
      });
      return existing._id;
    }
    return await ctx.db.insert("settings", {
      houseId: args.houseId,
      tabs: args.tabs,
      taxRate: args.taxRate,
      theme: args.theme,
    });
  },
});

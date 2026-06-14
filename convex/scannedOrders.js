import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveOrder = mutation({
  args: {
    houseId: v.id("houses"),
    orderData: v.object({
      items: v.array(v.object({
        quantity: v.number(),
        name: v.string(),
      })),
      subtotal: v.string(),
      tax: v.string(),
      total: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scannedOrders", {
      houseId: args.houseId,
      orderData: args.orderData,
      discarded: false,
    });
  },
});

export const getTodayOrders = query({
  args: { houseId: v.optional(v.id("houses")) },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMs = startOfDay.getTime();
    const endMs = startMs + 24 * 60 * 60 * 1000;

    let orders;
    if (args.houseId) {
      orders = await ctx.db
        .query("scannedOrders")
        .filter((q) => q.eq(q.field("houseId"), args.houseId))
        .filter((q) => q.neq(q.field("discarded"), true))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db
        .query("scannedOrders")
        .filter((q) => q.neq(q.field("discarded"), true))
        .order("desc")
        .collect();
    }

    return orders.filter((o) => {
      const t = o._creationTime;
      return t >= startMs && t < endMs;
    });
  },
});

export const discardOrder = mutation({
  args: { id: v.id("scannedOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { discarded: true });
  },
});

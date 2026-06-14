import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const verifyPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    const correctPin = process.env.ADMIN_PIN || "12345";
    return args.pin === correctPin;
  },
});

export const getCategories = query({
  args: { houseId: v.id("houses"), tab: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const categories = args.tab
      ? await ctx.db
          .query("menuCategories")
          .filter((q) => q.eq(q.field("houseId"), args.houseId))
          .filter((q) => q.eq(q.field("tab"), args.tab))
          .collect()
      : await ctx.db
          .query("menuCategories")
          .filter((q) => q.eq(q.field("houseId"), args.houseId))
          .collect();

    return await Promise.all(
      categories.map(async (category) => {
        const items = await ctx.db
          .query("menuItems")
          .filter((q) => q.eq(q.field("houseId"), args.houseId))
          .filter((q) => q.eq(q.field("categoryId"), category.id))
          .collect();
        return { ...category, itemCount: items.length };
      })
    );
  },
});

export const getAllCategories = query({
  args: { houseId: v.id("houses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuCategories")
      .filter((q) => q.eq(q.field("houseId"), args.houseId))
      .collect();
  },
});

export const getItemsForCategory = query({
  args: { houseId: v.id("houses"), categoryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("houseId"), args.houseId))
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();
  },
});

export const getAllItems = query({
  args: { houseId: v.id("houses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("houseId"), args.houseId))
      .collect();
  },
});

export const addMenuItem = mutation({
  args: {
    houseId: v.id("houses"),
    categoryId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.string(),
    imgSrc: v.string(),
    imgAlt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      houseId: args.houseId,
      categoryId: args.categoryId,
      title: args.title,
      description: args.description,
      price: args.price,
      imgSrc: args.imgSrc,
      imgAlt: args.imgAlt,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    houseId: v.id("houses"),
    categoryId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.string(),
    imgSrc: v.string(),
    imgAlt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      houseId: args.houseId,
      categoryId: args.categoryId,
      title: args.title,
      description: args.description,
      price: args.price,
      imgSrc: args.imgSrc,
      imgAlt: args.imgAlt,
    });
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const addCategory = mutation({
  args: {
    houseId: v.id("houses"),
    tab: v.string(),
    id: v.string(),
    title: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuCategories", {
      houseId: args.houseId,
      tab: args.tab,
      id: args.id,
      title: args.title,
      image: args.image,
    });
  },
});

export const updateCategory = mutation({
  args: {
    _id: v.id("menuCategories"),
    houseId: v.id("houses"),
    tab: v.string(),
    id: v.string(),
    title: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      houseId: args.houseId,
      tab: args.tab,
      id: args.id,
      title: args.title,
      image: args.image,
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("menuCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

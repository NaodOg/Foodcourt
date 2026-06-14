import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllHouses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("houses").collect();
  },
});

export const getActiveHouses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("houses")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getHouse = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("houses")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
  },
});

export const addHouse = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logo: v.string(),
    description: v.string(),
    accentColor: v.string(),
    bgColor: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("houses", {
      name: args.name,
      slug: args.slug,
      logo: args.logo,
      description: args.description,
      accentColor: args.accentColor,
      bgColor: args.bgColor,
      isActive: args.isActive,
    });
  },
});

export const updateHouse = mutation({
  args: {
    _id: v.id("houses"),
    name: v.string(),
    slug: v.string(),
    logo: v.string(),
    description: v.string(),
    accentColor: v.string(),
    bgColor: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      name: args.name,
      slug: args.slug,
      logo: args.logo,
      description: args.description,
      accentColor: args.accentColor,
      bgColor: args.bgColor,
      isActive: args.isActive,
    });
  },
});

export const seedHouses = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("houses").first();
    if (existing) {
      return "Data already exists!";
    }

    const duId = await ctx.db.insert("houses", {
      name: "Du Pizza and Burger",
      slug: "du-pizza-burger",
      logo: "/logos/du.jpg",
      description: "Wood-fired pizzas, juicy burgers and hearty sandwiches made with premium ingredients.",
      accentColor: "#b7102a",
      bgColor: "#f3faff",
      isActive: true,
    });

    const tibebId = await ctx.db.insert("houses", {
      name: "Tibeb Shawarma and Salads",
      slug: "tibeb-shawarma-salads",
      logo: "/logos/tibeb.jpg",
      description: "Fresh Mediterranean shawarma, crisp salads, and vibrant citrus-infused flavors.",
      accentColor: "#00685d",
      bgColor: "#f3faff",
      isActive: true,
    });

    const dikusId = await ctx.db.insert("houses", {
      name: "Dikus Traditional Food",
      slug: "dikus-traditional-food",
      logo: "/logos/dikus.jpg",
      description: "Authentic Ethiopian cuisine with rich stews, sourdough injera, and centuries-old spice blends.",
      accentColor: "#8e4e14",
      bgColor: "#f3faff",
      isActive: true,
    });

    // Seed settings for each house
    await ctx.db.insert("settings", {
      houseId: duId,
      tabs: ["Starters", "Main", "Drinks"],
      taxRate: 15,
      theme: { brandRed: "#b7102a", creamy: "#f3faff" },
    });

    await ctx.db.insert("settings", {
      houseId: tibebId,
      tabs: ["Starters", "Main", "Drinks", "Salads"],
      taxRate: 15,
      theme: { brandRed: "#00685d", creamy: "#f3faff" },
    });

    await ctx.db.insert("settings", {
      houseId: dikusId,
      tabs: ["Main", "Drinks", "Family Feast"],
      taxRate: 15,
      theme: { brandRed: "#8e4e14", creamy: "#f3faff" },
    });

    // --- Du Pizza and Burger menu ---
    const duStartersId = "du-starters";
    const duBurgersId = "du-burgers";
    const duPastaId = "du-pasta";

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Starters", id: duStartersId, title: "Starters", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duStartersId, title: "MOZZARELLA STICKS", description: "Crispy golden mozzarella sticks served with marinara sauce.", price: "350 ETB", imgSrc: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop", imgAlt: "Mozzarella Sticks",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duStartersId, title: "CHICKEN WINGS", description: "Spicy buffalo wings with blue cheese dip and celery sticks.", price: "400 ETB", imgSrc: "https://images.unsplash.com/photo-1608039829572-9b18d1a38a87?q=80&w=400&auto=format&fit=crop", imgAlt: "Chicken Wings",
    });

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Main", id: duBurgersId, title: "Sandwiches & Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "CLASSIC BEEF BURGER", description: "Juicy beef patty, cheddar, lettuce, tomato on a brioche bun.", price: "500 ETB", imgSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop", imgAlt: "Classic Burger",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "BBQ CHICKEN BURGER", description: "Grilled chicken breast with smoky BBQ sauce and onion rings.", price: "480 ETB", imgSrc: "https://images.unsplash.com/photo-1565299507177-bcac6e40fb34?q=80&w=400&auto=format&fit=crop", imgAlt: "BBQ Chicken Burger",
    });

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Main", id: duPastaId, title: "Pasta", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "SPAGHETTI CARBONARA", description: "Classic Italian pasta with egg, parmesan, and crispy bacon.", price: "600 ETB", imgSrc: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop", imgAlt: "Carbonara",
    });

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Drinks", id: "du-drinks", title: "Beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-drinks", title: "SOFT DRINKS", description: "Choice of Coke, Sprite, Fanta or fresh lemonade.", price: "80 ETB", imgSrc: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop", imgAlt: "Soft Drinks",
    });

    // --- Tibeb Shawarma and Salads menu ---
    const tibebStartersId = "tibeb-starters";
    const tibebMainsId = "tibeb-mains";
    const tibebSaladsId = "tibeb-salads";

    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Starters", id: tibebStartersId, title: "Starters", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebStartersId, title: "FALAFEL PLATE", description: "Crispy chickpea falafel with tahini sauce and pickled turnips.", price: "300 ETB", imgSrc: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=400&auto=format&fit=crop", imgAlt: "Falafel Plate",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebStartersId, title: "HUMMUS & PITA", description: "Smooth chickpea hummus drizzled with olive oil, served warm pita.", price: "250 ETB", imgSrc: "https://images.unsplash.com/photo-1577805947697-89e18249d767?q=80&w=400&auto=format&fit=crop", imgAlt: "Hummus and Pita",
    });

    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Main", id: tibebMainsId, title: "Shawarma & Wraps", image: "https://images.unsplash.com/photo-1561651823-34f739022ba1?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebMainsId, title: "CHICKEN SHAWARMA", description: "Marinated chicken shawarma with garlic sauce and pickles in fresh pita.", price: "400 ETB", imgSrc: "https://images.unsplash.com/photo-1561651823-34f739022ba1?q=80&w=400&auto=format&fit=crop", imgAlt: "Chicken Shawarma",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebMainsId, title: "BEEF SHAWARMA PLATE", description: "Tender beef shawarma served with rice, salad and garlic sauce.", price: "550 ETB", imgSrc: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop", imgAlt: "Beef Shawarma Plate",
    });

    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Salads", id: tibebSaladsId, title: "Fresh Salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebSaladsId, title: "FATTOUSH SALAD", description: "Crisp lettuce, tomatoes, radish, and toasted pita with sumac dressing.", price: "300 ETB", imgSrc: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop", imgAlt: "Fattoush Salad",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebSaladsId, title: "TABBOULEH", description: "Fresh parsley, bulgur, tomato and mint with lemon olive oil dressing.", price: "280 ETB", imgSrc: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=400&auto=format&fit=crop", imgAlt: "Tabbouleh",
    });

    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Drinks", id: "tibeb-drinks", title: "Beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-drinks", title: "MINT LEMONADE", description: "Fresh squeezed lemonade with crushed mint and a hint of honey.", price: "120 ETB", imgSrc: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop", imgAlt: "Mint Lemonade",
    });

    // --- Dikus Traditional Food menu ---
    const dikusMainsId = "dikus-mains";
    const dikusDrinksId = "dikus-drinks";
    const dikusFeastId = "dikus-feast";

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Main", id: dikusMainsId, title: "Traditional Wats", image: "https://images.unsplash.com/photo-1586999768265-24af89630739?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusMainsId, title: "DORO WAT", description: "Slow-simmered chicken stew with berbere spices and a hard-boiled egg, served on injera.", price: "550 ETB", imgSrc: "https://images.unsplash.com/photo-1586999768265-24af89630739?q=80&w=400&auto=format&fit=crop", imgAlt: "Doro Wat",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusMainsId, title: "MISIR WAT", description: "Red lentil stew simmered with berbere spice blend, served with fresh injera.", price: "350 ETB", imgSrc: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop", imgAlt: "Misir Wat",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusMainsId, title: "TIBS", description: "Sautéed beef cubes with onions, peppers, and rosemary in seasoned butter.", price: "600 ETB", imgSrc: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=400&auto=format&fit=crop", imgAlt: "Tibs",
    });

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Family Feast", id: dikusFeastId, title: "Family Platters", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusFeastId, title: "BEYAYNETU PLATTER", description: "Vegan sampler of red lentils, yellow peas, collard greens, and cabbage stew on injera.", price: "850 ETB", imgSrc: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400&auto=format&fit=crop", imgAlt: "Beyaynetu Platter",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusFeastId, title: "SPECIAL MESSOB", description: "Assorted meat and vegan wats on a large injera platter. Serves 4.", price: "1,500 ETB", imgSrc: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop", imgAlt: "Special Messob",
    });

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Drinks", id: dikusDrinksId, title: "Traditional Drinks", image: "https://images.unsplash.com/photo-1514517521153-1be72277b20b?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusDrinksId, title: "TEJ (HONEY WINE)", description: "Traditional Ethiopian fermented honey mead served cold.", price: "250 ETB", imgSrc: "https://images.unsplash.com/photo-1514517521153-1be72277b20b?q=80&w=400&auto=format&fit=crop", imgAlt: "Tej Honey Wine",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: dikusDrinksId, title: "ETHIOPIAN COFFEE", description: "Traditional coffee ceremony with hand-roasted beans and popcorn.", price: "200 ETB", imgSrc: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop", imgAlt: "Ethiopian Coffee",
    });

    return "Flint Food Court successfully seeded!";
  },
});

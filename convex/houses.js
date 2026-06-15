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
    // Clear all existing data
    for (const table of ["houses", "menuCategories", "menuItems", "settings", "scannedOrders"]) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
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
      tabs: ["Main", "Drinks"],
      taxRate: 15,
      theme: { brandRed: "#b7102a", creamy: "#faf3ea" },
    });
 
    await ctx.db.insert("settings", {
      houseId: tibebId,
      tabs: ["Main", "Salads", "Drinks"],
      taxRate: 15,
      theme: { brandRed: "#00685d", creamy: "#f3faff" },
    });

    await ctx.db.insert("settings", {
      houseId: dikusId,
      tabs: ["Fasting", "Non Fasting", "Drinks"],
      taxRate: 15,
      theme: { brandRed: "#8e4e14", creamy: "#f3faff" },
    });

    // --- Du Pizza and Burger menu ---
    const duBurgersId = "du-burgers";
    const duPastaId = "du-pasta";

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Main", id: duBurgersId,       title: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "CLASSIC BEEF BURGER", description: "Juicy beef patty, cheddar, lettuce, tomato on a brioche bun.", price: "500 ETB", imgSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop", imgAlt: "Classic Burger",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "BBQ CHICKEN BURGER", description: "Grilled chicken breast with smoky BBQ sauce and onion rings.", price: "480 ETB", imgSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop", imgAlt: "BBQ Chicken Burger",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "DOUBLE CHEESE\nBURGER", description: "Two juicy beef patties with double cheddar, pickles, and secret sauce.", price: "650 ETB", imgSrc: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=400&auto=format&fit=crop", imgAlt: "Double Cheeseburger",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "MUSHROOM SWISS BURGER", description: "Beef patty topped with sautéed mushrooms, Swiss cheese, and garlic aioli.", price: "580 ETB", imgSrc: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop", imgAlt: "Mushroom Swiss Burger",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duBurgersId, title: "SPICY JALAPEÑO BURGER", description: "Beef patty with pepper jack cheese, jalapeños, and chipotle mayo.", price: "560 ETB", imgSrc: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=400&auto=format&fit=crop", imgAlt: "Spicy Jalapeno Burger",
    });

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Main", id: duPastaId,       title: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "MARGHERITA PIZZA", description: "Classic Neapolitan pizza with fresh mozzarella, tomato sauce, and fragrant basil.", price: "550 ETB", imgSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop", imgAlt: "Margherita Pizza",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "PEPPERONI PIZZA", description: "Classic pepperoni with melted mozzarella and signature tomato sauce.", price: "600 ETB", imgSrc: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop", imgAlt: "Pepperoni Pizza",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "BBQ CHICKEN PIZZA", description: "Grilled chicken, red onions, and smoky BBQ sauce on a crispy crust.", price: "650 ETB", imgSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop", imgAlt: "BBQ Chicken Pizza",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "FOUR CHEESE PIZZA", description: "Blend of mozzarella, gorgonzola, parmesan, and ricotta on a thin crust.", price: "700 ETB", imgSrc: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop", imgAlt: "Four Cheese Pizza",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: duPastaId, title: "HAWAIIAN PIZZA", description: "Ham and pineapple with mozzarella on a classic hand-tossed crust.", price: "580 ETB", imgSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop", imgAlt: "Hawaiian Pizza",
    });

    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Drinks", id: "du-drinks",       title: "Soft Drinks", image: "/soft-drinks.jpg",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-drinks", title: "COCA COLA", description: "Classic refreshing cola, served cold.", price: "60 ETB", imgSrc: "/coke.jpg", imgAlt: "Coca Cola",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-drinks", title: "SPRITE", description: "Crisp lemon-lime soda.", price: "60 ETB", imgSrc: "/sprite.jpg", imgAlt: "Sprite",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-drinks", title: "FANTA", description: "Fruity orange soda.", price: "60 ETB", imgSrc: "/fanta.jpg", imgAlt: "Fanta",
    });
    await ctx.db.insert("menuCategories", {
      houseId: duId, tab: "Drinks", id: "du-water", title: "Water", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-water", title: "WATER 500ML", description: "Natural spring still water, 500ml.", price: "50 ETB", imgSrc: "/water-500.jpg", imgAlt: "Water 500ml",
    });
    await ctx.db.insert("menuItems", {
      houseId: duId, categoryId: "du-water", title: "SPARKLING WATER", description: "Carbonated mineral water, 500ml.", price: "60 ETB", imgSrc: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop", imgAlt: "Sparkling Water",
    });

    // --- Tibeb Shawarma and Salads menu ---
    const tibebMainsId = "tibeb-mains";
    const tibebSaladsId = "tibeb-salads";

    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Main", id: tibebMainsId, title: "Shawarma & Wraps", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: tibebMainsId, title: "CHICKEN SHAWARMA", description: "Marinated chicken shawarma with garlic sauce and pickles in fresh pita.", price: "400 ETB", imgSrc: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop", imgAlt: "Chicken Shawarma",
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
      houseId: tibebId, tab: "Drinks", id: "tibeb-drinks", title: "Mojito", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-drinks", title: "MINT LEMONADE", description: "Fresh squeezed lemonade with crushed mint and a hint of honey.", price: "120 ETB", imgSrc: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop", imgAlt: "Mint Lemonade",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-drinks", title: "CLASSIC MOJITO", description: "Fresh mint, lime, sugar, and soda water over crushed ice.", price: "150 ETB", imgSrc: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&auto=format&fit=crop", imgAlt: "Classic Mojito",
    });
    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Drinks", id: "tibeb-softdrinks", title: "Soft Drinks", image: "/soft-drinks.jpg",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-softdrinks", title: "COCA COLA", description: "Ice-cold Coca Cola, 330ml can.", price: "60 ETB", imgSrc: "/coke.jpg", imgAlt: "Coca Cola",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-softdrinks", title: "SPRITE", description: "Ice-cold Sprite, 330ml can.", price: "60 ETB", imgSrc: "/sprite.jpg", imgAlt: "Sprite",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-softdrinks", title: "FANTA", description: "Ice-cold Fanta orange, 330ml can.", price: "60 ETB", imgSrc: "/fanta.jpg", imgAlt: "Fanta",
    });
    await ctx.db.insert("menuCategories", {
      houseId: tibebId, tab: "Drinks", id: "tibeb-water", title: "Water", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-water", title: "WATER 500ML", description: "Natural spring still water, 500ml.", price: "50 ETB", imgSrc: "/water-500.jpg", imgAlt: "Water 500ml",
    });
    await ctx.db.insert("menuItems", {
      houseId: tibebId, categoryId: "tibeb-water", title: "SPARKLING WATER", description: "Carbonated mineral water, 500ml.", price: "60 ETB", imgSrc: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop", imgAlt: "Sparkling Water",
    });

    // --- Dikus Traditional Food menu ---

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Non Fasting", id: "dikus-nonfasting", title: "Meat Dishes", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-nonfasting", title: "TIBS", description: "Sautéed beef or lamb with onions, jalapeños, rosemary, and berbere spice.", price: "480 ETB", imgSrc: "/awaze-tibs.jpg", imgAlt: "Tibs",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-nonfasting", title: "TIBS FIRFIR", description: "Tibs mixed with shredded injera and spiced butter.", price: "450 ETB", imgSrc: "/tibs-firfir.jpg", imgAlt: "Tibs Firfir",
    });
    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Fasting", id: "dikus-ethiopian", title: "Ethiopian Food", image: "https://images.unsplash.com/photo-1586999768265-24af89630739?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-ethiopian", title: "MISIR WAT", description: "Red lentil stew simmered with berbere spice blend, served with fresh injera.", price: "350 ETB", imgSrc: "/misir-wat.jpg", imgAlt: "Misir Wat",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-ethiopian", title: "BEYAYNETU PLATTER", description: "Vegan sampler of red lentils, yellow peas, collard greens, and cabbage stew on injera.", price: "850 ETB", imgSrc: "/beyaynetu.jpg", imgAlt: "Beyaynetu Platter",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-ethiopian", title: "FIRFIR", description: "Shredded injera sautéed with berbere spice, served with yogurt and fresh cheese.", price: "380 ETB", imgSrc: "/firfir.jpg", imgAlt: "Firfir",
    });

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Fasting", id: "dikus-pasta", title: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-pasta", title: "PASTA ARRABBIATA", description: "Penne pasta in a spicy tomato sauce with garlic and chili.", price: "450 ETB", imgSrc: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop", imgAlt: "Pasta Arrabbiata",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-pasta", title: "PASTA AL POMODORO", description: "Spaghetti with fresh tomato basil sauce.", price: "400 ETB", imgSrc: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop", imgAlt: "Pasta al Pomodoro",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-pasta", title: "FETTUCCINE ALFREDO", description: "Creamy fettuccine with parmesan and garlic.", price: "500 ETB", imgSrc: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=400&auto=format&fit=crop", imgAlt: "Fettuccine Alfredo",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-pasta", title: "VEGGIE PASTA", description: "Mixed seasonal vegetables tossed in a light garlic olive oil sauce with penne.", price: "420 ETB", imgSrc: "/veggie-pasta.jpg", imgAlt: "Veggie Pasta",
    });

    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Drinks", id: "dikus-softdrinks", title: "Soft Drinks", image: "/soft-drinks.jpg",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-softdrinks", title: "COCA COLA", description: "Ice-cold Coca Cola, 330ml can.", price: "60 ETB", imgSrc: "/coke.jpg", imgAlt: "Coca Cola",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-softdrinks", title: "SPRITE", description: "Ice-cold Sprite, 330ml can.", price: "60 ETB", imgSrc: "/sprite.jpg", imgAlt: "Sprite",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-softdrinks", title: "FANTA", description: "Ice-cold Fanta orange, 330ml can.", price: "60 ETB", imgSrc: "/fanta.jpg", imgAlt: "Fanta",
    });
    await ctx.db.insert("menuCategories", {
      houseId: dikusId, tab: "Drinks", id: "dikus-water", title: "Water", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-water", title: "WATER 500ML", description: "Natural spring still water, 500ml.", price: "50 ETB", imgSrc: "/water-500.jpg", imgAlt: "Water 500ml",
    });
    await ctx.db.insert("menuItems", {
      houseId: dikusId, categoryId: "dikus-water", title: "SPARKLING WATER", description: "Carbonated mineral water, 500ml.", price: "60 ETB", imgSrc: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop", imgAlt: "Sparkling Water",
    });

    return "Flint Food Court successfully seeded!";
  },
});

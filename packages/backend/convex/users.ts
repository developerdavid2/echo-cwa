import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    return users;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const orgId = identity?.orgId as string;

    if (!orgId) {
      throw new Error("Missing organization");
    }
    await ctx.db.insert("users", {
      name: args.name,
    });

    throw new Error("Tracking test");
  },
});

// export const add = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const userId = await ctx.db.insert("users", {
//       name: "Jacobs",
//     });
//   },
// });

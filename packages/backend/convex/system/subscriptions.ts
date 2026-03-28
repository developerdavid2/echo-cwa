import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const upsert = internalMutation({
  args: {
    organizationId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    if (existingSubscription) {
      // Update existing
      await ctx.db.patch(existingSubscription._id, {
        status: args.status,
      });

      return;
    }

    try {
      await ctx.db.insert("subscriptions", {
        organizationId: args.organizationId,
        status: args.status,
      });
    } catch (error) {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .unique();

      if (subscription) {
        await ctx.db.patch(subscription._id, {
          status: args.status,
        });
      } else {
        throw error;
      }
    }
  },
});

export const getByOrganizationId = internalQuery({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    return existingSubscription;
  },
});

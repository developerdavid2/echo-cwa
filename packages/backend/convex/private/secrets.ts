import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireAuth } from "../lib/auth";

export const upsert = mutation({
  args: {
    service: v.union(v.literal("vapi")),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireAuth(ctx);

    //TODO: Check for subscription
    await ctx.scheduler.runAfter(0, internal.system.secrets.upsert, {
      service: args.service,
      organizationId: orgId,
      value: args.value,
    });
  },
});

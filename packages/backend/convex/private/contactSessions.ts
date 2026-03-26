import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { requireAuth } from "../lib/auth";

export const getOneByConversationId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireAuth(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalaid organization id",
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid organization Id",
      });
    }

    const contactSession = await ctx.db.get(conversation.contactSessionId);

    return contactSession;
  },
});

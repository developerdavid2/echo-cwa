// packages/backend/convex/private/typingStatus.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { requireAuth } from "../lib/auth";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireAuth(ctx);

    // Verify conversation exists and belongs to organization
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      });
    }

    // Find existing typing status
    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_and_type", (q) =>
        q.eq("conversationId", args.conversationId).eq("userType", "operator"),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("typingStatus", {
        conversationId: args.conversationId,
        userType: "operator",
        isTyping: args.isTyping,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getTypingStatus = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireAuth(ctx);

    // Verify conversation exists and belongs to organization
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.organizationId !== orgId) {
      return { isContactTyping: false };
    }

    // Get contact typing status
    const contactStatus = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_and_type", (q) =>
        q.eq("conversationId", args.conversationId).eq("userType", "contact"),
      )
      .first();

    return {
      isContactTyping: contactStatus?.isTyping ?? false,
    };
  },
});

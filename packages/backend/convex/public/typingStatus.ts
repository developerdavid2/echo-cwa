// packages/backend/convex/public/typingStatus.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { ConvexError } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    // Validate contact session
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    // Verify conversation exists and belongs to same organization
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }

    if (conversation.contactSessionId !== args.contactSessionId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Session mismatch",
      });
    }

    // Find existing typing status
    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_and_type", (q) =>
        q.eq("conversationId", args.conversationId).eq("userType", "contact"),
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
        userType: "contact",
        isTyping: args.isTyping,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getTypingStatus = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    // Validate contact session
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession || contactSession.expiresAt < Date.now()) {
      return { isOperatorTyping: false };
    }

    // Get operator typing status
    const operatorStatus = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_and_type", (q) =>
        q.eq("conversationId", args.conversationId).eq("userType", "operator"),
      )
      .first();

    return {
      isOperatorTyping: operatorStatus?.isTyping ?? false,
    };
  },
});

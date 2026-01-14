import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";
import { supportAgent } from "./../system/ai/agents/supportAgent";

export const create = mutation({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session ",
      });
    }

    const { threadId } = await supportAgent.createThread(ctx, {
      userId: args.organizationId,
    });

    await saveMessage(ctx, components.agent, {
      threadId,
      message: {
        role: "assistant",
        content: "Hello, how can I help you today",
      },
    });

    const conversationId = await ctx.db.insert("conversations", {
      contactSessionId: contactSession._id,
      status: "unresolved",
      organizationId: args.organizationId,
      threadId,
    });

    return conversationId;
  },
});

export const getMany = query({
  args: {
    contactSessionId: v.id("contactSessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "invalid session",
      });
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_contact_session_id", (q) =>
        q.eq("contactSessionId", args.contactSessionId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Use Promise.allSettled → we get results even when some promises reject
    const settledResults = await Promise.allSettled(
      conversations.page.map(async (conversation) => {
        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          paginationOpts: { numItems: 1, cursor: null },
        });

        const lastMessage =
          messages.page.length > 0 ? (messages.page[0] ?? null) : null;

        // We return exactly the same shape the public API expects
        return {
          _id: conversation._id,
          _creationTime: conversation._creationTime,
          status: conversation.status,
          organizationId: conversation.organizationId,
          threadId: conversation.threadId,
          lastMessage,
        };
      })
    );

    // Map settled results back to the original order + fallback for failures
    const conversationsWithLastMessage = settledResults.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      const original = conversations.page[index]!; // ← safe assertion

      return {
        _id: original._id,
        _creationTime: original._creationTime,
        status: original.status,
        organizationId: original.organizationId,
        threadId: original.threadId,
        lastMessage: null,
      };
    });
    return {
      ...conversations,
      page: conversationsWithLastMessage,
    };
  },
});

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },

  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

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
        message: "Incorrect session ID",
      });
    }

    return {
      _id: conversation._id,
      status: conversation.status,
      threadId: conversation.threadId,
    };
  },
});

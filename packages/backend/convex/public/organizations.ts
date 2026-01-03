import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});
export const validate = action({
  args: {
    organizationId: v.string(),
  },

  handler: async (ctx, args) => {
    await clerkClient.organizations.getOrganization({
      organizationId: args.organizationId,
    });
    try {
      return { valid: true };
    } catch {
      return { valid: false, reason: "Organization not valid" };
    }
  },
});

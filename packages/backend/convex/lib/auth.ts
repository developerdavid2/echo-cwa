import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

export const requireAuth = async (ctx: AnyCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (identity == null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Identity not found",
    });
  }

  const orgId = identity.orgId as string;

  if (!orgId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found",
    });
  }

  return { identity, orgId };
};

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecretValue, parseSecretString } from "../lib/secrets";

export const getVapiSecrets = action({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationAndService,
      {
        organizationId: args.organizationId,
        service: "vapi",
      },
    );

    if (!plugin) {
      return null;
    }

    const secretName = plugin.secretName;

    let secretData: {
      privateApiKey: string;
      publicApiKey: string;
    } | null = null;

    try {
      const secret = await getSecretValue(secretName);
      secretData = parseSecretString<{
        privateApiKey: string;
        publicApiKey: string;
      }>(secret);
    } catch {
      return null;
    }

    if (
      !secretData ||
      typeof secretData.publicApiKey !== "string" ||
      secretData.publicApiKey.length === 0 ||
      typeof secretData.privateApiKey !== "string" ||
      secretData.privateApiKey.length === 0
    ) {
      return null;
    }

    return {
      publicApiKey: secretData.publicApiKey,
    };
  },
});

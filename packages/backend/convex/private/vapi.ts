import { ConvexError } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecretValue, parseSecretString } from "../lib/secrets";
import { VapiClient } from "@vapi-ai/server-sdk";
import type { VapiAssistant, VapiPhoneNumber } from "../types/vapi";
import { requireAuth } from "../lib/auth";

export const getAssistants = action({
  args: {},
  handler: async (ctx): Promise<VapiAssistant[]> => {
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

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationAndService,
      {
        organizationId: orgId,
        service: "vapi",
      },
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found",
      });
    }

    const secretName = plugin.secretName;
    const secretValue = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secretValue);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Credentials incomplete. Please reconnect to your Vapi account",
      });
    }

    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });

    const assistants = await vapiClient.assistants.list();

    return assistants.map((assistant) => ({
      id: assistant.id,
      name: assistant.name ?? "Unnamed assistant",
      firstMessage: assistant.firstMessage ?? null,
      modelProvider: assistant.model?.model ?? null,
    }));
  },
});
export const getPhoneNumbers = action({
  args: {},
  handler: async (ctx): Promise<VapiPhoneNumber[]> => {
    const { orgId } = await requireAuth(ctx);

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationAndService,
      {
        organizationId: orgId,
        service: "vapi",
      },
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found",
      });
    }

    const secretName = plugin.secretName;
    const secretValue = await getSecretValue(secretName);
    const secretData = parseSecretString<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secretValue);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message:
          "Credentials incomplete. Please reconnect to your Vapi account",
      });
    }

    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });

    const phoneNumbers = await vapiClient.phoneNumbers.list();

    return phoneNumbers.map((phoneNumber) => ({
      id: phoneNumber.id,
      number: phoneNumber.number ?? null,
      name: phoneNumber.name ?? null,
      status: phoneNumber.status ?? null,
      assistantId: phoneNumber.assistantId ?? null,
    }));
  },
});

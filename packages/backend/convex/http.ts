import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { createClerkClient, type WebhookEvent } from "@clerk/backend";
import { internal } from "./_generated/api";

const http = httpRouter();

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Validate the webhook
      const event = await validateRequest(request);

      const { type } = event;
      console.log(`📬 Received webhook: ${type}`);

      switch (type) {
        case "subscription.updated":
          if (event.type === "subscription.updated") {
            const organizationId = event.data.payer?.organization_id;

            if (!organizationId) {
              console.error("Missing organization ID in subscription event");
              return new Response("Missing organization ID", { status: 400 });
            }

            const clerkClient = createClerkClient({
              secretKey: process.env.CLERK_SECRET_KEY!,
            });

            // Update organization membership limits based on subscription
            const newMaxAllowedMemberships =
              event.data.status === "active" ? 5 : 1;

            await clerkClient.organizations.updateOrganization(organizationId, {
              maxAllowedMemberships: newMaxAllowedMemberships,
            });

            // Store subscription status
            await ctx.runMutation(internal.system.subscriptions.upsert, {
              organizationId,
              status: event.data.status,
            });
          }
          break;

        default:
          console.log(`Unhandled webhook event: ${type}`);
      }

      return new Response("Webhook processed", { status: 200 });
    } catch (error) {
      if (error instanceof ConfigError) {
        console.error("Configuration error:", error.message);
        return new Response("Server configuration error", { status: 500 });
      }

      if (error instanceof ValidationError) {
        console.error("Validation error:", error.message);
        return new Response("Invalid webhook signature", { status: 400 });
      }

      // Unknown error - return 500
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ConfigError("CLERK_WEBHOOK_SECRET is not set");
  }

  const payloadString = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  if (
    !svixHeaders["svix-id"] ||
    !svixHeaders["svix-timestamp"] ||
    !svixHeaders["svix-signature"]
  ) {
    throw new ValidationError("Missing required svix headers");
  }

  const wh = new Webhook(webhookSecret);

  try {
    const event = wh.verify(
      payloadString,
      svixHeaders,
    ) as unknown as WebhookEvent;
    return event;
  } catch (error) {
    throw new ValidationError(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export default http;

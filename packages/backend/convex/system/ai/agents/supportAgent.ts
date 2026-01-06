import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";
import { groq } from "@ai-sdk/groq";

export const supportAgent = new Agent(components.agent, {
  chat: groq("llama-3.1-8b-instant"),
  instructions: "You are a helpful customer support assistant.",
});

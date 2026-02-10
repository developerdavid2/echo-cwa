import { cohere } from "@ai-sdk/cohere";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api";
import { SUPPORT_AGENT_PROMPT } from "../constants";

export const supportAgent = new Agent(components.agent, {
  // chat: groq("llama-3.1-8b-instant"),
  chat: cohere("command-a-03-2025"),
  instructions: SUPPORT_AGENT_PROMPT,
});

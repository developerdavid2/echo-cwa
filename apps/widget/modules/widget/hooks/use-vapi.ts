"use client";

import Vapi from "@vapi-ai/web";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { vapiSecretsAtom, widgetSettingsAtom } from "../atoms/widget-atoms";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

// State machine - only ONE of these states can exist at a time
type VapiState =
  | { status: "idle" }
  | { status: "connecting" }
  | {
      status: "connected";
      isSpeaking: boolean;
      transcript: TranscriptMessage[];
    }
  | { status: "error"; error: string };

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [state, setState] = useState<VapiState>({ status: "idle" });

  const vapiSecrets = useAtomValue(vapiSecretsAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);

  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }
    const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setState({
        status: "connected",
        isSpeaking: false,
        transcript: [],
      });
    });

    vapiInstance.on("call-end", () => {
      setState({ status: "idle" });
    });

    vapiInstance.on("speech-start", () => {
      setState((prev) =>
        prev.status === "connected" ? { ...prev, isSpeaking: true } : prev,
      );
    });

    vapiInstance.on("speech-end", () => {
      setState((prev) =>
        prev.status === "connected" ? { ...prev, isSpeaking: false } : prev,
      );
    });

    vapiInstance.on("error", (error) => {
      console.error("VAPI_ERROR:", error);
      setState({ status: "error", error: error.message || "Unknown error" });
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setState((prev) =>
          prev.status === "connected"
            ? {
                ...prev,
                transcript: [
                  ...prev.transcript,
                  {
                    role: message.role === "user" ? "user" : "assistant",
                    text: message.transcript,
                  },
                ],
              }
            : prev,
        );
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, [vapiSecrets]);

  const startCall = () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) {
      return;
    }

    if (state.status === "idle" || state.status === "error") {
      setState({ status: "connecting" });
      vapi?.start(widgetSettings.vapiSettings.assistantId);
    }
  };

  const endCall = () => {
    if (state.status === "connected" || state.status === "connecting") {
      vapi?.stop();
    }
  };

  // Derived computed values for easier consumption
  return {
    // State checks
    isIdle: state.status === "idle",
    isConnecting: state.status === "connecting",
    isConnected: state.status === "connected",
    isError: state.status === "error",

    // Only available when connected
    isSpeaking: state.status === "connected" ? state.isSpeaking : false,
    transcript: state.status === "connected" ? state.transcript : [],

    // Error details
    error: state.status === "error" ? state.error : null,

    // Actions
    startCall,
    endCall,

    // Raw state for advanced usage
    state,
  };
};

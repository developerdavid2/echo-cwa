"use client";

import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { api } from "@workspace/backend/_generated/api";
import { useAction, useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { WidgetHeader } from "../components/widget-header";
import { Id } from "@workspace/backend/_generated/dataModel";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");

  const [sessionValid, setSessionValid] = useState(false);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const loadingMessage = useAtomValue(loadingMessageAtom);

  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);

  const validateOrganization = useAction(api.public.organizations.validate);

  // Validation for the step if there is an organization ID
  useEffect(() => {
    // Early return if not in the right step
    if (step !== "org") return;

    // We can't make useEffect async directly, so we use an IIFE (Immediately Invoked Function Expression)
    (async () => {
      setLoadingMessage("Finding organization ID ...");

      if (!organizationId) {
        setErrorMessage("Organization ID is required");
        setScreen("error");
        return;
      }

      setLoadingMessage("Verifying organization...");

      try {
        const result = await validateOrganization({ organizationId });

        if (result.valid === true) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      } catch {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      }
    })();
  }, [
    step,
    organizationId,
    validateOrganization,
    setLoadingMessage,
    setErrorMessage,
    setScreen,
    setOrganizationId,
  ]);
  // Step 2: Validate session if exists
  const validateContactSession = useMutation(
    api.public.contactSession.validate
  );

  useEffect(() => {
    if (step !== "session") {
      return;
    }

    // Async IIFE
    (async () => {
      setLoadingMessage("Finding contact session ID");

      if (!contactSessionId) {
        setSessionValid(false);
        setStep("done");
        return;
      }

      setLoadingMessage("Validating session...");

      try {
        const result = await validateContactSession({
          contactSessionId: contactSessionId as Id<"contactSessions">,
        });

        setSessionValid(result.valid);
        setStep("done");
      } catch {
        setSessionValid(false);
        setStep("done");
      }
    })();
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);
  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [contactSessionId, sessionValid, setScreen, step]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};

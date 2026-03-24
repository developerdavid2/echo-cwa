import { api } from "@workspace/backend/_generated/api";
import type {
  VapiAssistant,
  VapiPhoneNumber,
} from "@workspace/backend/types/vapi";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PhoneNumbersDTO = VapiPhoneNumber[];
type VapiPhoneNumbersState = "idle" | "loading" | "error" | "success";
let cachedPhoneNumbers: PhoneNumbersDTO | null = null;

export const useVapiPhoneNumbers = (): {
  data: PhoneNumbersDTO;
  state: VapiPhoneNumbersState;
} => {
  const [data, setData] = useState<PhoneNumbersDTO>(cachedPhoneNumbers ?? []);
  const [state, setState] = useState<VapiPhoneNumbersState>(
    cachedPhoneNumbers ? "success" : "idle",
  );

  const getPhoneNumbers = useAction(api.private.vapi.getPhoneNumbers);
  useEffect(() => {
    if (cachedPhoneNumbers) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setState("loading");
        const result = await getPhoneNumbers();
        cachedPhoneNumbers = result;
        if (!isMounted) return;
        setData(result);
        setState("success");
      } catch {
        if (!isMounted) return;
        setState("error");
        toast.error("Failed to fetch phone numbers");
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [getPhoneNumbers]);

  return { data, state };
};

type AssistantsDTO = VapiAssistant[];
type VapiAssistantsState = "idle" | "loading" | "error" | "success";
let cachedAssistants: AssistantsDTO | null = null;

export const resetVapiDataCache = () => {
  cachedPhoneNumbers = null;
  cachedAssistants = null;
};

export const useVapiAssistants = (): {
  data: AssistantsDTO;
  state: VapiAssistantsState;
} => {
  const [data, setData] = useState<AssistantsDTO>(cachedAssistants ?? []);
  const [state, setState] = useState<VapiAssistantsState>(
    cachedAssistants ? "success" : "idle",
  );

  const getAssistants = useAction(api.private.vapi.getAssistants);

  useEffect(() => {
    if (cachedAssistants) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setState("loading");
        const result = await getAssistants();
        cachedAssistants = result;
        if (!isMounted) return;
        setData(result);
        setState("success");
      } catch {
        if (!isMounted) return;
        setState("error");
        toast.error("Failed to fetch assistants");
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [getAssistants]);

  return { data, state };
};

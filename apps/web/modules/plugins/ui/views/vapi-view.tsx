"use client";

import {
  GlobeIcon,
  PhoneCallIcon,
  PhoneIcon,
  WorkflowIcon,
} from "lucide-react";
import { Feature, PluginCard } from "../components/plugin-card";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { VapiPluginForm } from "../components/vapi-form";
const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

export const VapiView = () => {
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const [connectOpen, setConnectOpen] = useState(true);
  const [removeOpen, setRemoveOpen] = useState(false);

  const handleSubmit = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };
  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
            <p className="text-muted-foreground">
              Connect Vapi to enable AI voice calls and phone support
            </p>

            <div className="mt-8">
              {vapiPlugin ? (
                <p>Connected</p>
              ) : (
                <PluginCard
                  serviceImage="/vapi.jpg"
                  serviceName="Vapi"
                  features={vapiFeatures}
                  isDisabled={vapiPlugin === undefined}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
